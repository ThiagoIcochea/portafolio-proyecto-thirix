import axios, { AxiosHeaders } from 'axios';

const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

const getCurrentRoute = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hash.replace(/^#/, '');
};

const redirectToLogin = () => {
  const currentRoute = getCurrentRoute();
  if (typeof window !== 'undefined' && currentRoute !== '/login' && currentRoute !== '/register') {
    window.location.hash = '#/login';
  }
};

const api = axios.create({
  baseURL: 'https://portafolio-proyecto-thirix.onrender.com/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      const headers = config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers);

      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
  }
  return config;
});

let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (cb: (() => void) | null) => { unauthorizedHandler = cb; };

api.interceptors.response.use(
  (r) => r,
  (e) => {
    const isAuthRequest = e.config?.url?.includes('/auth/login') || e.config?.url?.includes('/auth/me');

    if (e.response?.status === 401 && !isAuthRequest) {
      if (unauthorizedHandler) unauthorizedHandler();
      else redirectToLogin();
    }
    return Promise.reject(e);
  }
);

export default api;
