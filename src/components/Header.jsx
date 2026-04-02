// Sync v1.0.4 - Multi-provider UI update
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Globe, ChevronDown, User, Menu, X, LogOut, Upload, Link2, Mail, ShieldCheck, ShieldAlert, Trash2, Loader2, ExternalLink } from 'lucide-react';

// Brand Icon: GitHub (Lucide removed brand icons in v0.400+)
const GithubIcon = ({ size = 20 }) => (
  <svg height={size} width={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
import UploadModal from './UploadModal';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../utils/supabaseClient';
import { API_BASE } from '../utils/api';

const Header = ({ searchQuery, setSearchQuery }) => {
  const { lang, setLang, t } = useLanguage();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | 'complete-registration' | null
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
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
              loginWithLocalData(data);
              resetVerificationStates();
              cleanUpIntents();
              
              // Force hard reload to ensure UI state is fully updated cross-components
              setTimeout(() => {
                window.location.reload();
              }, 100);
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
        try {
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
            loginWithLocalData(data);
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
      if (window.innerWidth > 768 && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileNavOpen]);

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
  const loginWithLocalData = (data) => {
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
  };

  const resetVerificationStates = () => {
    setVerificationRequired(false);
    setVerificationProviders([]);
    setVerificationEmail('');
    setIsVerifyingLogin(false);
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
            email: authForm.email || null
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
  const oauthBtnStyle = (bg, hover) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '11px 16px', borderRadius: '10px',
    border: '1px solid var(--border-color)', background: bg, color: 'white',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  return (
    <>
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
            {currentUser ? (
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
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'var(--primary)', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 'bold', fontSize: '14px', flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {currentUser.username[0].toUpperCase()}
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
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                      width: '280px', background: 'white', borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      border: '1px solid var(--border-color)',
                      padding: '20px', zIndex: 10000,
                      animation: 'fadeInUp 0.2s ease-out',
                      cursor: 'default'
                    }} onClick={e => e.stopPropagation()}>
                      
                      {/* Card Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ 
                          width: '48px', height: '48px', borderRadius: '50%', 
                          background: 'var(--primary)', color: 'white', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontWeight: 'bold', fontSize: '20px'
                        }}>
                          {currentUser.username[0].toUpperCase()}
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

                      {/* Binding Section */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          账号绑定
                        </div>
                        
                        {/* GitHub Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <GithubIcon size={18} />
                            <span>GitHub</span>
                            {isBoundTo('github') ? (
                              <span style={{ fontSize: '10px', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>已绑定</span>
                            ) : (
                              <span style={{ fontSize: '10px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>未绑定</span>
                            )}
                          </div>
                          {isBoundTo('github') ? (
                            <button 
                              onClick={() => handleUnbindOAuth('github')}
                              disabled={unbindLoading === 'github'}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                              title="解除绑定"
                            >
                              {unbindLoading === 'github' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setShowBindModal(true); setIsUserCardOpen(false); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}
                            >
                              绑定
                            </button>
                          )}
                        </div>

                        {/* Google Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            <Mail size={18} />
                            <span>Google</span>
                            {isBoundTo('google') ? (
                              <span style={{ fontSize: '10px', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>已绑定</span>
                            ) : (
                              <span style={{ fontSize: '10px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>未绑定</span>
                            )}
                          </div>
                          {isBoundTo('google') ? (
                            <button 
                              onClick={() => handleUnbindOAuth('google')}
                              disabled={unbindLoading === 'google'}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                              title="解除绑定"
                            >
                              {unbindLoading === 'google' ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setShowBindModal(true); setIsUserCardOpen(false); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}
                            >
                              绑定
                            </button>
                          )}
                        </div>
                      </div>

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
                <div style={{ 
                   padding: '16px', background: 'rgba(59, 130, 246, 0.1)', 
                   borderRadius: '12px', color: 'var(--primary)', border: '1px solid var(--primary)',
                   marginBottom: '16px', fontSize: '14px', lineHeight: 1.5,
                   display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{ fontSize: '24px' }}>🛡️</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t('verificationRequiredTitle')}</div>
                    <div style={{ marginTop: '4px' }}>
                      {lang === 'zh' 
                        ? `请使用您已绑定的账号进行身份验证 (${verificationProviders.join(', ')})`
                        : `Please verify your identity using one of your linked accounts (${verificationProviders.join(', ')})`}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {verificationProviders.map(prov => (
                    <button 
                      key={prov}
                      onClick={() => handleOAuthLogin(prov)} 
                      style={oauthBtnStyle(prov === 'github' ? '#24292e' : '#4285f4')}
                    >
                      {prov === 'github' ? <GithubIcon size={20} /> : <Mail size={20} />}
                      {lang === 'zh' 
                        ? `通过 ${prov.charAt(0).toUpperCase() + prov.slice(1)} 验证身份` 
                        : `Verify with ${prov.charAt(0).toUpperCase() + prov.slice(1)}`}
                    </button>
                  ))}
                </div>
                
                <button 
                   onClick={resetVerificationStates}
                   style={{ width: '100%', marginTop: '16px', background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {lang === 'zh' ? '使用其他账号登录' : 'Login with another account'}
                </button>
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
                        {t('loginWithGithub')}
                      </button>
                      <button 
                        onClick={() => handleOAuthLogin('google')}
                        style={{ ...oauthBtnStyle('#4285f4'), }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Mail size={20} />
                        {t('loginWithGoogle')}
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', whiteSpace: 'nowrap' }}>{t('orUsePassword')}</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    </div>
                  </>
                )}
                
                {/* Traditional Login Form */}
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
                  <button type="submit" className="btn-primary btn-lg" disabled={authLoading} style={{ marginTop: '8px', width: '100%', justifyContent: 'center', opacity: authLoading ? 0.7 : 1 }}>
                    {authLoading ? (lang === 'zh' ? '请稍候...' : 'Please wait...') : t('continueBtn')}
                  </button>
                </form>
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

      {/* Register Modal - Step 1: Choose OAuth method */}
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
              <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--text-primary)' }}>
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

            {/* OAuth Registration */}
            {supabase && (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
                  {t('registerStep1Desc')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => handleOAuthLogin('github')} 
                    style={oauthBtnStyle('#24292e')}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Github size={20} />
                    {t('registerWithGithub')}
                  </button>
                  <button 
                    onClick={() => handleOAuthLogin('google')}
                    style={oauthBtnStyle('#4285f4')}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    <Mail size={20} />
                    {t('registerWithGoogle')}
                  </button>
                </div>
                
                <div style={{ 
                  padding: '16px', background: 'var(--bg-secondary)', 
                  borderRadius: '12px', color: 'var(--text-secondary)',
                  marginTop: '10px', fontSize: '13px', lineHeight: 1.6, border: '1px dashed var(--border-color)'
                }}>
                  💡 {t('registrationDisabled')}
                </div>
              </>
            )}
            
            <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
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

      {/* Complete Registration Modal - Step 2: Set username + password after OAuth */}
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
              <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>
                {t('completeRegTitle')}
              </h2>
              <button 
                onClick={() => { setAuthModal(null); setPendingSupabaseToken(null); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Success badge */}
            <div style={{ 
              padding: '12px 16px', background: '#dcfce7', borderRadius: '10px', 
              marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>{oauthProvider === 'github' ? '🐙' : '📧'}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#15803d' }}>
                  {oauthProvider === 'github' ? 'GitHub' : 'Google'} {t('verifiedSuccess')}
                </div>
                {oauthEmail && (
                  <div style={{ fontSize: '13px', color: '#16a34a' }}>{oauthEmail}</div>
                )}
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
            
            <form onSubmit={handleCompleteRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>{t('username')}</label>
                <input 
                  type="text" 
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value})}
                  required
                  autoFocus
                  placeholder={t('usernamePlaceholder')}
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
                  minLength={6}
                  placeholder={t('passwordPlaceholder')}
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

      {/* Bind OAuth Modal */}
      {showBindModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '16px', 
            width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>
                {t('bindAccountTitle')}
              </h2>
              <button 
                onClick={() => setShowBindModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              {t('bindAccountDesc')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => handleBindOAuth('github')} 
                style={oauthBtnStyle('#24292e')}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <GithubIcon size={20} />
                {t('bindGithub')}
              </button>
              <button 
                onClick={() => handleBindOAuth('google')}
                style={oauthBtnStyle('#4285f4')}
                onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <Mail size={20} />
                {t('bindGoogle')}
              </button>
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
