import React, { useState, useEffect, useCallback } from 'react';
import { Search, Globe, ChevronDown, User, Menu, X, LogOut, Upload, Link2, Mail } from 'lucide-react';

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
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  
  // OAuth state
  const [pendingSupabaseToken, setPendingSupabaseToken] = useState(null);
  const [oauthProvider, setOauthProvider] = useState('');
  const [oauthEmail, setOauthEmail] = useState('');
  const [showBindModal, setShowBindModal] = useState(false);

  // Auto-login check on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('user_id');
    const storedIsAdmin = localStorage.getItem('is_admin') === 'true';
    const storedProvider = localStorage.getItem('auth_provider');
    const storedEmail = localStorage.getItem('user_email');
    if (token && storedUsername) {
      setCurrentUser({ 
        username: storedUsername, 
        id: storedUserId ? parseInt(storedUserId, 10) : null,
        is_admin: storedIsAdmin,
        auth_provider: storedProvider || null,
        email: storedEmail || null
      });
    }
  }, []);

  // Listen for Supabase auth state changes (handles OAuth redirect callback)
  useEffect(() => {
    if (!supabase) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User just completed OAuth - check if they have a linked local account
        const token = session.access_token;
        try {
          const res = await fetch(`${API_BASE}/auth/oauth-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supabase_token: token })
          });
          const data = await res.json();
          
          if (data.status === 'ok') {
            // Existing linked account - log them in
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('user_id', data.user_id);
            localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
            localStorage.setItem('auth_provider', data.auth_provider || '');
            localStorage.setItem('user_email', data.email || '');
            setCurrentUser({
              username: data.username,
              id: data.user_id,
              is_admin: !!data.is_admin,
              auth_provider: data.auth_provider,
              email: data.email
            });
            setAuthModal(null);
          } else if (data.status === 'needs_registration') {
            // New OAuth user - show complete registration form
            setPendingSupabaseToken(token);
            setOauthProvider(data.provider || '');
            setOauthEmail(data.email || '');
            setAuthModal('complete-registration');
          }
        } catch (err) {
          console.error('OAuth login error:', err);
          setAuthError(lang === 'zh' ? '服务器连接失败，请稍后再试' : 'Server connection failed, please try again');
          setAuthModal('login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [lang]);

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
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
    // If successful, the page will redirect. onAuthStateChange handles the callback.
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
        headers: { 'Content-Type': 'application/json' },
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
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
      localStorage.setItem('auth_provider', data.auth_provider || '');
      localStorage.setItem('user_email', data.email || '');
      setCurrentUser({
        username: data.username,
        id: data.user_id,
        is_admin: !!data.is_admin,
        auth_provider: data.auth_provider,
        email: data.email
      });
      setAuthModal(null);
      setAuthForm({ username: '', password: '' });
      setPendingSupabaseToken(null);
    } catch (err) {
      setAuthError(err.message);
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
            username: authForm.username,
            password: authForm.password
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || t('regFail'));
        }
        setAuthModal('login');
        setAuthSuccess(t('regSuccess'));
      } else if (authModal === 'login') {
        const formData = new URLSearchParams();
        formData.append('username', authForm.username);
        formData.append('password', authForm.password);
        
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || t('loginFail'));
        }
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('username', authForm.username);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('is_admin', data.is_admin ? 'true' : 'false');
        localStorage.setItem('auth_provider', data.auth_provider || '');
        localStorage.setItem('user_email', data.email || '');
        setCurrentUser({ 
          username: authForm.username, 
          id: data.user_id, 
          is_admin: !!data.is_admin,
          auth_provider: data.auth_provider || null,
          email: data.email || null
        });
        setAuthModal(null);
        setAuthForm({ username: '', password: '' });
      }
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.message.includes('Load failed') || err.message.includes('NetworkError')) {
        setAuthError(lang === 'zh' ? '服务器正在启动中，请等待约30秒后再试...' : 'Server is waking up, please wait ~30s and try again...');
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Bind OAuth to existing account
  const handleBindOAuth = async (provider) => {
    if (!supabase) return;
    
    // First sign in with OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '?bind=true'
      }
    });
    
    if (error) {
      setAuthError(error.message);
    }
  };

  // Check URL params for bind flow on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('bind') === 'true' && supabase) {
      // We're returning from OAuth bind flow
      const handleBind = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && currentUser) {
          try {
            const localToken = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE}/auth/bind`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localToken}`
              },
              body: JSON.stringify({ supabase_token: session.access_token })
            });
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem('auth_provider', data.auth_provider || '');
              localStorage.setItem('user_email', data.email || '');
              setCurrentUser(prev => ({
                ...prev,
                auth_provider: data.auth_provider,
                email: data.email
              }));
              setShowBindModal(false);
            }
          } catch (err) {
            console.error('Bind error:', err);
          }
        }
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      };
      handleBind();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('auth_provider');
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
    setAuthForm({ username: '', password: '' });
  };

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                <button 
                  className="btn-ghost" 
                  onClick={() => setShowUploadModal(true)} 
                  title={t('upload')} 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <Upload size={16} /> <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>{t('upload')}</span>
                </button>
                {/* Bind button - only show if not yet bound */}
                {!currentUser.auth_provider && supabase && (
                  <button 
                    className="btn-ghost" 
                    onClick={() => setShowBindModal(true)} 
                    title={t('bindAccount')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    <Link2 size={16} />
                  </button>
                )}
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '50%', 
                  background: 'var(--primary)', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 'bold', fontSize: '13px', flexShrink: 0
                }}>
                  {currentUser.username[0].toUpperCase()}
                </div>
                <span style={{ fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60px' }}>{currentUser.username}</span>
                {currentUser.auth_provider && (
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                    {currentUser.auth_provider === 'github' ? '🐙' : '📧'} {currentUser.auth_provider}
                  </span>
                )}
                <button className="btn-ghost" onClick={handleLogout} title={t('logout')} style={{ padding: '6px', flexShrink: 0 }}>
                  <LogOut size={16} />
                </button>
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
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', whiteSpace: 'nowrap' }}>{t('orRegisterDirect')}</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>
              </>
            )}

            {/* Fallback: Traditional registration form */}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>{t('username')}</label>
                <input 
                  type="text" 
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value})}
                  required
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
                {authLoading ? (lang === 'zh' ? '请稍候...' : 'Please wait...') : t('createAccountBtn')}
              </button>
            </form>
            
            <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {t('hasAccount')}
              <button 
                type="button"
                onClick={() => openAuthModal('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, padding: 0 }}
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
                <Github size={20} />
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
