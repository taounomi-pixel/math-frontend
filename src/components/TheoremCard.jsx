import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
          position: 'relative'
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
        
      {/* Source Code Modal (Final Fix: Pure Inline Styles + Portal) */}
      {showCode && createPortal(
        <div 
          onClick={(e) => { e.stopPropagation(); setShowCode(false); }}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'var(--bg-primary)', 
              width: '95vw', 
              maxWidth: '1000px', 
              maxHeight: '90vh', 
              borderRadius: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ 
              padding: '24px 32px', 
              borderBottom: '1px solid var(--border-color)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)'
            }}>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Code size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl" style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {video.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Source Code Viewer</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCode(false)} 
                className="p-3 rounded-full hover:bg-black/5 transition-colors text-4xl font-light leading-none"
                style={{ color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            
            <div 
              className="hide-scrollbar"
              style={{ 
                padding: '32px', 
                overflowY: 'auto', 
                flex: 1, 
                backgroundColor: '#0f172a', 
                color: '#e2e8f0',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace'
              }}
            >
              {codeLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-6">
                  <GeometricLoader size={60} showText={true} />
                </div>
              ) : (
                <div className="relative">
                  <div style={{ position: 'absolute', top: 0, right: 0 }}>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(codeContent);
                        alert('Code Copied!');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-lg"
                    >
                      Copy Code
                    </button>
                  </div>
                  <pre 
                    style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      lineHeight: '1.6', 
                      whiteSpace: 'pre',
                      tabSize: 4
                    }}
                  >
                    {codeContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>,
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
    window.addEventListener('videoUploaded', fetchVideos);
    return () => {
      window.removeEventListener('videoUploaded', fetchVideos);
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
    
    try {
      const res = await fetch(`${API_BASE}/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();
      
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, like_count: data.like_count, _liked: data.action === 'liked' } 
          : v
      ));
    } catch (err) {
      console.error(err);
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
