/**
 * Simple helper to format dates into relative time strings (e.g., "5 minutes ago")
 * Supports English and Chinese based on the lang parameter
 */
export const formatRelativeTime = (dateString, lang = 'zh') => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0) return lang === 'zh' ? '刚刚' : 'just now';

  const units = [
    { name: lang === 'zh' ? '年' : 'year', seconds: 31536000 },
    { name: lang === 'zh' ? '个月' : 'month', seconds: 2592000 },
    { name: lang === 'zh' ? '天' : 'day', seconds: 86400 },
    { name: lang === 'zh' ? '小时' : 'hour', seconds: 3600 },
    { name: lang === 'zh' ? '分钟' : 'minute', seconds: 60 },
    { name: lang === 'zh' ? '秒' : 'second', seconds: 1 },
  ];

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) {
      if (lang === 'zh') {
        return `${value}${unit.name}前`;
      } else {
        return `${value} ${unit.name}${value > 1 ? 's' : ''} ago`;
      }
    }
  }

  return lang === 'zh' ? '刚刚' : 'just now';
};
