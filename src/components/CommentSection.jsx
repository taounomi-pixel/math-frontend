import React, { useState, useEffect } from 'react';
import { Loader2, Send, MessageCircle } from 'lucide-react';
import { API_BASE } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import CommentItem from './CommentItem';

const CommentSection = ({ videoId }) => {
  const { t, lang } = useLanguage();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUserId = localStorage.getItem('user_id');
  const token = localStorage.getItem('access_token');

  const fetchComments = async () => {
    setIsLoading(true);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await fetch(`${API_BASE}/videos/${videoId}/comments`, { headers });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) fetchComments();
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment,
          video_id: videoId
        })
      });
      
      if (!res.ok) throw new Error('Failed to post');
      
      setNewComment('');
      fetchComments(); // Refresh list
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-section" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
          {comments.length} {t('commentsCount') || (lang === 'zh' ? '条评论' : 'Comments')}
        </h2>
      </div>

      {/* Post Comment Input */}
      {token ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', marginBottom: '48px', alignItems: 'start' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            background: 'var(--primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '600', flexShrink: 0
          }}>
            {localStorage.getItem('username')?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('addCommentPlace') || (lang === 'zh' ? '添加评论...' : 'Add a comment...')}
              style={{ 
                width: '100%', border: 'none', borderBottom: '2px solid var(--border-color)', 
                background: 'transparent', padding: '8px 0', minHeight: '40px',
                resize: 'none', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="submit" 
                disabled={!newComment.trim() || isSubmitting}
                className="btn-primary" 
                style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '14px' }}
              >
                {isSubmitting ? <Loader2 className="spinning" size={16} /> : (t('commonSubmit') || (lang === 'zh' ? '评论' : 'Comment'))}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ 
          padding: '24px', textAlign: 'center', background: 'var(--bg-secondary)', 
          borderRadius: '12px', marginBottom: '40px', border: '1px solid var(--border-color)'
        }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {t('loginToComment') || (lang === 'zh' ? '登录后即可发表评论' : 'Log in to leave a comment')}
          </p>
        </div>
      )}

      {/* Comment List */}
      {isLoading && comments.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 className="spinning" size={24} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              videoId={videoId} 
              onRefresh={fetchComments} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
