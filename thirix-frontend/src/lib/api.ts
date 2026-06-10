import axios from 'axios';

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
