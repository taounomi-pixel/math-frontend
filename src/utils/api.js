/**
 * Centralized API base URL.
 * Priority: VITE_API_URL env var 鈫?known Render production URL
 *
 * The old fallback `http://${hostname}:8000/api` is intentionally removed:
 * it produces an HTTP request inside an HTTPS page, which browsers block
 * as mixed content, causing "Failed to fetch" silently.
 */
export const API_BASE =
  import.meta.env.VITE_API_URL || 'https://math-backend-0wl0.onrender.com/api';
