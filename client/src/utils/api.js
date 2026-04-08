import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000
});

// Track loading state
let loadingCount = 0;
const listeners = new Set();

export function subscribeToLoading(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyLoading() {
  listeners.forEach(cb => cb(loadingCount > 0));
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    loadingCount++;
    notifyLoading();
    return config;
  },
  (error) => {
    loadingCount = Math.max(0, loadingCount - 1);
    notifyLoading();
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    loadingCount = Math.max(0, loadingCount - 1);
    notifyLoading();
    return response;
  },
  (error) => {
    loadingCount = Math.max(0, loadingCount - 1);
    notifyLoading();

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('typezone_auth');
      window.location.href = '/login';
    }

    // Improve error message
    const message = error.response?.data?.message || error.message || 'An error occurred';
    error.message = message;

    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function isLoading() {
  return loadingCount > 0;
}

export default api;
