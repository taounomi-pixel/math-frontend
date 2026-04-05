/**
 * Simple helper to format dates into relative time strings.
 * Supports English and Chinese based on the lang parameter.
 */
export const formatRelativeTime = (dateString, lang = 'zh') => {
  if (!dateString) return '';
  let dtStr = dateString;
  // If the date string lacks timezone info, assume it's UTC from the backend
  if (typeof dtStr === 'string' && !dtStr.endsWith('Z') && !dtStr.includes('+') && !dtStr.match(/-\d{2}:\d{2}$/)) {
    dtStr += 'Z';
  }
  const now = new Date();
  const date = new Date(dtStr);
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));

  if (diffInSeconds < 10) return lang === 'zh' ? '刚刚' : 'just now';

  if (diffInSeconds < 60) return lang === 'zh' ? `${diffInSeconds}秒前` : `${diffInSeconds} seconds ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return lang === 'zh' ? `${diffInMinutes}分钟前` : `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return lang === 'zh' ? `${diffInHours}小时前` : `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays <= 3) return lang === 'zh' ? `${diffInDays}天前` : `${diffInDays} days ago`;

  // Greater than 3 days, show date
  const isSameYear = now.getFullYear() === date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  if (lang === 'zh') {
    if (isSameYear) {
      return `${month}月${day}日`;
    } else {
      return `${year}年${month}月${day}日`;
    }
  } else {
    // Basic English fallback
    const monthShort = date.toLocaleString('en-US', { month: 'short' });
    if (isSameYear) {
      return `${monthShort} ${day}`;
    } else {
      return `${monthShort} ${day}, ${year}`;
    }
  }
};

