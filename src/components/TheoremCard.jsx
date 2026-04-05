import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Code, Trash2, Tag, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

import GeometricLoader from './GeometricLoader';

const VideoItem = ({ video, handleLike, handleDelete, isOwner, t }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const finalCategoryLabel = [
    video.category_l1 ? t(video.category_l1) : null,
    video.category_l2 ? t(video.category_l2) : null
  ].filter(Boolean).join(' › ');
  
  const [showCode, setShowCode] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  const handleViewSourceCode = async (url) => {
    setShowCode(true);
    if (codeContent) return;
    setCodeLoading(true);
    try {
      const res = await fetch(url);
      const text = await res.text();
      setCodeContent(text);
    } catch(e) {
      setCodeContent('Error loading code: ' + e.message);
    } finally {
      setCodeLoading(false);
    }
  };

  // Scroll lock when code is open
  useEffect(() => {
    if (showCode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showCode]);

  const isActive = window.location.pathname === `/video/${video.id}`;
  
  return (
    <div style={{ position: 'relative' }}>
      {/* High-Fidelity Ghost Card Placeholder (V3) to match global URL state */}
      {isActive && (
        <div 
          className="video-card ghost"
          style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'var(--bg-primary)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            opacity: 0.4,
            zIndex: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Static Ghost Thumbnail (to maintain visual through blur) */}
          <div className="aspect-video w-full bg-slate-200" />
          {/* Static Ghost Content */}
          <div style={{ padding: '20px', flex: 1 }}>
            <div style={{ height: '16px', width: '70%', background: 'var(--text-secondary)', opacity: 0.4, borderRadius: '4px', marginBottom: '10px' }} />
            <div style={{ height: '12px', width: '40%', background: 'var(--text-secondary)', opacity: 0.3, borderRadius: '4px' }} />
          </div>
        </div>
      )}
      
      <motion.div 
        layoutId={`video-card-${video.id}`}
        className="video-card group" 
        style={{ 
          background: 'var(--bg-primary)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
          height: '100%',
          position: 'relative',
          WebkitTransform: 'translateZ(0)', // Force GPU composite
          willChange: 'transform, border-radius, box-shadow' // Pre-warm compositor
        }}
        onClick={() => navigate(`/video/${video.id}`, { state: { backgroundLocation: location, videoData: video } })}
        whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Thumbnail Section */}
        <motion.div 
          layoutId={`video-visual-${video.id}`}
          className="video-card-thumbnail aspect-video w-full overflow-hidden" 
          style={{ background: '#000', position: 'relative' }}
        >
          <video 
            src={video.video_url.startsWith('http') ? video.video_url : `${API_BASE.replace('/api', '')}${video.video_url}`}
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
            preload="metadata"
            muted
          />
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
            <div className="bg-primary/90 text-white p-3 rounded-full shadow-xl">
              <Play size={24} fill="white" />
            </div>
          </div>
          
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
            <Play size={10} fill="white" />
            {t('uploadedBy')} @{video.uploader_username}
          </div>
        </motion.div>

        {/* Info Section */}
        <div className="video-card-content" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 className="video-card-title" style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: '1.4' }}>
            {video.title}
          </h3>
          
          {finalCategoryLabel && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={12} className="text-primary/70" /> {finalCategoryLabel}
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)', opacity: 0.9 }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); handleLike(video.id); }} 
                className="flex items-center gap-1.5 transition-colors hover:text-pink-500"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: video._liked ? '#ec4899' : 'var(--text-secondary)' }}
              >
                <Heart size={18} fill={video._liked ? "currentColor" : "none"} /> 
                <span style={{ fontSize: '13px', fontWeight: '500' }}>{video.like_count}</span>
              </button>
              
              {video.manim_source_url && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleViewSourceCode(video.manim_source_url); }}
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <Code size={18} />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{t('viewCode')}</span>
                </button>
              )}
            </div>

            {isOwner && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                title={t('delete')}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
        
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
              {/* Backdrop */}
              <motion.div 
                key="code-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCode(false)}
                style={{ 
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(255, 255, 255, 0.5)', 
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              />

              {/* Modal Window */}
              <motion.div 
                key="code-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: '100%', 
                  maxWidth: '1000px',
                  maxHeight: '85vh', 
                  background: 'white', 
                  borderRadius: '32px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                {/* Close Button */}
                <motion.button 
                  onClick={() => setShowCode(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

                {/* Header */}
                <div style={{ padding: '32px 32px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: '#fafafa' }}>
                  <div style={{ background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '20px' }}>
                    <Code size={24} color="#1d1d1f" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1d1d1f', letterSpacing: '-0.5px' }}>
                      {video.title}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#86868b', fontWeight: '500' }}>Source Code</p>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div 
                  className="hide-scrollbar"
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '32px', 
                    background: '#f5f5f7', // Light gray background for code
                    position: 'relative'
                  }}
                >
                  {codeLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                      <GeometricLoader size={60} showText={true} />
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(codeContent);
                            alert('代码已复制！');
                          }}
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

                      <pre 
                        style={{ 
                          margin: 0, 
                          color: '#1d1d1f', // Dark text for light mode
                          fontSize: '14px',
                          lineHeight: '1.6',
                          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                          tabSize: 4,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all'
                        }}
                      >
                        {codeContent}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 32px', background: '#fafafa', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', gap: '8px' }}>
                     <span style={{ padding: '4px 10px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px', color: '#86868b' }}>Python</span>
                     <span style={{ padding: '4px 10px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '12px', color: '#86868b' }}>Manim</span>
                   </div>
                   <button 
                    onClick={() => setShowCode(false)}
                    style={{ background: 'transparent', border: 'none', color: '#0066cc', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                   >
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

const TheoremCard = ({ searchQuery = "" }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { categoryL1, categoryL2 } = useParams();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWakingMessage, setShowWakingMessage] = useState(false);
  
  const fetchVideos = async () => {
    setIsLoading(true);
    setShowWakingMessage(false);
    
    const timer = setTimeout(() => {
      setShowWakingMessage(true);
    }, 3000);

    const token = localStorage.getItem('access_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE}/videos`, { headers });
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    
    const handleOptimisticLike = (e) => {
      const { videoId, action } = e.detail;
      setVideos(prev => prev.map(v => {
        if (v.id === videoId) {
          const isLiking = action === 'liked';
          // Avoid double counting if already in correct state
          const currentlyLiked = v._liked !== undefined ? v._liked : v.is_liked_by_me;
          if (isLiking === currentlyLiked) return v;
          return {
            ...v,
            _liked: isLiking,
            like_count: isLiking ? v.like_count + 1 : Math.max(0, v.like_count - 1)
          };
        }
        return v;
      }));
    };

    window.addEventListener('videoUploaded', fetchVideos);
    window.addEventListener('optimisticLike', handleOptimisticLike);
    
    return () => {
      window.removeEventListener('videoUploaded', fetchVideos);
      window.removeEventListener('optimisticLike', handleOptimisticLike);
    };
  }, []);

  const currentUserId = localStorage.getItem('user_id') ? parseInt(localStorage.getItem('user_id'), 10) : null;
  const currentUsername = localStorage.getItem('username');

  const handleDelete = async (videoId) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE}/videos/${videoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        let errorMsg = t('errDeleteFail');
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMsg += `: ${errorData.detail}`;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      setVideos(prev => prev.filter(v => v.id !== videoId));
      alert(t('deleteSuccess'));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLike = async (videoId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert(t('loginToLike'));
      return;
    }
    
    // 1. Optimistic Update (Instant UI reaction)
    const originalVideos = [...videos];
    setVideos(prev => prev.map(v => {
      if (v.id === videoId) {
        // We use v._liked if present, otherwise v.is_liked_by_me
        const currentlyLiked = v._liked !== undefined ? v._liked : v.is_liked_by_me;
        return {
          ...v,
          _liked: !currentlyLiked,
          like_count: currentlyLiked ? Math.max(0, v.like_count - 1) : v.like_count + 1
        };
      }
      return v;
    }));

    try {
      // 2. Network Request
      const res = await fetch(`${API_BASE}/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();
      
      // 3. Sync with Source of Truth
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, like_count: data.like_count, _liked: data.action === 'liked' } 
          : v
      ));
    } catch (err) {
      console.error('Like action failed, reverting...', err);
      // Revert to original state on failure
      setVideos(originalVideos);
      // Show subtle error or ignore
    }
  };
  if (isLoading && videos.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 64px', gap: '32px' }}>
        <GeometricLoader size={96} />
      </div>
    );
  }

  if (error) return (
    <div className="container mx-auto px-4 py-12 text-center text-red-500 bg-red-50/50 rounded-xl m-8 border border-red-100">
      {error}
    </div>
  );

  if (videos.length === 0) {
    return (
      <div className="container mx-auto px-4 text-center p-16 m-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <FolderOpen size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-slate-800 font-semibold mb-2">{t('noRecords')}</h3>
        <p className="text-slate-500">{t('loginToUploadDesc')}</p>
      </div>
    );
  }

  const decodedL1 = categoryL1 ? decodeURIComponent(categoryL1) : null;
  const decodedL2 = categoryL2 ? decodeURIComponent(categoryL2) : null;

  let filteredVideos = videos;
  if (decodedL1) filteredVideos = filteredVideos.filter(v => v.category_l1 === decodedL1);
  if (decodedL2) filteredVideos = filteredVideos.filter(v => v.category_l2 === decodedL2);

  const lowerQuery = searchQuery.toLowerCase().trim();
  if (lowerQuery) {
    filteredVideos = filteredVideos.filter(video => {
      const titleMatch = (video.title || "").toLowerCase().includes(lowerQuery);
      const uploaderMatch = (video.uploader_username || "").toLowerCase().includes(lowerQuery);
      const tags = Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : []);
      return titleMatch || uploaderMatch || tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    });
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center p-16 m-8 bg-slate-50 rounded-2xl">
        <h3 className="text-slate-800 font-semibold mb-2">
          {searchQuery ? `${t('noResultsFor')} "${searchQuery}"` : t('noRecords')}
        </h3>
        <p className="text-slate-500">{t('loginToUploadDesc')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 container mx-auto px-4 max-w-5xl py-12">
      {filteredVideos.map(video => (
        <VideoItem 
          key={video.id} 
          video={video} 
          handleLike={handleLike} 
          handleDelete={handleDelete}
          isOwner={
            currentUserId === video.uploader_id || 
            (currentUsername && currentUsername === video.uploader_username) ||
            localStorage.getItem('is_admin') === 'true'
          }
          t={t} 
        />
      ))}
    </div>
  );
};

export default TheoremCard;
