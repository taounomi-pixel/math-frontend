import React, { useState, useEffect, useRef } from 'react';
import { Heart, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { getRelativeTime } from '../utils/RelativeTimeHelper';
import { API_BASE } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import GeometricLoader from './GeometricLoader';

const CommentItem = ({ comment, videoId, onRefresh, isReply = false }) => {
  const { t, lang } = useLanguage();
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const token = localStorage.getItem('access_token');
  const currentUserId = localStorage.getItem('user_id');

  const [tick, setTick] = useState(0);

  // Force re-render periodically so relative time updates dynamically
  useEffect(() => {
    // Only set up interval for recent comments (e.g., less than roughly a day old)
    const commentDate = new Date(comment.created_at + (comment.created_at.includes('Z') ? '' : 'Z'));
    const isRecent = (Date.now() - commentDate.getTime()) < 86400000;
    
    if (isRecent) {
      const interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [comment.created_at]);

  const [localLiked, setLocalLiked] = useState(comment.is_liked);
  const [localLikesCount, setLocalLikesCount] = useState(comment.likes_count);
  const isLikingRef = useRef(false);

  useEffect(() => {
    // Only update from props if they actually change and we aren't in the middle of a like action
    if (!isLikingRef.current) {
      if (comment.is_liked !== localLiked) setLocalLiked(comment.is_liked);
      if (comment.likes_count !== localLikesCount) setLocalLikesCount(comment.likes_count);
    }
  }, [comment.is_liked, comment.likes_count]);

  const handleLike = async () => {
    if (!token) {
      alert(t('loginToLike') || (lang === 'zh' ? '请先登录后点赞' : 'Please login to like'));
      return;
    }
    
    if (isLikingRef.current) return;
    isLikingRef.current = true;

    // Optimistically update UI
    const originalLiked = localLiked;
    const originalCount = localLikesCount;
    setLocalLiked(!originalLiked);
    setLocalLikesCount(originalCount + (originalLiked ? -1 : 1));

    try {
      const res = await fetch(`${API_BASE}/comments/${comment.id}/toggle-like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Toggle like failed');
      const data = await res.json();
      
      // Update with exact truth from server silently
      setLocalLiked(data.action === 'liked');
      setLocalLikesCount(data.like_count);
    } catch (e) {
      console.error('Like toggle failed:', e);
      // Revert on failure
      setLocalLiked(originalLiked);
      setLocalLikesCount(originalCount);
      alert(t('networkError') || (lang === 'zh' ? '网络错误，请重试' : 'Network error, please try again'));
    } finally {
      isLikingRef.current = false;
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !token) return;

    setIsSubmittingReply(true);
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyContent,
          video_id: videoId,
          parent_id: comment.id
        })
      });
      if (!res.ok) throw new Error('Reply failed');
      setReplyContent('');
      setIsReplying(false);
      setShowReplies(true);
      onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    const confirmText = lang === 'zh' ? '确定要删除这条评论吗？' : 'Are you sure you want to delete this comment?';
    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`${API_BASE}/comments/${comment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      onRefresh();
    } catch (e) {
      alert(e.message);
    }
  };

  const replies = comment.replies || [];

  return (
    <div style={{ display: 'flex', gap: '12px', marginTop: isReply ? '16px' : '0' }}>
      {/* Avatar Placeholder */}
      <div style={{
        width: isReply ? '32px' : '40px',
        height: isReply ? '32px' : '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(80, 160, 240, 0.3), rgba(168, 85, 247, 0.3))',
        backdropFilter: 'blur(10px)',
        border: '2px solid var(--border-color)',
        color: 'var(--text-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isReply ? '14px' : '18px', fontWeight: '700', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.6)'
      }}>
        {comment.username?.charAt(0).toUpperCase()}
      </div>

      <div style={{ flex: 1 }}>
        {/* Header Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
            {comment.username}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }} data-tick={tick}>
            {getRelativeTime(comment.created_at, lang)}
          </span>
        </div>

        {/* Comment Content */}
        <p style={{
          margin: '4px 0', fontSize: '15px', color: 'var(--text-primary)',
          lineHeight: '1.6', whiteSpace: 'pre-wrap'
        }}>
          {comment.content}
        </p>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: localLiked ? '#ec4899' : 'var(--text-secondary)',
              fontSize: '13px', padding: 0, transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={16} fill={localLiked ? 'currentColor' : 'none'} />
            <span style={{ fontWeight: '600' }}>{localLikesCount > 0 ? localLikesCount : ''}</span>
          </button>

          <button 
            onClick={() => setIsReplying(!isReplying)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600'
            }}
          >
            {t('reply') || (lang === 'zh' ? '回复' : 'Reply')}
          </button>

          {currentUserId && parseInt(currentUserId) === comment.user_id && (
            <button
              onClick={handleDelete}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#ef4444', fontSize: '13px', marginLeft: 'auto'
              }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Reply Submission Form */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'start' }}>
            <textarea
              autoFocus
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={lang === 'zh' ? '写下你的回复...' : 'Add a reply...'}
              style={{
                flex: 1, border: 'none', borderBottom: '2px solid var(--primary)',
                background: 'transparent', padding: '6px 0', minHeight: '32px',
                resize: 'none', fontSize: '14px', outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
              <button type="button" onClick={() => setIsReplying(false)} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>
                {lang === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim() || isSubmittingReply}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '18px' }}
              >
                {isSubmittingReply ? <GeometricLoader size={14} /> : (lang === 'zh' ? '回复' : 'Reply')}
              </button>
            </div>
          </form>
        )}

        {/* Recursive Replies Section */}
        {replies.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={() => setShowReplies(!showReplies)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', fontSize: '14px', fontWeight: '700',
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 0'
              }}
            >
              {showReplies ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              {showReplies
                ? (lang === 'zh' ? '隐藏回复' : 'Hide replies')
                : (lang === 'zh' ? `查看 ${replies.length} 条回复` : `View ${replies.length} replies`)
              }
            </button>

            {showReplies && (
              <div style={{
                borderLeft: '2px solid var(--border-color)',
                paddingLeft: '20px', marginLeft: '4px', marginTop: '8px'
              }}>
                {replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    videoId={videoId}
                    onRefresh={onRefresh}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
