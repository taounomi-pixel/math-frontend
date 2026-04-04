/**
 * Converts a date string into a relative time string (e.g., "4 days ago").
 * Lightweight implementation without external dependencies.
 */
export const getRelativeTime = (dateString, lang = 'zh') => {
  if (!dateString) return '';
  
  const now = new Date();
  const past = new Date(dateString);
  
  // Basic validation
  if (isNaN(past.getTime())) return dateString;

  const diffInMs = now - past;
  const diffInSec = Math.floor(diffInMs / 1000);
  
  // Future dates (sanity check)
  if (diffInSec < 0) return lang === 'zh' ? '鍒氬垰' : 'Just now';

  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  const diffInMonth = Math.floor(diffInDay / 30);
  const diffInYear = Math.floor(diffInMonth / 12);

  if (lang === 'zh') {
    if (diffInSec < 60) return '鍒氬垰';
    if (diffInMin < 60) return `${diffInMin} 鍒嗛挓鍓峘;
    if (diffInHour < 24) return `${diffInHour} 灏忔椂鍓峘;
    if (diffInDay < 30) return `${diffInDay} 澶╁墠`;
    if (diffInMonth < 12) return `${diffInMonth} 涓湀鍓峘;
    return `${diffInYear} 骞村墠`;
  } else {
    if (diffInSec < 60) return 'Just now';
    if (diffInMin < 60) return `${diffInMin === 1 ? '1 minute' : diffInMin + ' minutes'} ago`;
    if (diffInHour < 24) return `${diffInHour === 1 ? '1 hour' : diffInHour + ' hours'} ago`;
    if (diffInDay < 30) return `${diffInDay === 1 ? '1 day' : diffInDay + ' days'} ago`;
    if (diffInMonth < 12) return `${diffInMonth === 1 ? '1 month' : diffInMonth + ' months'} ago`;
    return `${diffInYear === 1 ? '1 year' : diffInYear + ' years'} ago`;
  }
};
