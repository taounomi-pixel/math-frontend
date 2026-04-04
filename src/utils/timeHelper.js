/**
 * Simple helper to format dates into relative time strings (e.g., "5 minutes ago")
 * Supports English and Chinese based on the lang parameter
 */
export const formatRelativeTime = (dateString, lang = 'zh') => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0) return lang === 'zh' ? '鍒氬垰' : 'just now';

  const units = [
    { name: lang === 'zh' ? '骞? : 'year', seconds: 31536000 },
    { name: lang === 'zh' ? '涓湀' : 'month', seconds: 2592000 },
    { name: lang === 'zh' ? '澶? : 'day', seconds: 86400 },
    { name: lang === 'zh' ? '灏忔椂' : 'hour', seconds: 3600 },
    { name: lang === 'zh' ? '鍒嗛挓' : 'minute', seconds: 60 },
    { name: lang === 'zh' ? '绉? : 'second', seconds: 1 },
  ];

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) {
      if (lang === 'zh') {
        return `${value}${unit.name}鍓峘;
      } else {
        return `${value} ${unit.name}${value > 1 ? 's' : ''} ago`;
      }
    }
  }

  return lang === 'zh' ? '鍒氬垰' : 'just now';
};
