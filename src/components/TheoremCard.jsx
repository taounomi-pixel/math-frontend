import React, { useState, useEffect } from 'react';
import { PlayCircle, Bookmark, Play, Heart, Loader2, Trash2, Code, Tag, FolderOpen, Eye } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        } catch (e) {}
        throw new Error(errorMsg);
      }

      setVideos(prev => prev.filter(v => v.id !== videoId));
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        {showWakingMessage && (
          <p className="text-slate-500 text-sm animate-pulse">
            {t('wakingUp')}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500 bg-red-50 rounded-xl border border-red-100 m-8">{error}</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 px-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <h3 className="text-slate-900 font-semibold text-lg mb-2">{t('noRecords')}</h3>
        <p className="text-slate-500">{t('loginToUploadDesc')}</p>
      </div>
    );
  }

  const decodedL1 = categoryL1 ? decodeURIComponent(categoryL1) : null;
  const decodedL2 = categoryL2 ? decodeURIComponent(categoryL2) : null;

  let filteredVideos = videos;

  if (decodedL1) {
    filteredVideos = filteredVideos.filter(v => v.category_l1 === decodedL1);
  }
  if (decodedL2) {
    filteredVideos = filteredVideos.filter(v => v.category_l2 === decodedL2);
  }

  const lowerQuery = searchQuery.toLowerCase().trim();
  if (lowerQuery) {
    filteredVideos = filteredVideos.filter(video => {
      const titleMatch = (video.title || "").toLowerCase().includes(lowerQuery);
      const uploaderMatch = (video.uploader_username || "").toLowerCase().includes(lowerQuery);
      const tags = video.tags || [];
      const tagsMatch = tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      return titleMatch || uploaderMatch || tagsMatch;
    });
  }

  const categoryHeader = decodedL2 
    ? `${decodedL1} › ${decodedL2}` 
    : decodedL1 || null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {categoryHeader && (
        <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm mb-12">
          <FolderOpen size={20} className="text-blue-600" />
          <span className="font-bold text-slate-800">
            {t(decodedL1)} {decodedL2 ? ` › ${t(decodedL2)}` : ''}
          </span>
          <span className="ml-auto text-sm text-slate-400">
            {filteredVideos.length} {t('resultsCount')}
          </span>
        </div>
      )}

      {/* Grid Layout: 1 column on mobile, 2 columns on medium screens and above */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
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
    </div>
  );
};

const VideoItem = ({ video, handleLike, handleDelete, isOwner, t }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenVideo = () => {
    navigate(`/video/${video.id}`, { state: { backgroundLocation: location } });
  };

  return (
    <motion.div 
      layoutId={`video-${video.id}`}
      className="group relative flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail with Expansion animation support */}
      <div 
        onClick={handleOpenVideo}
        className="relative aspect-video w-full overflow-hidden cursor-pointer bg-slate-100"
      >
        <motion.img 
          layoutId={`image-${video.id}`}
          src={video.thumbnail_url || `https://pub-728b746849b244799047b198b17eb10b.r2.dev/placeholder.webp`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={video.title}
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play fill="white" className="text-white ml-1" size={24} />
          </div>
        </div>

        {/* Floating Duration or Label */}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/10">
          {video.duration || 'MathVis'}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 
            onClick={handleOpenVideo}
            className="text-lg font-bold text-slate-900 leading-snug cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
          >
            {video.title}
          </h3>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 group-hover:border-pink-100 group-hover:bg-pink-50 transition-colors">
            <Heart 
              size={16} 
              className={`cursor-pointer transition-colors ${video._liked ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`}
              onClick={(e) => { e.stopPropagation(); handleLike(video.id); }}
            />
            <span className={`text-xs font-bold ${video._liked ? 'text-pink-600' : 'text-slate-500'}`}>{video.like_count}</span>
          </div>
        </div>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {video.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] font-semibold text-slate-500 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200/50">
                #{t(tag) || tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-200">
              {video.uploader_username?.[0].toUpperCase() || 'M'}
            </div>
            <span className="text-xs font-bold text-slate-600">@{video.uploader_username}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={t('btnDelete')}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button 
              onClick={handleOpenVideo}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TheoremCard;
