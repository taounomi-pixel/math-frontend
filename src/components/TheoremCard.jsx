import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, User, Calendar, Heart, Trash2, Code } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

const TheoremCard = ({ searchQuery }) => {
  const { categoryL1, categoryL2 } = useParams();
  const { lang, t } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
    // Listen for upload success to refresh
    window.addEventListener('videoUploaded', fetchVideos);
    return () => window.removeEventListener('videoUploaded', fetchVideos);
  }, [categoryL1, categoryL2, searchQuery]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/videos`;
      const params = new URLSearchParams();
      if (categoryL1) params.append('category_l1', categoryL1);
      if (categoryL2) params.append('category_l2', categoryL2);
      if (searchQuery) params.append('q', searchQuery);
      
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      if (res.ok) fetchVideos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE}/videos/${videoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert(t('deleteSuccess'));
        fetchVideos();
      } else {
        alert(t('errDeleteFail'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewSource = (sourceUrl) => {
    if (!sourceUrl) return;
    window.open(sourceUrl, '_blank');
  };

  if (loading) return <div className="loading-state">{t('loading')}</div>;

  if (videos.length === 0) {
    return (
      <div className="no-records-container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {searchQuery ? `${t('noResultsFor')} "${searchQuery}"` : t('noRecords')}
        </h3>
        <p style={{ color: 'var(--text-tertiary)' }}>{t('loginToUploadDesc')}</p>
      </div>
    );
  }

  const currentUsername = localStorage.getItem('username');

  return (
    <div className="video-grid">
      {videos.map((v) => (
        <div key={v.id} className="video-card">
          <div className="thumbnail" onClick={() => window.open(v.file_url, '_blank')}>
            <div className="thumbnail-placeholder">
               <video src={v.file_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="hover-overlay">
              <Play fill="white" size={48} />
            </div>
            <span className="duration">Manim</span>
          </div>
          
          <div className="video-info">
            <div className="creator-avatar">
              {v.owner && v.owner.username ? v.owner.username[0].toUpperCase() : 'U'}
            </div>
            <div className="video-meta">
              <h3 className="video-title">{v.title}</h3>
              <div className="creator-name">
                <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {v.owner ? v.owner.username : 'Unknown'}
              </div>
              <div className="video-stats">
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {new Date(v.created_at).toLocaleDateString()}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => handleLike(v.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Heart size={14} fill={v.likes > 0 ? '#ef4444' : 'none'} color={v.likes > 0 ? '#ef4444' : 'currentColor'} />
                  {v.likes}
                </button>
                
                {v.source_url && (
                   <button onClick={() => handleViewSource(v.source_url)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--accent-primary)' }}>
                    <Code size={14} /> {t('viewCode')}
                  </button>
                )}

                {v.owner && v.owner.username === currentUsername && (
                  <button onClick={() => handleDelete(v.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#ef4444' }}>
                    <Trash2 size={14} /> {t('btnDelete')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TheoremCard;
