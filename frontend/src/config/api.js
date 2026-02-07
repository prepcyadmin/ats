// API Configuration
// Normalize API URL to always end with /api/v1
const normalizeApiUrl = (url) => {
  if (!url) return 'http://localhost:5000/api/v1';
  // Remove trailing slash if present
  url = url.replace(/\/$/, '');
  // Ensure it ends with /api/v1
  if (!url.endsWith('/api/v1')) {
    if (url.endsWith('/api')) {
      url = url + '/v1';
    } else {
      url = url + '/api/v1';
    }
  }
  return url;
};

const API_BASE_URL = normalizeApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1');

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/resumes/health`,
  ANALYZE: `${API_BASE_URL}/resumes/analyze`,
  EXPORT: `${API_BASE_URL}/resumes/export`,
};

export { normalizeApiUrl };
export default API_BASE_URL;
