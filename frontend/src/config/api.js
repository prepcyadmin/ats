// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/resumes/health`,
  ANALYZE: `${API_BASE_URL}/resumes/analyze`,
  EXPORT: `${API_BASE_URL}/resumes/export`,
};

export default API_BASE_URL;
