/**
 * Converts a date string into a relative time string (e.g., "4 days ago").
 * Lightweight implementation without external dependencies.
 */
export const getRelativeTime = (dateString, lang = 'zh') => {
  if (!dateString) return '';
  
  let dtStr = dateString;
  // If the date string lacks timezone info, assume it's UTC from the backend
  if (typeof dtStr === 'string' && !dtStr.endsWith('Z') && !dtStr.includes('+') && !dtStr.match(/-\d{2}:\d{2}$/)) {
    dtStr += 'Z';
  }
  const now = new Date();
  const past = new Date(dtStr);
  
  // Basic validation
  if (isNaN(past.getTime())) return dateString;

  const diffInMs = now - past;
  const diffInSec = Math.floor(diffInMs / 1000);
  
  // Future dates (sanity check)
  if (diffInSec < 0) return lang === 'zh' ? '刚刚' : 'Just now';

  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  const diffInMonth = Math.floor(diffInDay / 30);
  const diffInYear = Math.floor(diffInMonth / 12);

  if (lang === 'zh') {
    if (diffInSec < 60) return '刚刚';
    if (diffInMin < 60) return `${diffInMin} 分钟前`;
    if (diffInHour < 24) return `${diffInHour} 小时前`;
    if (diffInDay < 30) return `${diffInDay} 天前`;
    if (diffInMonth < 12) return `${diffInMonth} 个月前`;
    return `${diffInYear} 年前`;
  } else {
    if (diffInSec < 60) return 'Just now';
    if (diffInMin < 60) return `${diffInMin === 1 ? '1 minute' : diffInMin + ' minutes'} ago`;
    if (diffInHour < 24) return `${diffInHour === 1 ? '1 hour' : diffInHour + ' hours'} ago`;
    if (diffInDay < 30) return `${diffInDay === 1 ? '1 day' : diffInDay + ' days'} ago`;
    if (diffInMonth < 12) return `${diffInMonth === 1 ? '1 month' : diffInMonth + ' months'} ago`;
    return `${diffInYear === 1 ? '1 year' : diffInYear + ' years'} ago`;
  }
};
