// Sync v1.0.4 - Multi-provider UI update
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Globe, ChevronDown, User, Menu, X, LogOut, Upload, Link2, Mail, ShieldCheck, ShieldAlert, Trash2, Loader2, ExternalLink } from 'lucide-react';

// Brand Icon: GitHub (Lucide removed brand icons in v0.400+)
const GithubIcon = ({ size = 20 }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const GoogleIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
import UploadModal from './UploadModal';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabaseClient';
import { API_BASE } from '../utils/api';

const getAvatarText = (username) => {
  if (!username) return '?';
  // 提取第一个字符并转为大写（完美兼容中英日文）
  return username.charAt(0).toUpperCase();
};

const Header = ({ searchQuery, setSearchQuery }) => {
  const { lang, setLang, t } = useLanguage();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Auth States
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | 'complete-registration' | null
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '', code: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  // OAuth state
  const [pendingSupabaseToken, setPendingSupabaseToken] = useState(null);
  const [oauthProvider, setOauthProvider] = useState('');
  const [oauthEmail, setOauthEmail] = useState('');
  const [showBindModal, setShowBindModal] = useState(false);
  const [isUserCardOpen, setIsUserCardOpen] = useState(false);
  const cardRef = useRef(null);
  const [unbindLoading, setUnbindLoading] = useState(null); // 'github' | 'google' | null

  // Verification flow (2FA)
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationProviders, setVerificationProviders] = useState([]);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isVerifyingLogin, setIsVerifyingLogin] = useState(false);

  // Email OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0); // seconds remaining
  const [otpSent, setOtpSent] = useState(false);
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [registerOtpCooldown, setRegisterOtpCooldown] = useState(0);

  // Email Bind Modal state
  const [emailBindForm, setEmailBindForm] = useState({
    email: '',
    code: '',
    isExpanded: false,
    loading: false,
    sent: false,
    cooldown: 0
  });
  
  // Email Change state
  const [changeEmailForm, setChangeEmailForm] = useState({
    email: '',
    code: '',
    isExpanded: false,
    loading: false,
    sent: false,
    cooldown: 0
  });
  
  // Login Tab switching
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'

  // MFA (2FA) Detail States
  const [mfaStep, setMfaStep] = useState('select'); // 'select' | 'email-otp'
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMaskedEmail, setMfaMaskedEmail] = useState('');
  const [mfaCooldown, setMfaCooldown] = useState(0);
  const [mfaSent, setMfaSent] = useState(false);

  const handleUnbindEmail = async () => {
    if (!window.confirm(lang === 'zh' ? '确定要解绑邮箱吗？这可能会影响您的账号找回。' : 'Are you sure you want to unbind your email? This may affect account recovery.')) {
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/unbind-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('解绑失败');
      
      const data = await res.json();
      setAuthSuccess(lang === 'zh' ? '邮箱已解绑' : 'Email unbound successfully');
      
      // Update local state
      const updatedUser = { ...currentUser, email: null };
      setCurrentUser(updatedUser);
      localStorage.setItem('user_email', '');
      
      setTimeout(() => setAuthSuccess(''), 3000);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendChangeEmailCode = async () => {
    if (!changeEmailForm.email || !changeEmailForm.email.includes('@')) {
      setAuthError(lang === 'zh' ? '请输入有效的电子邮箱' : 'Please enter a valid email');
      return;
    }
    setChangeEmailForm(prev => ({ ...prev, loading: true }));
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: changeEmailForm.email, intent: 'change_email' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '发送失败');
      
      setChangeEmailForm(prev => ({ ...prev, sent: true, cooldown: 60 }));
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setChangeEmailForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmChangeEmail = async () => {
    if (changeEmailForm.code.length !== 6) return;
    setChangeEmailForm(prev => ({ ...prev, loading: true }));
    setAuthError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/change-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_email: changeEmailForm.email, code: changeEmailForm.code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '更新失败');
      
      setAuthSuccess(lang === 'zh' ? '邮箱已成功更新' : 'Email updated successfully');
      
      // Update local state
      const updatedUser = { ...currentUser, email: changeEmailForm.email };
      setCurrentUser(updatedUser);
      localStorage.setItem('user_email', changeEmailForm.email);
      
      // Reset form
      setChangeEmailForm({ email: '', code: '', isExpanded: false, loading: false, sent: false, cooldown: 0 });
      setTimeout(() => setAuthSuccess(''), 3000);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setChangeEmailForm(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Checks whether the current user is bound to a specific OAuth provider.
   * Handles 3 cases:
   *   1. Explicit provider in bound_providers array (e.g. ['github'])
   *   2. TIER4 fallback: bound_providers contains 'oauth' AND supabase_uid is set
   *      → we know account IS bound but don't have provider detail; show as bound on all rows
   *   3. No binding data → false
   */
  const isBoundTo = useCallback((provider) => {
    const providers = currentUser?.bound_providers || [];
    if (providers.includes(provider)) return true;
    // TIER4 fallback: backend confirmed binding but couldn't determine provider
    if (providers.includes('oauth') && currentUser?.supabase_uid) return true;
    return false;
  }, [currentUser]);

  /** True if the user has ANY bound OAuth provider */
  const hasAnyBinding = !!(
    currentUser?.bound_providers?.length > 0 || currentUser?.supabase_uid
  );

  // Auto-login check on mount + hydrate bound_providers from server
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('user_id');
    const storedIsAdmin = localStorage.getItem('is_admin') === 'true';
    const storedEmail = localStorage.getItem('user_email');
    // Restore bound_providers from localStorage cache first (instant UI, avoids flicker)
    let cachedProviders = [];
    try { cachedProviders = JSON.parse(localStorage.getItem('bound_providers') || '[]'); } catch { cachedProviders = []; }
    
    if (token && storedUsername) {
      setCurrentUser({ 
        username: storedUsername, 
        id: storedUserId ? parseInt(storedUserId, 10) : null,
        is_admin: storedIsAdmin,
        bound_providers: cachedProviders,
        email: storedEmail || null
      });

      // Hydrate real-time bound_providers from server (authoritative source of truth)
      fetch(`${API_BASE}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!data) return;
          // BUGFIX: Array.isArray check — empty array [] is falsy in JS but is valid data
          const providers = Array.isArray(data.bound_providers) ? data.bound_providers : cachedProviders;
          localStorage.setItem('bound_providers', JSON.stringify(providers));
          setCurrentUser(prev => prev ? ({ 
            ...prev, 
            bound_providers: providers,
            supabase_uid: data.supabase_uid || null
          }) : prev);
        })
        .catch(() => { /* silent — keep cached value */ });
    }
    setIsAuthLoading(false);
  }, []);

  // Helper to extract display-safe error strings from any error object
  const extractErrorMessage = useCallback((err) => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    
    // Handle FastAPI / standard API error structures
    if (err.detail) {
      if (Array.isArray(err.detail)) {
        // Standard FastAPI validation error (422)
        return err.detail.map(d => `${d.loc.slice(1).join(' ')}: ${d.msg}`).join('; ');
      }
      if (typeof err.detail === 'string') return err.detail;
      return JSON.stringify(err.detail);
    }
    
    // Fallback to standard error message
    if (err.message) return err.message;
    
    // Stringify unknown objects
    try {
      return JSON.stringify(err);
    } catch {
      return lang === 'zh' ? '发生未知错误' : 'An unknown error occurred';
    }
  }, [lang]);

  // Listen for Supabase auth state changes (handles OAuth redirect callback)
  useEffect(() => {
    if (!supabase) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const token = session.access_token;
        
        // Recover pending intent state from localStorage
        const pendingVerification = localStorage.getItem('pending_verification') === 'true';
        const pendingUsername = localStorage.getItem('pending_username');
        const isBindingOAuth = localStorage.getItem('isBindingOAuth') === 'true';

        const cleanUpIntents = () => {
          localStorage.removeItem('pending_verification');
          localStorage.removeItem('pending_username');
          localStorage.removeItem('isBindingOAuth');
        };

        // CASE 1: Mandatory login verification
        if (pendingVerification || isVerifyingLogin) {
          try {
            setAuthLoading(true);
            const targetUsername = pendingUsername || authForm.username;
            console.log(`[Auth] Starting MFA verification for user: ${targetUsername || 'anonymous'}`);
            
            const res = await fetch(`${API_BASE}/auth/verify-login`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                username: targetUsername || null,
                supabase_token: token 
              })
            });
            
            const data = await res.json();
            if (res.ok && data.status === 'ok') {
              console.log('[Auth] MFA Verification successful. Syncing state...');
              loginWithLocalData(data, false); // Background sync, no reload
              resetVerificationStates();
              cleanUpIntents();
              
              resetVerificationStates();
              cleanUpIntents();
            } else {
              const errMsg = extractErrorMessage(data);
              console.error('[Auth] MFA Verification failed:', errMsg);
              setAuthError(errMsg);
              // Clear sticky state on failure to allow fresh login attempts
              resetVerificationStates();
              cleanUpIntents();
            }
          } catch (err) {
            console.error('[Auth] MFA Handshake Exception:', err);
            setAuthError(extractErrorMessage(err));
            cleanUpIntents();
          } finally {
            setAuthLoading(false);
          }
          return;
        }

        // CASE 2: Account Binding
        if (isBindingOAuth) {
          try {
            const localToken = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE}/auth/bind`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localToken}`
              },
              body: JSON.stringify({ supabase_token: token })
            });
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem('user_email', data.email || '');
              // Refresh bound_providers from /api/users/me
              try {
                const meRes = await fetch(`${API_BASE}/users/me`, {
                  headers: { 'Authorization': `Bearer ${localToken}` }
                });
                if (meRes.ok) {
                  const meData = await meRes.json();
                  const providers = meData.bound_providers || [];
                  localStorage.setItem('bound_providers', JSON.stringify(providers));
                  setCurrentUser(prev => ({
                    ...prev,
                    bound_providers: providers,
                    email: data.email
                  }));
                }
              } catch { /* fallback: keep previous state */ }
              setShowBindModal(false);
              cleanUpIntents();
            } else {
              const errData = await res.json();
              setAuthError(extractErrorMessage(errData));
            }
          } catch (err) {
            console.error('Bind error:', err);
            setAuthError(extractErrorMessage(err));
            cleanUpIntents();
          }
          return;
        }

        // CASE 3: Standard OAuth login or registration
        // ⚠️ CRITICAL GUARD: If user already has a system JWT they are already
        // authenticated via our custom auth system. A residual Supabase session
        // must NOT trigger oauth-login again — that would overwrite bound_providers
        // that were just hydrated from /api/users/me.
        const existingSystemToken = localStorage.getItem('access_token');
        if (existingSystemToken) {
          console.log('[Auth] CASE 3 skipped: user already has system JWT, ignoring residual Supabase session.');
          return;
        }

        try {
          console.log('[Auth] CASE 3: No system JWT found, proceeding with OAuth login flow.');
          const res = await fetch(`${API_BASE}/auth/oauth-login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ supabase_token: token })
          });
          const data = await res.json();
          
          if (data.status === 'ok') {
            loginWithLocalData(data, false); // Background sync, no reload
            cleanUpIntents();
          } else if (data.status === 'needs_registration') {
            setPendingSupabaseToken(token);
            setOauthProvider(data.provider || '');
            setOauthEmail(data.email || '');
            setAuthModal('complete-registration');
          } else {
            setAuthError(extractErrorMessage(data));
          }
        } catch (err) {
          console.error('OAuth login error:', err);
          setAuthError(lang === 'zh' ? '服务器连接失败，请稍后再试' : 'Server connection failed, please try again');
          setAuthModal('login');
          cleanUpIntents();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [lang, isVerifyingLogin, authForm.username, extractErrorMessage]);

  // Auto-close mobile nav on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileNavOpen) setIsMobileNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileNavOpen]);

  // Cooldown timers for Bind and Change Email
  useEffect(() => {
    let timer;
    if (emailBindForm.cooldown > 0) {
      timer = setInterval(() => {
        setEmailBindForm(prev => ({ ...prev, cooldown: Math.max(0, prev.cooldown - 1) }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailBindForm.cooldown]);

  useEffect(() => {
    let timer;
    if (changeEmailForm.cooldown > 0) {
      timer = setInterval(() => {
        setChangeEmailForm(prev => ({ ...prev, cooldown: Math.max(0, prev.cooldown - 1) }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [changeEmailForm.cooldown]);

  // OAuth Login
  const handleOAuthLogin = async (provider) => {
    if (!supabase) {
      setAuthError(lang === 'zh' ? 'OAuth 未配置' : 'OAuth not configured');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    
    // Determine if this is a login verification or a new login
    // Persist intent in localStorage to survive redirect
    if (verificationRequired) {
      setIsVerifyingLogin(true);
      localStorage.setItem('pending_verification', 'true');
      localStorage.setItem('pending_username', authForm.username);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      setIsVerifyingLogin(false);
      localStorage.removeItem('pending_verification');
      localStorage.removeItem('pending_username');
    }
  };

  // Helper to persist local login data
  const loginWithLocalData = (data, shouldReload = true) => {
    // Standard keys for absolute backend JWT
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token', data.access_token); // Alias as requested for robustness
    
    // Nested user data handling
    const user = data.user || data; // Fallback for backward compatibility
    
    localStorage.setItem('username', user.username || '');
    localStorage.setItem('user_id', user.id || '');
    localStorage.setItem('is_admin', user.is_admin ? 'true' : 'false');
    localStorage.setItem('user_email', user.email || '');
    // Persist bound_providers as JSON array
    const providers = user.bound_providers || (user.auth_provider ? [user.auth_provider] : []);
    localStorage.setItem('bound_providers', JSON.stringify(providers));
    
    setCurrentUser({
      username: user.username,
      id: user.id || user.user_id,
      is_admin: !!user.is_admin,
      bound_providers: providers,
      email: user.email
    });
    
    setAuthModal(null);
    setAuthForm({ username: '', password: '', email: '' });
    
    // Force hard reload (only for manual logins) to ensure global state consistency
    if (shouldReload) {
      window.location.reload();
    }
  };

  const resetVerificationStates = () => {
    setVerificationRequired(false);
    setVerificationProviders([]);
    setVerificationEmail('');
    setIsVerifyingLogin(false);
    setMfaStep('select');
    setMfaCode('');
    setMfaSent(false);
    setMfaCooldown(0);
  };

  // ---- Email OTP handlers ----
  const handleSendCode = async () => {
    const email = otpEmail.trim();
    if (!email || !email.includes('@')) {
      setAuthError(t('invalidEmail'));
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, intent: 'login' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '发送失败');
      setOtpSent(true);
      // Start 60-second cooldown
      setOtpCooldown(60);
      const timer = setInterval(() => {
        setOtpCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSendCode = async () => {
    const email = authForm.email.trim();
    if (!email || !email.includes('@')) {
      setAuthError(t('invalidEmail'));
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, intent: 'register' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '发送失败');
      setRegisterOtpSent(true);
      // Start 60-second cooldown
      setRegisterOtpCooldown(60);
      const timer = setInterval(() => {
        setRegisterOtpCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const email = otpEmail.trim();
    const code = otpCode.trim();
    if (!email || !code || code.length !== 6) {
      setAuthError(t('enterOtp'));
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '验证失败');
      // Reuse loginWithLocalData to keep state consistent
      loginWithLocalData(data);
      // Reset OTP state
      setOtpEmail(''); setOtpCode(''); setOtpSent(false); setOtpCooldown(0);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // ---- MFA (2FA) Specific Handlers ----
  const handleSendMfaCode = async () => {
    if (!verificationEmail) return;
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, intent: 'mfa' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '发送失败');
      setMfaSent(true);
      setMfaCooldown(60);
      const timer = setInterval(() => {
        setMfaCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyMfaCode = async () => {
    if (!verificationEmail || !mfaCode || mfaCode.length !== 6) {
      setAuthError(t('enterOtp'));
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: verificationEmail, 
          code: mfaCode,
          username: authForm.username || null
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '验证失败');
      
      if (data.status === 'ok') {
        loginWithLocalData(data);
        resetVerificationStates();
      } else {
        throw new Error(data.detail || '发生未知错误');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Complete OAuth Registration (set username + password)
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!pendingSupabaseToken) return;
    
    setAuthLoading(true);
    setAuthError('');
    
    try {
      const res = await fetch(`${API_BASE}/auth/complete-registration`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pendingSupabaseToken}`
        },
        body: JSON.stringify({
          supabase_token: pendingSupabaseToken,
          username: authForm.username,
          password: authForm.password
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || t('regFail'));
      }
      
      const data = await res.json();
      loginWithLocalData(data);
      setPendingSupabaseToken(null);
    } catch (err) {
      setAuthError(extractErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  // Traditional Auth (username/password)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    
    try {
      if (authModal === 'register') {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: authForm.username.trim(),
            password: authForm.password,
            email: authForm.email.trim().toLowerCase(),
            code: authForm.code.trim()
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw errData;
        }
        setAuthModal('login');
        setAuthSuccess(t('regSuccess'));
      } else if (authModal === 'login') {
        const formData = new URLSearchParams();
        // Mandatory fields for OAuth2PasswordRequestForm
        formData.append('username', authForm.username.trim());
        formData.append('password', authForm.password);
        
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: formData.toString()
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw data;
        }

        if (data.status === 'needs_verification') {
          setVerificationRequired(true);
          setVerificationProviders(data.auth_providers || [data.auth_provider] || []);
          setVerificationEmail(data.email);
          setMfaMaskedEmail(data.masked_email || '');
          setMfaStep('select');
          return;
        }

        loginWithLocalData(data);
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.message === 'Failed to fetch' || (err.message && (err.message.includes('Load failed') || err.message.includes('NetworkError')))) {
        setAuthError(lang === 'zh' ? '服务器正在启动中，请等待约30秒后再试...' : 'Server is waking up, please wait ~30s and try again...');
      } else {
        setAuthError(extractErrorMessage(err));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Bind OAuth to existing account
  const handleBindOAuth = async (provider) => {
    if (!supabase) return;
    
    // Mark this as a binding flow so onAuthStateChange routes to /api/auth/bind
    // instead of the standard OAuth login path.
    localStorage.setItem('isBindingOAuth', 'true');

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      setAuthError(error.message);
      localStorage.removeItem('isBindingOAuth');
    }
  };

  // ---- Email Binding Handlers ----
  const handleSendBindEmailCode = async (e) => {
    if (e) e.preventDefault();
    console.log(">>> 获取验证码按钮被点击，当前邮箱状态值: ", emailBindForm.email);
    const email = emailBindForm.email.trim();
    
    if (!email || !email.includes('@')) {
      alert((t && t('enterValidEmail')) || '请输入有效的邮箱地址，确保包含 @ 符号');
      return;
    }
    
    console.log(">>> 准备发起 API 请求, Payload: ", { email, intent: 'bind_email' });
    
    setAuthError('');
    setEmailBindForm(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, intent: 'bind_email' }),
      });
      
      let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (!res.ok) {
        let errDetail = data.detail || '发送失败';
        if (typeof errDetail !== 'string') errDetail = JSON.stringify(errDetail);
        throw new Error(errDetail);
      }
      
      setEmailBindForm(prev => ({ ...prev, sent: true, cooldown: 60 }));
      setAuthSuccess(t('verificationSent') || '验证码已发送');
      
      const timer = setInterval(() => {
        setEmailBindForm(prev => {
          if (prev.cooldown <= 1) { clearInterval(timer); return { ...prev, cooldown: 0 }; }
          return { ...prev, cooldown: prev.cooldown - 1 };
        });
      }, 1000);
    } catch (err) {
      console.error('Send code error:', err);
      const errMsg = err.message || JSON.stringify(err);
      setAuthError(errMsg);
      alert(`获取验证码失败: ${errMsg}`);
    } finally {
      setEmailBindForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConfirmEmailBind = async (e) => {
    if (e) e.preventDefault();
    const { email, code } = emailBindForm;
    if (!email || !code || code.length !== 6) {
      alert(t('enterOtp'));
      return;
    }
    setAuthError('');
    setEmailBindForm(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/bind-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, code }),
      });
      
      let data = {};
      try {
        data = await res.json();
      } catch (err) {}

      if (!res.ok) {
        let errDetail = data.detail || '绑定失败';
        if (typeof errDetail !== 'string') errDetail = JSON.stringify(errDetail);
        throw new Error(errDetail);
      }
      
      setAuthSuccess(t('bindingSuccess') || '绑定成功');
      localStorage.setItem('user_email', email);
      setCurrentUser(prev => ({ ...prev, email }));
      setEmailBindForm({ email: '', code: '', isExpanded: false, loading: false, sent: false, cooldown: 0 });
    } catch (err) {
      console.error('Confirm bind error:', err);
      const errMsg = err.message || JSON.stringify(err);
      setAuthError(errMsg);
      alert(`绑定邮箱失败: ${errMsg}`);
    } finally {
      setEmailBindForm(prev => ({ ...prev, loading: false }));
    }
  };



  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('bound_providers');
    localStorage.removeItem('user_email');
    setCurrentUser(null);
    
    // Also sign out from Supabase
    if (supabase) {
      await supabase.auth.signOut();
    }
    
    // Force hard redirect to home for a clean state
    window.location.href = '/';
  };

  const openAuthModal = (mode) => {
    setAuthModal(mode);
    setAuthError('');
    setAuthSuccess('');
    setAuthForm({ username: '', password: '', email: '' });
    resetVerificationStates();
  };

  const handleUnbindOAuth = async (provider) => {
    if (!window.confirm(lang === 'zh' ? `确定要解除与 ${provider} 的绑定吗？` : `Are you sure you want to unbind ${provider}?`)) {
      return;
    }

    setUnbindLoading(provider);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/auth/unbind`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ provider })
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh bound_providers from /api/users/me for ground truth
        try {
          const meRes = await fetch(`${API_BASE}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const providers = meData.bound_providers || [];
            localStorage.setItem('bound_providers', JSON.stringify(providers));
            setCurrentUser(prev => ({
              ...prev,
              bound_providers: providers,
              email: providers.length > 0 ? prev.email : null
            }));
          }
        } catch {
          // Fallback: just remove the unbound provider from local state
          setCurrentUser(prev => ({
            ...prev,
            bound_providers: (prev.bound_providers || []).filter(p => p !== provider)
          }));
        }
        
        setAuthSuccess(lang === 'zh' ? '解绑成功' : 'Successfully unlinked');
      } else {
        setAuthError(extractErrorMessage(data));
      }
    } catch (err) {
      setAuthError(extractErrorMessage(err));
    } finally {
      setUnbindLoading(null);
    }
  };

  // Close card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsUserCardOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- OAuth Button Style ----
  const oauthBtnStyle = (bg, textColor = 'white', borderColor = 'transparent') => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '11px 16px', borderRadius: '10px',
    border: borderColor === 'transparent' ? 'none' : `1px solid ${borderColor}`, 
    background: bg, color: textColor,
    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: bg === 'white' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
  });

  return (
    <>
      <style>{`
        @keyframes iosPopIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .ios-dropdown-anim {
          animation: iosPopIn 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
          transform-origin: top right;
        }
      `}</style>
      <header className="header">
        <div className="header-inner container">
          <a href="/" className="logo">
            <div className="logo-icon-wrap">
              <svg viewBox="0 0 24 24" className="logo-icon" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 20 4 4 20 4"></polyline>
                <path d="M4 20 Q12 16 12 12 T20 4"></path>
              </svg>
            </div>
            <span className="logo-text">{t('logoText')}</span>
          </a>

          <div className="header-search">
            <label htmlFor="search-input" className="visually-hidden">Search for theorems</label>
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              id="search-input" 
              placeholder={t('searchPlaceholder')}
              autoComplete="off" 
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="header-actions" style={{ flexWrap: 'nowrap' }}>
            <div className="dropdown" id="lang-switcher">
              <button 
                className="dropdown-trigger btn-ghost" 
                aria-haspopup="true" 
                aria-expanded={isLangDropdownOpen}
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                style={{ padding: '8px', whiteSpace: 'nowrap' }}
              >
                <Globe size={18} />
                <span className="current-lang">{lang === 'zh' ? 'CN' : lang.toUpperCase()}</span>
                <ChevronDown size={14} className="dropdown-arrow" />
              </button>
              <div className={`dropdown-menu ${isLangDropdownOpen ? 'show' : ''}`}>
                <button 
                  className={`dropdown-item ${lang === 'en' ? 'active' : ''}`} 
                  onClick={() => { setLang('en'); setIsLangDropdownOpen(false); }}
                >
                  {t('langEN')}
                </button>
                <button 
                  className={`dropdown-item ${lang === 'zh' ? 'active' : ''}`} 
                  onClick={() => { setLang('zh'); setIsLangDropdownOpen(false); }}
                >
                  {t('langZH')}
                </button>
              </div>
            </div>
            
            {/* Dynamic Sign In / User Profile */}
            {isAuthLoading ? (
              <div style={{ width: '80px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-small" style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
              </div>
            ) : currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', position: 'relative' }}>
                <button 
                  className="btn-ghost" 
                  onClick={() => setShowUploadModal(true)} 
                  title={t('upload')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <Upload size={16} /> <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('upload')}</span>
                </button>
                
                {/* User Trigger */}
                <div 
                  ref={cardRef}
                  onClick={() => setIsUserCardOpen(!isUserCardOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '4px 8px',
                    paddingRight: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: hasAnyBinding ? 'transparent' : '#f3f4f6',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                    maxWidth: '180px'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div 
                    style={{ 
                      /* 1. 强制绝对居中 (修复排版崩溃) */
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      /* 2. 固定尺寸与防挤压 */
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      /* 3. 纯白背景下的立体液态玻璃 (微渐变 + 高光 + 投影) */
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(226, 232, 240, 0.8) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: 'inset 0px 2px 4px rgba(255, 255, 255, 1), inset 0px -2px 4px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(0, 0, 0, 0.06)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      /* 4. 字体样式 */
                      color: '#1e293b', 
                      fontSize: '18px', 
                      fontWeight: '700',
                      lineHeight: '1',
                      userSelect: 'none'
                    }}
                  >
                    {getAvatarText(currentUser.username)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ 
                      fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', 
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      color: 'var(--text-primary)'
                    }}>
                      {currentUser.username}
                    </span>
                    {!hasAnyBinding && (
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ShieldAlert size={10} /> 未绑定
                      </span>
                    )}
                  </div>
                  <ChevronDown size={14} style={{ 
                    opacity: 0.5, 
                    transform: isUserCardOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s'
                  }} />

                  {/* ================= USER CARD DROPDOWN ================= */}
                  {isUserCardOpen && (
                    <div className="ios-dropdown-anim" style={{
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                      width: '280px', background: 'white', borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      border: '1px solid var(--border-color)',
                      padding: '20px', zIndex: 10000,
                      cursor: 'default'
                    }} onClick={e => e.stopPropagation()}>
                      
                      {/* Card Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div 
                          style={{ 
                            /* 1. 强制绝对居中 (修复排版崩溃) */
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            /* 2. 固定尺寸与防挤压 */
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            /* 3. 立体液态玻璃样式 */
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(226, 232, 240, 0.8) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.9)',
                            boxShadow: 'inset 0px 2px 4px rgba(255, 255, 255, 1), inset 0px -2px 4px rgba(0, 0, 0, 0.03), 0px 3px 6px rgba(0, 0, 0, 0.06)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            /* 4. 字体样式 (针对大头像优化) */
                            color: '#1e293b', 
                            fontSize: '24px', 
                            fontWeight: '700',
                            lineHeight: '1',
                            userSelect: 'none'
                          }}
                        >
                          {getAvatarText(currentUser.username)}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.username}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUser.email || 'No email bound'}
                          </div>
                        </div>
                      </div>

                      {/* Account Settings Entry */}
                      <button
                        onClick={() => { setShowBindModal(true); setIsUserCardOpen(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: '10px', marginBottom: '10px',
                          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={16} style={{ color: hasAnyBinding ? '#10b981' : 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>账号设置</span>
                          {hasAnyBinding ? (
                            <span style={{ fontSize: '10px', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>已绑定</span>
                          ) : (
                            <span style={{ fontSize: '10px', color: '#f59e0b', background: '#fffbeb', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>未绑定</span>
                          )}
                        </div>
                        <ExternalLink size={14} style={{ color: 'var(--text-secondary)', opacity: 0.6 }} />
                      </button>

                      {/* Card Footer */}
                      <button 
                        onClick={handleLogout}
                        style={{ 
                          width: '100%', padding: '10px', borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          background: '#fff1f2', color: '#e11d48', border: 'none',
                          fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#ffe4e6'}
                        onMouseOut={e => e.currentTarget.style.background = '#fff1f2'}
                      >
                        <LogOut size={16} /> 退出登录
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button className="btn-primary sign-in-btn" onClick={() => openAuthModal('login')} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                <User size={16} />
                <span>{t('signIn')}</span>
              </button>
            )}
          </nav>
          
          <button 
            className={`mobile-menu-btn ${isMobileNavOpen ? 'active' : ''}`} 
            id="mobile-menu-btn" 
            aria-label="Toggle Navigation"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        <div className={`mobile-nav ${isMobileNavOpen ? 'open' : ''}`} id="mobile-nav">
          <div className="container mobile-nav-inner">
            <div className="header-search mobile-search">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                autoComplete="off"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mobile-actions">
              {currentUser && (
                <button 
                  className="btn-primary mobile-nav-btn" 
                  onClick={() => {
                    setShowUploadModal(true);
                    setIsMobileNavOpen(false);
                  }}
                  style={{ marginBottom: '4px' }}
                >
                  <Upload size={16} /> {t('upload')}
                </button>
              )}
              {/* Account Settings — mobile entry */}
              {currentUser && (
                <button
                  className="btn-outline mobile-nav-btn"
                  onClick={() => {
                    setShowBindModal(true);
                    setIsMobileNavOpen(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}
                >
                  <ShieldCheck size={16} style={{ color: hasAnyBinding ? '#10b981' : 'var(--text-secondary)', flexShrink: 0 }} />
                  {lang === 'zh' ? '账号设置' : 'Account Settings'}
                  {hasAnyBinding ? (
                    <span style={{ fontSize: '10px', color: '#10b981', background: '#ecfdf5', padding: '1px 6px', borderRadius: '10px', fontWeight: 600, lineHeight: '18px' }}>
                      {lang === 'zh' ? '已绑定' : 'Linked'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', color: '#f59e0b', background: '#fffbeb', padding: '1px 6px', borderRadius: '10px', fontWeight: 600, lineHeight: '18px' }}>
                      {lang === 'zh' ? '未绑定' : 'Unlinked'}
                    </span>
                  )}
                </button>
              )}
              <button className="btn-outline mobile-nav-btn" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
                <Globe size={16} /> {t('language')}: {lang === 'zh' ? 'CN' : 'EN'}
              </button>
              {currentUser ? (
                <button className="btn-outline mobile-nav-btn" onClick={handleLogout} style={{ color: 'var(--error-color)' }}>
                  <LogOut size={16} /> {t('logout')} ({currentUser.username})
                </button>
              ) : (
                <button className="btn-primary sign-in-btn mobile-nav-btn" onClick={() => openAuthModal('login')}>
                  <User size={16} /> {t('signIn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== AUTH MODALS ==================== */}

      {/* Login Modal */}
      {authModal === 'login' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '16px', 
            width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--text-primary)' }}>
                {t('loginTitle')}
              </h2>
              <button 
                onClick={() => setAuthModal(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            {authError && (
              <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {authError}
              </div>
            )}
            {authSuccess && (
              <div style={{ padding: '12px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {authSuccess}
              </div>
            )}
            
            {verificationRequired ? (
              <div style={{ marginBottom: '20px' }}>
                {mfaStep === 'select' ? (
                  <>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', textAlign: 'center', color: 'var(--text-primary)' }}>
                      {lang === 'zh' ? '请选择验证方式' : 'Verify your identity'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {verificationProviders.filter(p => p !== 'oauth').map(prov => (
                        <button 
                          key={prov}
                          onClick={() => {
                            if (prov === 'email') {
                              setMfaStep('email-otp');
                              handleSendMfaCode(); // Auto-send code when entering email mfa step
                            } else {
                              handleOAuthLogin(prov);
                            }
                          }} 
                          style={oauthBtnStyle(
                            prov === 'github' ? '#24292e' : prov === 'google' ? 'white' : '#0369a1',
                            prov === 'google' ? '#374151' : 'white',
                            prov === 'google' ? '#d1d5db' : 'transparent'
                          )}
                          onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                          onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                          {prov === 'github' ? <GithubIcon size={20} /> : prov === 'google' ? <GoogleIcon size={20} /> : <Mail size={20} />}
                          <span style={{ marginLeft: '12px' }}>
                            {lang === 'zh' 
                              ? `通过 ${prov === 'email' ? '电子邮箱' : (prov.charAt(0).toUpperCase() + prov.slice(1))} 验证` 
                              : `Verify with ${prov.charAt(0).toUpperCase() + prov.slice(1)}`}
                          </span>
                        </button>
                      ))}
                      {verificationProviders.length === 0 && (
                        <div style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center', padding: '10px', background: '#fee2e2', borderRadius: '8px' }}>
                          {lang === 'zh' ? '无法识别验证渠道，请联系管理员' : 'No verification provider found.'}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                        {lang === 'zh' ? '输入验证码' : 'Enter Verification Code'}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                        {lang === 'zh' ? `验证码已发送至 ${mfaMaskedEmail}` : `Code sent to ${mfaMaskedEmail}`}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '10px' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="••••••"
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                        style={{ 
                          width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', 
                          outline: 'none', fontSize: '18px', textAlign: 'center', letterSpacing: '8px', fontWeight: 700 
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSendMfaCode}
                        disabled={authLoading || mfaCooldown > 0}
                        style={{
                          borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                          background: (authLoading || mfaCooldown > 0) ? '#f1f5f9' : '#f8fafc',
                          color: (authLoading || mfaCooldown > 0) ? '#94a3b8' : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          cursor: (authLoading || mfaCooldown > 0) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {mfaCooldown > 0 ? `${mfaCooldown}s` : (lang === 'zh' ? '重新获取' : 'Resend')}
                      </button>
                    </div>

                    <button
                      onClick={handleVerifyMfaCode}
                      disabled={authLoading || mfaCode.length !== 6}
                      className="btn-primary"
                      style={{ 
                        padding: '12px', borderRadius: '10px', fontSize: '15px', fontWeight: 600,
                        width: '100%', background: 'var(--accent-primary)', color: 'white',
                        opacity: (authLoading || mfaCode.length !== 6) ? 0.6 : 1
                      }}
                    >
                      {authLoading ? (lang === 'zh' ? '验证中...' : 'Verifying...') : (lang === 'zh' ? '完成登录' : 'Complete Login')}
                    </button>

                    <button 
                      onClick={() => setMfaStep('select')}
                      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}
                    >
                      {lang === 'zh' ? '← 返回选择其他方式' : '← Back to options'}
                    </button>
                  </div>
                )}
                
                {mfaStep === 'select' && (
                  <button 
                    onClick={resetVerificationStates}
                    style={{ width: '100%', marginTop: '16px', background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {lang === 'zh' ? '使用其他账号登录' : 'Login with another account'}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* OAuth Buttons */}
                {supabase && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      <button 
                        onClick={() => handleOAuthLogin('github')} 
                        style={oauthBtnStyle('#24292e')}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                      >
                        <GithubIcon size={20} />
                        <span style={{ marginLeft: '12px' }}>{t('loginWithGithub')}</span>
                      </button>
                      <button 
                        onClick={() => handleOAuthLogin('google')}
                        style={oauthBtnStyle('white', '#374151', '#d1d5db')}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#f9fafb';
                          e.currentTarget.style.borderColor = '#9ca3af';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                      >
                        <GoogleIcon size={20} />
                        <span style={{ marginLeft: '12px' }}>{t('loginWithGoogle')}</span>
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', whiteSpace: 'nowrap' }}>{t('orUsePassword')}</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    </div>
                  </>
                )}
                
                
                {/* ──── Segmented Control (Tabs) ──── */}
                {/* iOS 风格滑动切换器（极致稳定性 - 纯内联样式 - 解决坍塌问题） */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  padding: '4px',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  width: '100%',
                  height: '44px',
                  boxSizing: 'border-box'
                }}>
                  
                  {/* 悬浮的物理白色滑块 */}
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    bottom: '4px',
                    left: '4px',
                    width: 'calc(50% - 4px)',
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: loginMethod === 'password' ? 'translateX(0)' : 'translateX(100%)',
                    zIndex: 0
                  }}></div>

                  {/* 密码登录按钮 */}
                  <button
                    type="button"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      flex: 1,
                      padding: 0,
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      textAlign: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      color: loginMethod === 'password' ? '#1e293b' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => setLoginMethod('password')}
                  >
                    {lang === 'zh' ? '密码登录' : 'Password'}
                  </button>

                  {/* 验证码登录按钮 */}
                  <button
                    type="button"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      flex: 1,
                      padding: 0,
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      textAlign: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease',
                      color: loginMethod === 'otp' ? '#1e293b' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => setLoginMethod('otp')}
                  >
                    {lang === 'zh' ? '验证码登录' : 'Email OTP'}
                  </button>
                </div>

                {loginMethod === 'password' ? (
                  /* Traditional Password Login Form */
                  <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>{t('username')}</label>
                      <input 
                        type="text" 
                        value={authForm.username}
                        onChange={e => setAuthForm({...authForm, username: e.target.value})}
                        required
                        autoFocus
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>{t('password')}</label>
                      <input 
                        type="password" 
                        value={authForm.password}
                        onChange={e => setAuthForm({...authForm, password: e.target.value})}
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn-primary btn-lg" 
                      disabled={authLoading || !authForm.username || !authForm.password} 
                      style={{ 
                        marginTop: '8px', 
                        width: '100%', 
                        justifyContent: 'center', 
                        opacity: (authLoading || !authForm.username || !authForm.password) ? 0.6 : 1,
                        cursor: (authLoading || !authForm.username || !authForm.password) ? 'not-allowed' : 'pointer',
                        borderRadius: '999px'
                      }}
                    >
                      {authLoading ? (lang === 'zh' ? '请稍候...' : 'Please wait...') : (lang === 'zh' ? '登录' : 'Login')}
                    </button>
                  </form>
                ) : (
                  /* Email OTP Section (Refactored to Reference Image) */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Row 1: Email Address */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                        {lang === 'zh' ? '邮箱地址' : 'Email Address'}
                      </label>
                      <input
                        id="otp-email-input"
                        type="email"
                        placeholder={lang === 'zh' ? '请输入邮箱' : 'Enter email'}
                        value={otpEmail}
                        onChange={e => { setOtpEmail(e.target.value); setAuthError(''); }}
                        style={{ 
                          width: '100%', 
                          padding: '10px 14px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--border-color)', 
                          outline: 'none', 
                          fontSize: '14px' 
                        }}
                      />
                    </div>

                    {/* Row 2: Verification Code + Send Button */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                        {lang === 'zh' ? '验证码' : 'Verification Code'}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: '10px', width: '100%' }}>
                        <input
                          id="otp-code-input"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder={lang === 'zh' ? '请输入验证码' : '6-digit code'}
                          value={otpCode}
                          onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setAuthError(''); }}
                          style={{ 
                            width: '100%', 
                            padding: '10px 14px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            outline: 'none', 
                            fontSize: '14px',
                            textAlign: otpSent ? 'center' : 'left',
                            letterSpacing: otpSent ? '4px' : 'normal'
                          }}
                        />
                        <button
                          id="otp-send-btn"
                          type="button"
                          onClick={handleSendCode}
                          disabled={authLoading || otpCooldown > 0}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            background: (authLoading || otpCooldown > 0) ? '#f1f5f9' : '#0284c7',
                            color: (authLoading || otpCooldown > 0) ? '#94a3b8' : 'white',
                            border: 'none',
                            cursor: (authLoading || otpCooldown > 0) ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            boxShadow: (authLoading || otpCooldown > 0) ? 'none' : '0 2px 4px rgba(2, 132, 199, 0.15)'
                          }}
                        >
                          {otpCooldown > 0 ? `${otpCooldown}s` : (lang === 'zh' ? '获取验证码' : 'Send Code')}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="otp-verify-btn"
                      onClick={handleVerifyCode}
                      disabled={authLoading || otpCode.length !== 6 || !otpSent}
                      className="btn-primary btn-lg"
                      style={{ 
                        marginTop: '8px',
                        width: '100%',
                        justifyContent: 'center', 
                        opacity: (authLoading || otpCode.length !== 6 || !otpSent) ? 0.6 : 1, 
                        cursor: (authLoading || otpCode.length !== 6 || !otpSent) ? 'not-allowed' : 'pointer',
                        borderRadius: '999px'
                      }}
                    >
                      {lang === 'zh' ? '登录' : 'Login'}
                    </button>
                  </div>
                )}

              </>
            )}

            
            <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {t('noAccount')}
              <button 
                type="button"
                onClick={() => openAuthModal('register')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, padding: 0 }}
              >
                {t('signUpLink')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal - New Email OTP Flow */}
      {authModal === 'register' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '16px', 
            width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {t('registerTitle')}
              </h2>
              <button 
                onClick={() => setAuthModal(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            {authError && (
              <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {authError}
              </div>
            )}

            {/* OAuth Registration Options */}
            {supabase && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <button 
                  onClick={() => handleOAuthLogin('github')} 
                  style={oauthBtnStyle('#24292e')}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  <GithubIcon size={20} />
                  <span style={{ marginLeft: '12px' }}>{t('registerWithGithub')}</span>
                </button>
                <button 
                  onClick={() => handleOAuthLogin('google')}
                  style={oauthBtnStyle('white', '#374151', '#d1d5db')}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                >
                  <GoogleIcon size={20} />
                  <span style={{ marginLeft: '12px' }}>{t('registerWithGoogle')}</span>
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '15px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>{t('orUsePassword')}</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>
              </div>
            )}
            
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>{t('username')}</label>
                <input 
                  type="text" 
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value})}
                  required
                  placeholder={lang === 'zh' ? '设置登录用户名' : 'Set your username'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>{t('password')}</label>
                <input 
                  type="password" 
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  required
                  placeholder={lang === 'zh' ? '设置登录密码' : 'Set your password'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>

              {/* Email OTP Section (Refactored to Reference Image) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Row 1: Email Address */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                    {lang === 'zh' ? '邮箱地址' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                    required
                    placeholder={lang === 'zh' ? '请输入邮箱' : 'Enter email'}
                    style={{ 
                      width: '100%', 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      outline: 'none', 
                      fontSize: '14px' 
                    }}
                  />
                </div>

                {/* Row 2: Verification Code + Send Button */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                    {lang === 'zh' ? '验证码' : 'Verification Code'}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: '10px', width: '100%' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder={lang === 'zh' ? '请输入验证码' : '6-digit code'}
                      value={authForm.code}
                      onChange={e => setAuthForm({...authForm, code: e.target.value.replace(/\D/g, '')})}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-color)', 
                        outline: 'none', 
                        fontSize: '14px',
                        textAlign: registerOtpSent ? 'center' : 'left',
                        letterSpacing: registerOtpSent ? '4px' : 'normal'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRegisterSendCode}
                      disabled={authLoading || registerOtpCooldown > 0}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: (authLoading || registerOtpCooldown > 0) ? '#f1f5f9' : '#0284c7',
                        color: (authLoading || registerOtpCooldown > 0) ? '#94a3b8' : 'white',
                        border: 'none',
                        cursor: (authLoading || registerOtpCooldown > 0) ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        boxShadow: (authLoading || registerOtpCooldown > 0) ? 'none' : '0 2px 4px rgba(2, 132, 199, 0.15)'
                      }}
                    >
                      {registerOtpCooldown > 0 ? t('resendAfter').replace('{s}', registerOtpCooldown) : (lang === 'zh' ? '获取验证码' : 'Send Code')}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-lg" 
                disabled={authLoading || (registerOtpSent && authForm.code.length !== 6)} 
                style={{ 
                  marginTop: '12px', width: '100%', justifyContent: 'center', 
                  opacity: (authLoading || (registerOtpSent && authForm.code.length !== 6)) ? 0.7 : 1 
                }}
              >
                {authLoading ? t('loading') : t('continueBtn')}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              {t('hasAccount')}
              <button 
                type="button"
                onClick={() => openAuthModal('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0, marginLeft: '4px' }}
              >
                {t('signInLink')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Registration Modal */}
      {authModal === 'complete-registration' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '16px', 
            width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
                {t('completeRegTitle')}
              </h2>
              <button 
                onClick={() => { setAuthModal(null); setPendingSupabaseToken(null); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '12px 16px', background: '#dcfce7', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{oauthProvider === 'github' ? '🐙' : '📧'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#15803d' }}>
                  {oauthProvider === 'github' ? 'GitHub' : 'Google'} {t('verifiedSuccess')}
                </div>
                {oauthEmail && <div style={{ fontSize: '13px', color: '#16a34a' }}>{oauthEmail}</div>}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
              {t('completeRegDesc')}
            </p>

            {authError && (
              <div style={{ padding: '12px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {authError}
              </div>
            )}
            
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>{t('username')}</label>
                <input 
                  type="text" 
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value})}
                  required
                  autoFocus
                  placeholder={lang === 'zh' ? '设置登录用户名' : 'Set your username'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>{t('password')}</label>
                <input 
                  type="password" 
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  required
                  placeholder={lang === 'zh' ? '设置登录密码' : 'Set your password'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>
              <button type="submit" className="btn-primary btn-lg" disabled={authLoading} style={{ marginTop: '8px', width: '100%', justifyContent: 'center', opacity: authLoading ? 0.7 : 1 }}>
                {authLoading ? (lang === 'zh' ? '请稍候...' : 'Please wait...') : t('finishRegistration')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      {showBindModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.45)', zIndex: 9999, backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowBindModal(false)}>
          <div style={{
            background: 'white', borderRadius: '20px',
            width: '90%', maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.18)',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{
              padding: '24px 28px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>账号设置</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>管理您的第三方登录绑定</p>
              </div>
              <button
                onClick={() => setShowBindModal(false)}
                style={{
                  background: '#f1f5f9', border: 'none', cursor: 'pointer',
                  width: '32px', height: '32px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', transition: 'background 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Provider List */}
            <div style={{ padding: '20px 28px' }}>

              {/* Error / Success banners */}
              {authError && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div style={{ padding: '10px 14px', background: '#dcfce7', color: '#16a34a', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
                  {authSuccess}
                </div>
              )}

              {/* Providers section label */}
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                已支持的第三方账号
              </div>

              {/* GitHub Row */}
              {[{ key: 'github', label: 'GitHub', icon: <GithubIcon size={20} />, color: '#24292e' },
                { key: 'google', label: 'Google', icon: <GoogleIcon size={20} />, color: '#ffffff' },
                { key: 'email', label: t('email'), icon: <Mail size={20} />, color: '#10b981' }]
                .map(({ key, label, icon, color }) => {
                  const isBound = key === 'email' ? (!!currentUser?.email && currentUser.email.includes('@')) : isBoundTo(key);
                  return (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderRadius: '12px',
                      background: isBound ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${isBound ? '#bbf7d0' : '#e2e8f0'}`,
                      transition: 'all 0.2s'
                    }}>
                      {/* Left: icon + name + badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: isBound ? color : '#e2e8f0',
                          color: isBound ? 'white' : '#94a3b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}>
                          {icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{label}</div>
                          {isBound ? (
                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500 }}>
                              {key === 'email' ? currentUser.email : t('boundTo')}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t('notBound')}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Right: action button */}
                      {key === 'email' ? (
                        isBound ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setChangeEmailForm(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
                                setEmailBindForm(prev => ({ ...prev, isExpanded: false }));
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 12px', borderRadius: '8px',
                                background: '#f1f5f9', color: 'var(--text-primary)',
                                border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 500,
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                              onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                            >
                              {lang === 'zh' ? '更换' : 'Change'}
                            </button>
                            <button
                              onClick={handleUnbindEmail}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '7px 12px', borderRadius: '8px',
                                background: 'white', border: '1px solid #fca5a5',
                                color: '#ef4444', fontSize: '12px', fontWeight: 500,
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                              onMouseOut={e => e.currentTarget.style.background = 'white'}
                            >
                              <Trash2 size={13} />
                              {lang === 'zh' ? '解绑' : 'Unbind'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEmailBindForm(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
                              setChangeEmailForm(prev => ({ ...prev, isExpanded: false }));
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '7px 14px', borderRadius: '8px',
                              background: color, color: 'white',
                              border: 'none', fontSize: '13px', fontWeight: 500,
                              cursor: 'pointer', transition: 'opacity 0.15s'
                            }}
                          >
                            <Link2 size={14} />
                            {t('bindAccount')}
                          </button>
                        )
                      ) : (
                        isBound ? (
                          <button
                            onClick={() => handleUnbindOAuth(key)}
                            disabled={unbindLoading === key}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '7px 14px', borderRadius: '8px',
                              background: 'white', border: '1px solid #fca5a5',
                              color: '#ef4444', fontSize: '13px', fontWeight: 500,
                              cursor: unbindLoading === key ? 'not-allowed' : 'pointer',
                              opacity: unbindLoading === key ? 0.6 : 1,
                              transition: 'all 0.15s'
                            }}
                          >
                            {unbindLoading === key ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            {lang === 'zh' ? '解绑' : 'Unlink'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBindOAuth(key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '7px 14px', borderRadius: '8px',
                              background: color, 
                              color: key === 'google' ? '#374151' : 'white',
                              border: key === 'google' ? '1px solid #d1d5db' : 'none',
                              fontSize: '13px', fontWeight: 500,
                              cursor: 'pointer', transition: 'opacity 0.15s'
                            }}
                          >
                            <Link2 size={14} />
                            {t('bindAccount')}
                          </button>
                        )
                      )}
                    </div>

                    {/* Email Bind Expanded Form */}
                    {key === 'email' && emailBindForm.isExpanded && (
                      <div style={{
                        marginTop: '8px', padding: '16px', background: '#f8fafc',
                        borderRadius: '12px', border: '1px solid #e2e8f0',
                        display: 'flex', flexDirection: 'column', gap: '12px'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {lang === 'zh' ? '绑定新邮箱' : 'Bind new email'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="email" 
                            placeholder={t('email')}
                            value={emailBindForm.email}
                            onChange={e => {
                              const val = e.target.value;
                              setEmailBindForm(prev => ({...prev, email: val}));
                            }}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                          />
                          <button
                            onClick={handleSendBindEmailCode}
                            disabled={emailBindForm.loading || emailBindForm.cooldown > 0}
                            style={{ 
                              padding: '8px 12px', borderRadius: '8px', background: 'white', border: '1px solid var(--border-color)', 
                              fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                              color: emailBindForm.cooldown > 0 ? '#94a3b8' : 'var(--text-primary)'
                            }}
                          >
                            {emailBindForm.cooldown > 0 ? `${emailBindForm.cooldown}s` : t('getCode')}
                          </button>
                        </div>
                        {emailBindForm.sent && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              placeholder={t('verificationCodePlaceholder')}
                              value={emailBindForm.code}
                              onChange={e => {
                                const val = e.target.value;
                                setEmailBindForm(prev => ({...prev, code: val}));
                              }}
                              maxLength={6}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                            />
                            <button
                              onClick={handleConfirmEmailBind}
                              disabled={emailBindForm.loading || emailBindForm.code.length !== 6}
                              style={{ 
                                padding: '8px 16px', borderRadius: '8px', background: '#10b981', color: 'white', 
                                border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              {emailBindForm.loading ? <Loader2 size={14} className="animate-spin" /> : t('bindConfirm')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Email Change Expanded Form */}
                    {key === 'email' && changeEmailForm.isExpanded && (
                      <div style={{
                        marginTop: '8px', padding: '16px', background: '#f8fafc',
                        borderRadius: '12px', border: '1px solid #e2e8f0',
                        display: 'flex', flexDirection: 'column', gap: '12px'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {lang === 'zh' ? '更换新邮箱' : 'Change to new email'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="email" 
                            placeholder={lang === 'zh' ? '新邮箱地址' : 'New email address'}
                            value={changeEmailForm.email}
                            onChange={e => {
                              const val = e.target.value;
                              setChangeEmailForm(prev => ({...prev, email: val}));
                            }}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                          />
                          <button
                            onClick={handleSendChangeEmailCode}
                            disabled={changeEmailForm.loading || changeEmailForm.cooldown > 0}
                            style={{ 
                              padding: '8px 12px', borderRadius: '8px', background: 'white', border: '1px solid var(--border-color)', 
                              fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap',
                              color: changeEmailForm.cooldown > 0 ? '#94a3b8' : 'var(--text-primary)'
                            }}
                          >
                            {changeEmailForm.cooldown > 0 ? `${changeEmailForm.cooldown}s` : t('getCode')}
                          </button>
                        </div>
                        {changeEmailForm.sent && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              placeholder={t('verificationCodePlaceholder')}
                              value={changeEmailForm.code}
                              onChange={e => {
                                const val = e.target.value;
                                setChangeEmailForm(prev => ({...prev, code: val}));
                              }}
                              maxLength={6}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px' }}
                            />
                            <button
                              onClick={handleConfirmChangeEmail}
                              disabled={changeEmailForm.loading || changeEmailForm.code.length !== 6}
                              style={{ 
                                padding: '8px 16px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', 
                                border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              {changeEmailForm.loading ? <Loader2 size={14} className="animate-spin" /> : (lang === 'zh' ? '确认更换' : 'Confirm')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ); })}

              {/* Security note */}
              <div style={{
                marginTop: '16px', padding: '12px 14px',
                background: '#f8fafc', borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6
              }}>
                <ShieldCheck size={13} style={{ display: 'inline', marginRight: '5px', color: '#10b981', verticalAlign: 'middle' }} />
                绑定第三方账号后，您可以使用该账号快捷登录，并享受双重身份验证保护。
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            window.dispatchEvent(new Event('videoUploaded'));
          }}
        />
      )}
    </>
  );
};

export default Header;
