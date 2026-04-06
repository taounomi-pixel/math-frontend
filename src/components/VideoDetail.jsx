import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Code, ArrowLeft, X, Play } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';
import CommentSection from './CommentSection';
import GeometricLoader from './GeometricLoader';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // Use passed videoData for instant rendering (eliminates white flicker)
  const initialVideoData = location.state?.videoData;
  const [video, setVideo] = useState(() => {
    if (!initialVideoData) return null;
    return {
      ...initialVideoData,
      is_liked_by_me: initialVideoData.is_liked_by_me || initialVideoData._liked || false
    };
  });
  const [isLoading, setIsLoading] = useState(!initialVideoData);
  const [error, setError] = useState('');

  const token = localStorage.getItem('access_token');
  const currentUserId = localStorage.getItem('user_id');

  // Code Modal State
  const [showCode, setShowCode] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  // Uploader card popup
  const [showUploaderCard, setShowUploaderCard] = useState(false);
  const uploaderCardRef = useRef(null);

  // Video ref for deferred autoplay
  const videoRef = useRef(null);

  // Close uploader card on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploaderCardRef.current && !uploaderCardRef.current.contains(event.target)) {
        setShowUploaderCard(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Deferred autoplay: wait for layout animation (~350ms) before playing
  useEffect(() => {
    if (!video) return;
    const timer = setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 380);
    return () => clearTimeout(timer);
  }, [video]);

  const handleViewCode = async () => {
    setShowCode(true);
    if (!codeContent && video?.manim_source_url) {
      setCodeLoading(true);
      try {
        const url = video.manim_source_url.startsWith('http')
          ? video.manim_source_url
          : `${API_BASE.replace('/api', '')}${video.manim_source_url}`;
        const response = await fetch(url);
        const text = await response.text();
        setCodeContent(text);
      } catch (error) {
        setCodeContent('Error loading source code: ' + error.message);
      } finally {
        setCodeLoading(false);
      }
    }
  };

  const fetchVideo = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE}/videos`, { headers });
      const data = await response.json();
      const found = data.find(v => v.id.toString() === id);
      if (!found) throw new Error('Video not found');
      setVideo(found);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialVideoData) {
      fetchVideo();
    }
  }, [id, initialVideoData]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!token) return alert(t('loginToLike') || 'Please login to like');

    const originalVideo = { ...video };
    const currentlyLiked = video.is_liked_by_me;
    setVideo(prev => ({
      ...prev,
      is_liked_by_me: !currentlyLiked,
      like_count: currentlyLiked ? Math.max(0, prev.like_count - 1) : prev.like_count + 1
    }));

    window.dispatchEvent(new CustomEvent('optimisticLike', {
      detail: { videoId: video.id, action: !currentlyLiked ? 'liked' : 'unliked' }
    }));

    try {
      const res = await fetch(`${API_BASE}/videos/${video.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Like request failed');
      const data = await res.json();
      setVideo(prev => ({
        ...prev,
        is_liked_by_me: data.action === 'liked',
        like_count: data.like_count
      }));
    } catch (e) {
      console.error('Like toggle failed:', e);
      setVideo(originalVideo);
    }
  };

  const handleBack = () => navigate('/');

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={handleBack}
      >
        <div className="error-message" style={{ background: 'white', padding: '24px', borderRadius: '12px' }}>{error}</div>
      </motion.div>
    );
  }

  return (
    <div className="hide-scrollbar" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBack}
        style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', zIndex: -1 }}
      />

      {/* Modal Content */}
      <motion.div
        layoutId={`video-card-${id}`}
        className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl relative hide-scrollbar"
        style={{
          height: 'fit-content',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          WebkitTransform: 'translateZ(0)',
          willChange: 'transform, border-radius'
        }}
      >
        {/* ── Modal Header: Back (left) + Uploader Avatar (right) ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px 16px'
        }}>
          {/* Back button */}
          <button
            onClick={handleBack}
            title={t('backToGallery')}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.backgroundColor = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Uploader Avatar + Glass Card */}
          {video && (
            <div ref={uploaderCardRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {/* iOS 26 Liquid Glass card — slides horizontally left like a card being pulled out */}
              <AnimatePresence>
                {showUploaderCard && (
                  <motion.div
                    key="uploader-glass-card"
                    initial={{ opacity: 0, scaleX: 0.6, x: 20, originX: 1 }}
                    animate={{ opacity: 1, scaleX: 1, x: 0, originX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.6, x: 20, originX: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 26,
                      mass: 0.9
                    }}
                    style={{
                      position: 'absolute',
                      right: 'calc(100% + 10px)',
                      top: '50%',
                      translateY: '-50%',
                      /* iOS 26 liquid glass */
                      background: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(28px) saturate(200%) brightness(1.08)',
                      WebkitBackdropFilter: 'blur(28px) saturate(200%) brightness(1.08)',
                      border: '1px solid rgba(255, 255, 255, 0.45)',
                      borderRadius: '14px',
                      padding: '10px 18px',
                      boxShadow: [
                        '0 4px 24px rgba(15, 23, 42, 0.09)',
                        'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
                        'inset 0 -1px 0 rgba(0, 0, 0, 0.04)'
                      ].join(', '),
                      whiteSpace: 'nowrap',
                      zIndex: 20,
                      transformOrigin: 'right center'
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.1px'
                    }}>
                      {video.uploader_username}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Avatar button — matches comment section style */}
              <button
                onClick={() => setShowUploaderCard(prev => !prev)}
                title={video.uploader_username}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(80, 160, 240, 0.3), rgba(168, 85, 247, 0.3))',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '2px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.6)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  flexShrink: 0
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {video.uploader_username?.charAt(0).toUpperCase() || '?'}
              </button>
            </div>
          )}
        </div>

        {/* ── Main Content ── */}
        <div style={{ padding: '0 32px 32px' }}>
          {!video ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: '24px' }}>
              <GeometricLoader size={120} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {/* ── Video Player ── */}
              <motion.div
                layoutId={`video-visual-${video.id}`}
                className="w-full rounded-2xl overflow-hidden shadow-2xl bg-black"
                style={{
                  aspectRatio: '16/9',
                  maxHeight: '60vh',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  willChange: 'transform, border-radius'
                }}
              >
                <video
                  ref={videoRef}
                  src={video.video_url.startsWith('http') ? video.video_url : `${API_BASE.replace('/api', '')}${video.video_url}`}
                  controls
                  /* autoPlay removed — deferred via useEffect to avoid competing with layout animation */
                  className="w-full h-full object-contain"
                  style={{ display: 'block' }}
                />
              </motion.div>

              {/* ── Below-video row: Title+Tags (left) | Like+Code (right) ── */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '24px',
                marginTop: '20px',
                marginBottom: '28px'
              }}>
                {/* Left: Title + Tags */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{
                    fontSize: '26px', margin: '0 0 10px 0',
                    fontWeight: '800', lineHeight: '1.25',
                    color: 'var(--text-primary)',
                    wordBreak: 'break-word'
                  }}>
                    {video.title}
                  </h1>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : [])).map(tag => (
                      <span
                        key={tag}
                        className="tag"
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          padding: '4px 12px',
                          fontSize: '13px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        #{t(tag) || tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Like + Code buttons */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  flexShrink: 0,
                  paddingTop: '2px'
                }}>
                  <button
                    onClick={toggleLike}
                    className={`btn-primary ${video.is_liked_by_me ? 'liked' : ''}`}
                    style={{
                      padding: '8px 20px', borderRadius: '24px', minWidth: '90px',
                      background: video.is_liked_by_me ? '#ec4899' : 'var(--bg-secondary)',
                      color: video.is_liked_by_me ? 'white' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '7px', fontSize: '15px', fontWeight: '600'
                    }}
                  >
                    <Heart size={17} fill={video.is_liked_by_me ? 'currentColor' : 'none'} />
                    {video.like_count}
                  </button>

                  {video.manim_source_url && (
                    <button
                      className="btn-ghost"
                      style={{
                        padding: '8px 20px', borderRadius: '24px',
                        border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '7px', fontSize: '15px', fontWeight: '600',
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)'
                      }}
                      onClick={handleViewCode}
                    >
                      <Code size={17} /> {t('viewCode') || '查看代码'}
                    </button>
                  )}
                </div>
              </div>

              {/* ── Divider ── */}
              <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '28px' }} />

              {/* ── Comment Section ── */}
              <div className="w-full">
                <CommentSection videoId={video.id} />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Code Modal Portal ── */}
      {createPortal(
        <AnimatePresence>
          {showCode && (
            <div
              key="code-modal-container"
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px'
              }}
            >
              <motion.div
                key="code-modal-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowCode(false)}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
                }}
              />
              <motion.div
                key="code-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%', maxWidth: '1000px', maxHeight: '85vh',
                  background: 'white', borderRadius: '32px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                  position: 'relative', border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <motion.button
                  onClick={() => setShowCode(false)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'absolute', top: '24px', right: '24px', zIndex: 20,
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer', color: '#1d1d1f'
                  }}
                >
                  <X size={20} />
                </motion.button>

                <div style={{ padding: '32px 32px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: '#fafafa' }}>
                  <div style={{ background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '20px' }}><Code size={24} color="#1d1d1f" /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1d1d1f', letterSpacing: '-0.5px' }}>{video?.title}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#86868b', fontWeight: '500' }}>Source Code</p>
                  </div>
                </div>

                <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#f5f5f7', position: 'relative' }}>
                  {codeLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                      <GeometricLoader size={60} showText={true} />
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
                        <button
                          onClick={() => { navigator.clipboard.writeText(codeContent); alert('代码已复制！'); }}
                          style={{
                            padding: '8px 16px', background: 'white', color: '#1d1d1f',
                            borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                            border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Play size={12} fill="currentColor" /> 复制
                        </button>
                      </div>
                      <pre style={{ margin: 0, color: '#1d1d1f', fontSize: '14px', lineHeight: '1.6', fontFamily: '"JetBrains Mono", "Fira Code", monospace', tabSize: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {codeContent}
                      </pre>
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 32px', background: '#fafafa', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '4px 10px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px', color: '#86868b' }}>Python</span>
                    <span style={{ padding: '4px 10px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px', color: '#86868b' }}>Manim</span>
                  </div>
                  <button onClick={() => setShowCode(false)} style={{ background: 'transparent', border: 'none', color: '#0066cc', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    完成
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default VideoDetail;
