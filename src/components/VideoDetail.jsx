import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Code, Trash2, Tag, ArrowLeft, X } from 'lucide-react';
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
  const [video, setVideo] = useState(initialVideoData || null);
  const [isLoading, setIsLoading] = useState(!initialVideoData);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('access_token');
  const currentUserId = localStorage.getItem('user_id');

  const fetchVideo = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      // Fetch all to find the specific one (as per current API structure)
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
    try {
      const res = await fetch(`${API_BASE}/videos/${video.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchVideo();
    } catch (e) {
      console.error(e);
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
        style={{ height: 'fit-content', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
      >
        {/* Close Button */}
        <button 
          onClick={handleBack}
          style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>

        <div className="p-6 md:p-10">
          {/* Back Label */}
          <button 
            onClick={handleBack}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}
          >
            <ArrowLeft size={18} /> {t('backToGallery')}
          </button>

          {!video ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: '24px' }}>
              <GeometricLoader size={120} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Responsive Video Player */}
              <motion.div 
                layoutId={`video-visual-${video.id}`}
                className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl mb-8 bg-black"
                style={{ 
                  maxHeight: '60vh', 
                  background: '#000',
                  position: 'relative', // Stabilize layout flow
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <video 
                  src={video.video_url.startsWith('http') ? video.video_url : `${API_BASE.replace('/api', '')}${video.video_url}`}
                  controls 
                  autoPlay
                  className="w-full h-full object-contain"
                  style={{ display: 'block' }}
                />
              </motion.div>

              {/* Info Container - YouTube style */}
              <div className="w-full">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                       <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontWeight: '600' }}>
                         {t('uploadedBy')} @{video.uploader_username}
                       </span>
                    </div>
                    <h1 style={{ fontSize: '28px', margin: '0 0 12px 0', fontWeight: '800', lineHeight: '1.2', color: 'var(--text-primary)' }}>
                      {video.title}
                    </h1>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : [])).map(tag => (
                        <span key={tag} className="tag" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '4px 12px', fontSize: '13px' }}>
                          #{t(tag) || tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={toggleLike}
                      className={`btn-primary ${video.is_liked_by_me ? 'liked' : ''}`} 
                      style={{ 
                        padding: '12px 24px', borderRadius: '24px',
                        background: video.is_liked_by_me ? '#ec4899' : 'var(--bg-secondary)',
                        color: video.is_liked_by_me ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600'
                      }}
                    >
                      <Heart size={20} fill={video.is_liked_by_me ? 'currentColor' : 'none'} /> 
                      {video.like_count}
                    </button>
                    {video.manim_source_url && (
                      <button 
                        className="btn-ghost" 
                        style={{ 
                          padding: '12px 24px', borderRadius: '24px', border: '1px solid var(--border-color)',
                          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600'
                        }}
                        onClick={() => window.open(video.manim_source_url, '_blank')}
                      >
                        <Code size={20} /> {t('viewCode')}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '24px 0' }} />

                {/* Comment Section */}
                <CommentSection videoId={video.id} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VideoDetail;
