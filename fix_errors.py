import os
import re

def fix_header():
    path = r'd:\Desktop\数学可视化平台\math-frontend\src\components\Header.jsx'
    with open(path, 'rb') as f:
        content = f.read().decode('utf-8', errors='ignore')
    
    # Fix '发送失败); -> '发送失败');
    content = content.replace("'发送失败);", "'发送失败');")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed Header.jsx")

def fix_comment_item():
    path = r'd:\Desktop\数学可视化平台\math-frontend\src\components\CommentItem.jsx'
    with open(path, 'rb') as f:
        content = f.read().decode('utf-8', errors='ignore')
    
    # Restore the broken like button and Mojibake
    # Note: I need to be careful here as the previous edit corrupted the JSX structure.
    # From my last view_file:
    # 135:           <button 
    # 136:             onClick={handleLike}
    # 137:             disabled={isLiking}
    # 138:             style={{ 
    # 139:           </button>
    
    broken_block = """          <button 
            onClick={handleLike}
            disabled={isLiking}
            style={{ 
          </button>"""
          
    restored_block = """          <button 
            onClick={handleLike}
            disabled={isLiking}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', 
              color: comment.is_liked ? '#ec4899' : 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              transform: isLiking ? 'scale(0.9)' : 'scale(1)'
            }}
          >
            {isLiking ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill={comment.is_liked ? '#ec4899' : 'none'} />}
            {comment.likes_count || 0}
          </button>"""
    
    content = content.replace(broken_block, restored_block)
    
    # Also fix '鍥炲' -> '回复'
    content = content.replace('鍥炲', '回复')
    content = content.replace('收起鍥炲', '收起回复')
    content = content.replace('鏉″洖澶?', '条回复')
    content = content.replace('鍥写下你的回复...', '写下你的回复...')
    content = content.replace('鍙栨秷', '取消')
    content = content.replace('鎻愪氦', '提交')
    content = content.replace('鍒犻櫎', '删除')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed CommentItem.jsx")

if __name__ == "__main__":
    fix_header()
    fix_comment_item()
