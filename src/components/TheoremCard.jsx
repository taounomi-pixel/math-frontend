import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, Bookmark, Play, Heart, Loader2, Trash2, Code, Tag, FolderOpen, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';

const VideoItem = ({ video, handleLike, handleDelete, isOwner, t }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenVideo = () => {
    // Navigate with backgroundLocation for modal overlay
    // Also pass videoData to eliminate loading flicker
    navigate(`/video/${video.id}`, { state: { backgroundLocation: location, videoData: video } });
  };

  return (
    <motion.div
      layoutId={`video-card-${video.id}`}
      className="group relative flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
      whileHover={{ y: -8 }}
    >
      {/* Thumbnail Section */}
      <div
        onClick={handleOpenVideo}
        className="relative aspect-video w-full overflow-hidden cursor-pointer bg-slate-900"
      >
        <motion.img
          layoutId={`video-visual-${video.id}`}
          src={video.thumbnail_url || `https://pub-728b746849b244799047b198b17eb10b.r2.dev/placeholder.webp`}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          alt={video.title}
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 transform scale-75 group-hover:scale-100 transition-all duration-500 shadow-2xl">
            <Play fill="white" className="text-white ml-1" size={28} />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-white/30 shadow-xl opacity-0 group-hover:opacity-100 mt-2 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
          {t(video.category_l1) || video.category_l1}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-7 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h3
            onClick={handleOpenVideo}
            className="text-xl font-black text-slate-800 leading-tight cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
          >
            {video.title}
          </h3>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-pink-100 group-hover:bg-pink-50 transition-all duration-300">
            <Heart
              size={18}
              className={`cursor-pointer transition-all duration-300 hover:scale-125 ${video._liked || video.is_liked_by_me ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`}
              onClick={(e) => { e.stopPropagation(); handleLike(video.id); }}
            />
            <span className={`text-sm font-black ${(video._liked || video.is_liked_by_me) ? 'text-pink-600' : 'text-slate-500'}`}>
              {video.like_count}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : [])).slice(0, 3).map(tag => (
            <span key={tag} className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 transition-colors hover:bg-white hover:text-blue-500 hover:border-blue-100">
              #{t(tag) || tag}
            </span>
          ))}
        </div>

        {/* Bottom Meta */}
        <div className="flex items-center justify-between mt-2 pt-5 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-lg shadow-blue-100">
              {video.uploader_username?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('uploadedBy')}</span>
              <span className="text-sm font-black text-slate-700">@{video.uploader_username}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOwner && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title={t('btnDelete')}
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={handleOpenVideo}
              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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
    const timer = setTimeout(() => setShowWakingMessage(true), 3000);

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
    return () => window.removeEventListener('videoUploaded', fetchVideos);
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
      if (!response.ok) throw new Error(t('errDeleteFail'));
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLike = async (videoId) => {
    const token = localStorage.getItem('access_token');
    if (!token) { alert(t('loginToLike')); return; }
    try {
      const res = await fetch(`${API_BASE}/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();
      setVideos(prev => prev.map(v =>
        v.id === videoId ? { ...v, like_count: data.like_count, _liked: data.action === 'liked' } : v
      ));
    } catch (err) { console.error(err); }
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        {showWakingMessage && <p className="text-slate-400 font-bold animate-pulse">{t('wakingUp')}</p>}
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-2xl border border-red-100 m-8 text-center font-bold">{error}</div>;

  const decodedL1 = categoryL1 ? decodeURIComponent(categoryL1) : null;
  const decodedL2 = categoryL2 ? decodeURIComponent(categoryL2) : null;
  const lowerQuery = searchQuery.toLowerCase().trim();

  let filteredVideos = videos.filter(v => (!decodedL1 || v.category_l1 === decodedL1) && (!decodedL2 || v.category_l2 === decodedL2));
  if (lowerQuery) {
    filteredVideos = filteredVideos.filter(v =>
      (v.title || "").toLowerCase().includes(lowerQuery) ||
      (v.uploader_username || "").toLowerCase().includes(lowerQuery) ||
      (Array.isArray(v.tags) ? v.tags : (v.tags ? v.tags.split(',') : [])).some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-32 px-8 bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-100 m-8">
        <FolderOpen size={64} className="mx-auto text-slate-200 mb-6" />
        <h3 className="text-slate-800 font-black text-2xl mb-2">{t('noRecords')}</h3>
        <p className="text-slate-400 font-medium">{t('loginToUploadDesc')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto py-12">
      {/* 2-column Grid - ACCORDING TO USER'S HARD REQUIREMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {filteredVideos.map(video => (
          <VideoItem
            key={video.id}
            video={video}
            handleLike={handleLike}
            handleDelete={handleDelete}
            isOwner={currentUserId === video.uploader_id || currentUsername === video.uploader_username || localStorage.getItem('is_admin') === 'true'}
            t={t}
          />
        ))}
      </div>
    </div>
  );
};

export default TheoremCard;
