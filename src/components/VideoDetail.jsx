import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, Share2, MessageCircle, User, Calendar, 
  ChevronRight, Play, Maximize2, Download, Trash2, 
  Loader2, AlertCircle, Bookmark
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE } from '../utils/api';
import Header from './Header';
import Home from '../pages/Home';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);

  const isModal = !!location.state?.backgroundLocation;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/videos/${id}`, { headers });
        if (!res.ok) throw new Error(t('errVideoNotFound') || 'Video not found');
        const data = await res.json();
        setVideo(data);
        
        // Fetch comments
        const commRes = await fetch(`${API_BASE}/videos/${id}/comments`, { headers });
        if (commRes.ok) {
          const commData = await commRes.json();
          setComments(commData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, t]);

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert(t('loginToLike'));
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
    if (loading) {
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
            <h2 className="text-white font-bold text-xl drop-shadow-md line-clamp-1">{video.title}</h2>
            <button 
              onClick={handleClose}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110 border border-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Info Area */}
        <div className="p-8 lg:p-10 flex flex-col gap-8 bg-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 uppercase tracking-widest">
                  {t(video.category_l1) || video.category_l1}
                </span>
                {video.category_l2 && (
                  <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-100 uppercase tracking-widest">
                    {t(video.category_l2) || video.category_l2}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap gap-3">
                {video.tags?.map(tag => (
                  <span key={tag} className="text-sm font-semibold text-slate-400 hover:text-blue-500 cursor-pointer transition-colors">
                    #{t(tag) || tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-3 min-w-max">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all transform active:scale-95 ${
                  video._liked 
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 hover:bg-pink-600' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                <Heart size={20} className={video._liked ? 'fill-white' : ''} />
                <span>{video.like_count}</span>
              </button>
              <button className="flex items-center justify-center p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* User & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
                {video.uploader_username?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('uploadedBy') || 'Uploaded by'}</p>
                <p className="text-lg font-bold text-slate-800">@{video.uploader_username}</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('viewsCount') || 'Views'}</p>
                <p className="text-lg font-black text-slate-800">{video.view_count || 0}</p>
              </div>
              <div className="text-center border-l border-slate-200 pl-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('uploadedDate') || 'Date'}</p>
                <p className="text-lg font-black text-slate-800">
                  {video.upload_time ? new Date(video.upload_time).toLocaleDateString() : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Manim Code Section (If available) */}
          {video.manim_source_url && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Bookmark className="text-blue-500" size={24} />
                  {t('sourceCode')}
                </h3>
                <a 
                  href={video.manim_source_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                >
                  <Download size={14} />
                  {t('downloadSource')}
                </a>
              </div>
              <div className="bg-slate-900 rounded-3xl p-6 overflow-x-auto border border-slate-800 shadow-xl shadow-slate-200">
                <pre className="text-indigo-200 text-sm font-mono leading-relaxed">
                  <code># Manim Visualization Source Code Available</code>
                </pre>
              </div>
            </div>
          )}

          {/* Comments Placeholder */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageCircle className="text-blue-500" size={24} />
              {t('comments')} ({comments.length})
            </h3>
            
            <div className="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">{t('commentsComingSoon') || 'Comments section coming soon...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If it's a deep link, we wrap with the Layout and Background
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl"
      />
      
      {/* Modal Container */}
      <motion.div 
        layoutId={`video-${id}`}
        className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto max-h-full scrollbar-hide z-10 border border-white/20"
      >
        <motion.div 
          layoutId={`image-${id}`}
          className="w-full"
        >
          {renderContent()}
        </motion.div>
      </motion.div>

      {/* Extreme close button for mobile convenience */}
      <button 
        onClick={handleClose}
        className="fixed top-8 right-8 z-[110] p-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white border border-white/20 shadow-2xl transition-all transform hover:rotate-90 md:hidden"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default VideoDetail;
