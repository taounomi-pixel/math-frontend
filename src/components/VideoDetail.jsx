import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Code, Trash2, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';
import CommentSection from './CommentSection';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('access_token');
  const currentUserId = localStorage.getItem('user_id');

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
    fetchVideo();
    window.scrollTo(0, 0);
  }, [id]);

  const toggleLike = async () => {
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Loader2 className="spinning" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (error || !video) {
    return <div className="error-message" style={{ margin: '32px' }}>{error || 'Error'}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '100px' }}
    >
      {/* Immersive Header / Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="btn-ghost"
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          marginBottom: '24px', color: 'var(--text-secondary)',
          background: 'transparent', border: 'none', cursor: 'pointer'
        }}
      >
        <ArrowLeft size={20} /> {t('backToGallery')}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Expanded Hero Card */}
        <motion.div 
          layoutId={`video-card-${video.id}`}
          className="hero-section"
          style={{ 
            minHeight: 'auto', padding: '32px', gap: '48px', 
            flexDirection: 'column', alignItems: 'stretch',
            borderRadius: '24px', border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)'
          }}
        >
          {/* Visual Container */}
          <motion.div 
            layoutId={`video-visual-${video.id}`}
            style={{ 
              borderRadius: '20px', overflow: 'hidden', 
              background: '#000', width: '100%', 
              aspectRatio: '16/9', boxShadow: 'var(--shadow-xl)' 
            }}
          >
            <video 
              src={video.video_url.startsWith('http') ? video.video_url : `${API_BASE.replace('/api', '')}${video.video_url}`}
              controls 
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </motion.div>

          {/* Info Container */}
          <div className="hero-content" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span className="badge" style={{ background: 'var(--primary)', color: 'white' }}>
                  {t('uploadedBy')} @{video.uploader_username}
                </span>
                <h1 style={{ fontSize: '42px', margin: '16px 0', fontWeight: '800', lineHeight: '1.1' }}>
                  {video.title}
                </h1>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ 
                  textAlign: 'center', padding: '16px 24px', 
                  background: 'var(--bg-tertiary)', borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                   <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{video.like_count}</div>
                   <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('likes')}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {(Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : [])).map(tag => (
                <span key={tag} className="tag" style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                  #{t(tag) || tag}
                </span>
              ))}
            </div>

            <div style={{ 
              display: 'flex', gap: '20px', 
              paddingTop: '32px', borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap'
            }}>
               <button 
                 onClick={toggleLike}
                 className={`btn-primary ${video.is_liked_by_me ? 'liked' : ''}`} 
                 style={{ 
                   padding: '14px 32px', borderRadius: '12px',
                   background: video.is_liked_by_me ? '#ec4899' : 'var(--primary)',
                   display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700'
                 }}
               >
                 <Heart size={22} fill={video.is_liked_by_me ? 'currentColor' : 'none'} /> 
                 {video.is_liked_by_me ? t('liked') || 'Liked' : t('like')}
               </button>
               {video.manim_source_url && (
                 <button 
                  className="btn-ghost" 
                  style={{ 
                    padding: '14px 32px', borderRadius: '12px', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '700'
                  }}
                  onClick={() => window.open(video.manim_source_url, '_blank')}
                 >
                   <Code size={22} /> {t('viewCode')}
                 </button>
               )}
            </div>
          </div>
        </motion.div>

        {/* Comment Section Integration */}
        <div style={{ 
          marginTop: '32px', padding: '0 16px' 
        }}>
          <CommentSection videoId={video.id} />
        </div>
      </div>
    </motion.div>
  );
};

export default VideoDetail;
