import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Share2, MessageCircle, User, Calendar,
  ChevronRight, Play, Maximize2, Download, Trash2,
  Loader2, AlertCircle, Bookmark, ArrowLeft, Code
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';
import CommentSection from './CommentSection';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  // Use passed videoData for instant rendering (eliminates white flicker)
  const initialVideoData = location.state?.videoData;
  const [video, setVideo] = useState(initialVideoData || null);
  const [loading, setLoading] = useState(!initialVideoData);
  const [error, setError] = useState(null);

  const isModal = !!location.state?.backgroundLocation;
  const token = localStorage.getItem('access_token');

  const fetchDetail = async () => {
    if (!initialVideoData) setLoading(true);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/videos/${id}`, { headers });
      if (!res.ok) throw new Error(t('errVideoNotFound') || 'Video not found');
      const data = await res.json();
      setVideo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, t]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const toggleLike = async (e) => {
    if (e) e.stopPropagation();
    if (!token) {
      alert(t('loginToLike') || 'Please login to like');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/videos/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();

      setVideo(prev => ({
        ...prev,
        like_count: data.like_count,
        _liked: data.action === 'liked'
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    if (loading && !video) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="text-slate-500 font-medium">{t('loading')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 px-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{t('oops')}</h2>
          <p className="text-slate-500 max-w-xs">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            {t('backToHome')}
          </button>
        </div>
      );
    }

    if (!video) return null;

    return (
      <div className="flex flex-col w-full">
        {/* Video Player Section */}
        <div className="relative aspect-video w-full bg-black group overflow-hidden">
          <video
            src={video.video_url}
            className="w-full h-full"
            controls
            autoPlay
            poster={video.thumbnail_url}
          />

          {/* Top Bar Overlay */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20 text-sm font-bold"
              >
                <ArrowLeft size={16} /> {t('backToGallery')}
              </button>
            </div>
            <button
              onClick={handleClose}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110 border border-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Info Area (Figure 4 Style: Glassmorphism & Pill Buttons) */}
        <div className="mx-4 md:mx-8 -mt-6 mb-8 p-8 lg:p-10 flex flex-col gap-8 glass-effect rounded-[40px] shadow-2xl relative z-20">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-black rounded-full border border-blue-200/50 uppercase tracking-[0.1em]">
                  {t(video.category_l1) || video.category_l1}
                </span>
                {video.category_l2 && (
                  <span className="px-3 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-black rounded-full border border-slate-200/50 uppercase tracking-[0.1em]">
                    {t(video.category_l2) || video.category_l2}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {video.title}
              </h1>

              <div className="flex flex-wrap gap-2.5">
                {(Array.isArray(video.tags) ? video.tags : (video.tags ? video.tags.split(',') : [])).map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-slate-50 text-slate-400 text-xs font-bold rounded-full border border-slate-100 hover:bg-white hover:text-blue-500 hover:border-blue-100 cursor-pointer transition-all">
                    #{t(tag) || tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-3 min-w-max">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-black transition-all transform active:scale-95 shadow-xl ${video._liked || video.is_liked_by_me
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200 hover:brightness-110'
                    : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-100'
                  }`}
              >
                <Heart size={20} className={(video._liked || video.is_liked_by_me) ? 'fill-white' : ''} />
                <span>{video.like_count}</span>
              </button>
              
              <button className="flex items-center justify-center p-3.5 bg-white/80 hover:bg-white text-slate-600 border border-slate-100 rounded-full transition-all shadow-lg active:scale-95">
                <Share2 size={20} />
              </button>

              {video.manim_source_url && (
                <button
                  onClick={() => window.open(video.manim_source_url, '_blank')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white hover:bg-black rounded-full transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  <Code size={20} />
                  <span className="hidden md:inline text-sm font-black">{t('viewCode')}</span>
                </button>
              )}
            </div>
          </div>

          {/* User & Meta (Integrated into glass container) */}
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white/40 rounded-[32px] border border-white/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
                {video.uploader_username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-0.5">{t('uploadedBy') || 'Uploaded by'}</p>
                <p className="text-lg font-black text-slate-800 tracking-tight">@{video.uploader_username}</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{t('viewsCount') || 'Views'}</p>
                <p className="text-lg font-black text-slate-800 tracking-tight">{video.view_count || 0}</p>
              </div>
              <div className="text-center border-l border-slate-200/50 pl-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{t('uploadedDate') || 'Date'}</p>
                <p className="text-lg font-black text-slate-800 tracking-tight">
                  {video.upload_time ? new Date(video.upload_time).toLocaleDateString() : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Real Comment Section Integration */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <CommentSection videoId={id} />
          </div>
        </div>
      </div>
    );
  };

  // If it's a deep link, we render it as a full-page-styled container
  if (!isModal) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="px-4 py-12 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    );
  }

  // Modal Version
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-y-auto"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/40 backdrop-blur-2xl"
        style={{ zIndex: -1 }}
      />

      {/* Modal Container */}
      <motion.div
        layoutId={`video-card-${id}`}
        className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto max-h-full scrollbar-hide z-10 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </motion.div>

      {/* Floating Close Button for Mobile */}
      <button
        onClick={handleClose}
        className="fixed top-8 right-8 z-[110] p-4 bg-white/40 hover:bg-white/60 backdrop-blur-xl rounded-full text-slate-800 border border-white/40 shadow-2xl transition-all transform hover:rotate-90 md:hidden"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default VideoDetail;
