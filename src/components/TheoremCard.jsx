import React, { useState, useEffect } from 'react';
import { PlayCircle, Bookmark, Play, Heart, Loader2, Trash2, Code, Tag, FolderOpen } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

const TheoremCard = ({ searchQuery = "" }) => {
  const { t } = useLanguage();
  const { categoryL1, categoryL2 } = useParams();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showWakingMessage, setShowWakingMessage] = useState(false);
  
  const fetchVideos = async () => {
    setIsLoading(true);
    setShowWakingMessage(false);
    
    // Timer to show "Waking up..." message after 3 seconds
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
    
    // Listen for upload success events triggered by Header > UploadModal
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
      const fullUrl = `${API_BASE}/videos/${videoId}`;
      console.log(`[DEBUG] Attempting DELETE at: ${fullUrl}`);
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errorMsg = t('errDeleteFail');
        try {
          const errorData = await response.json();
          if (errorData.detail) errorMsg += `: ${errorData.detail}`;
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }

      // Remove from state
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();
      
      // Update UI optimistically
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '16px' }}>
        <Loader2 className="spinning" size={32} color="var(--primary)" />
        {showWakingMessage && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', animation: 'fadeIn 0.5s ease' }}>
            {t('wakingUp')}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return <div className="error-message" style={{ margin: '32px' }}>{error}</div>;
  }

  // Fallback to static if no database entries yet
  if (videos.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', padding: '64px', margin: '32px 0',
        background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border-color)'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{t('noRecords')}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{t('loginToUploadDesc')}</p>
      </div>
    );
  }

  // --- Filter by category from URL params ---
  const decodedL1 = categoryL1 ? decodeURIComponent(categoryL1) : null;
  const decodedL2 = categoryL2 ? decodeURIComponent(categoryL2) : null;

  let filteredVideos = videos;

  // Apply category filter
  if (decodedL1) {
    filteredVideos = filteredVideos.filter(v => v.category_l1 === decodedL1);
  }
  if (decodedL2) {
    filteredVideos = filteredVideos.filter(v => v.category_l2 === decodedL2);
  }

  // Apply search text filter
  const lowerQuery = searchQuery.toLowerCase().trim();
  if (lowerQuery) {
    filteredVideos = filteredVideos.filter(video => {
      const titleMatch = (video.title || "").toLowerCase().includes(lowerQuery);
      const uploaderMatch = (video.uploader_username || "").toLowerCase().includes(lowerQuery);
      // Robust tags handling (support both arrays and split strings)
      const tags = Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : []);
      const tagsMatch = tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      return titleMatch || uploaderMatch || tagsMatch;
    });
  }

  // Category header
  const categoryHeader = decodedL2 
    ? `${decodedL1} › ${decodedL2}` 
    : decodedL1 || null;

  if (filteredVideos.length === 0) {
    return (
      <div style={{ textAlign: 'center', margin: '32px 0', padding: '64px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
        {categoryHeader && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Tag size={16} /> {t(decodedL1)} {decodedL2 ? ` › ${t(decodedL2)}` : ''}
          </p>
        )}
        <h3 style={{ color: 'var(--text-primary)' }}>
          {searchQuery 
            ? `${t('noResultsFor')} "${searchQuery}"` 
            : t('noRecords')
          }
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{t('loginToUploadDesc')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', margin: '24px 0' }}>
      {categoryHeader && (
        <div style={{ 
          padding: '12px 20px', 
          background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))',
          borderRadius: '12px', 
          border: '1px solid var(--border-color)',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FolderOpen size={18} /> {t(decodedL1)} {decodedL2 ? ` › ${t(decodedL2)}` : ''}
          <span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
            {filteredVideos.length} {t('resultsCount')}
          </span>
        </div>
      )}
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

const VideoItem = ({ video, handleLike, handleDelete, isOwner, t }) => {
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

  return (
    <section className="hero-section" style={{ minHeight: 'auto', padding: '32px', gap: '32px' }}>
      <div className="hero-content">
        <span className="badge">{t('uploadedBy')} @{video.uploader_username}</span>
        <h2 className="hero-title" style={{ fontSize: '32px', margin: '16px 0' }}>{video.title}</h2>
        {video.tags && (Array.isArray(video.tags) ? video.tags.length > 0 : video.tags.length > 0) && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {(Array.isArray(video.tags) ? video.tags : video.tags.split(',')).map(tag => (
              <span key={tag} style={{ 
                padding: '4px 10px', 
                borderRadius: '16px', 
                background: 'var(--bg-tertiary)', 
                fontSize: '13px', 
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}>
                #{t(tag) || tag}
              </span>
            ))}
          </div>
        )}
        {finalCategoryLabel && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={14} /> {finalCategoryLabel}
          </p>
        )}
        <p className="hero-desc" style={{ fontSize: '15px' }}>
          {t('uploadedOn')} {new Date(video.upload_time).toLocaleDateString()}
        </p>
        <div className="hero-actions" style={{ marginTop: '24px' }}>
          <button 
            className={`btn-primary ${video._liked ? 'liked' : ''}`} 
            onClick={() => handleLike(video.id)} 
            style={video._liked ? { 
              display: 'flex', gap: '8px', alignItems: 'center',
              backgroundColor: '#ec4899',
              borderColor: '#ec4899',
              transition: 'background 0.2s'
            } : {
              display: 'flex', gap: '8px', alignItems: 'center',
              transition: 'background 0.2s'
            }}
          >
            <Heart size={20} fill={video._liked ? "currentColor" : "none"} /> 
            {video.like_count}
          </button>
          
          {video.manim_source_url && (
            <button 
              className="btn-ghost" 
              onClick={() => handleViewSourceCode(video.manim_source_url)}
              style={{ 
                display: 'flex', gap: '8px', alignItems: 'center', 
                padding: '8px 16px', border: '1px solid var(--border-color)', 
                borderRadius: '8px', color: 'var(--text-primary)' 
              }}
            >
              <Code size={18} />
              {t('viewCode')}
            </button>
          )}
          
          {isOwner && (
            <button 
              className="btn-ghost" 
              onClick={() => handleDelete(video.id)}
              style={{ 
                display: 'flex', gap: '8px', alignItems: 'center', 
                color: '#ef4444', padding: '8px 16px',
                border: '1px solid #fecaca', borderRadius: '8px'
              }}
            >
              <Trash2 size={18} />
              {t('btnDelete')}
            </button>
          )}
        </div>
      </div>
      <div className="hero-visual" style={{ flex: '1 1 50%' }}>
        <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#000', width: '100%', aspectRatio: '16/9', boxShadow: 'var(--shadow-md)' }}>
          <video 
            src={video.video_url.startsWith('http') ? video.video_url : `${API_BASE.replace('/api', '')}${video.video_url}`}
            controls 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            preload="metadata"
          >
            Your browser does not support HTML video.
          </video>
        </div>
      </div>
      
      {showCode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-primary)', width: '90%', maxWidth: '800px', height: '80vh', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ 
              padding: '16px 24px', 
              borderBottom: '1px solid var(--border-color)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600' }}>
                <Code size={20} color="var(--primary)" /> {video.title} - {t('viewCode')}
              </h3>
              <button 
                onClick={() => setShowCode(false)} 
                className="close-button-p"
                style={{ 
                  background: 'rgba(0, 0, 0, 0.05)', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '24px', 
                  color: 'var(--text-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  transition: 'all 0.2s'
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#1e1e1e', color: '#d4d4d4' }}>
              {codeLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Loader2 className="spinning" size={32} color="var(--primary)" />
                </div>
              ) : (
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{codeContent}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TheoremCard;
