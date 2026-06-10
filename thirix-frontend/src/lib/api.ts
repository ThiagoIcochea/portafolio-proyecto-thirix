import axios from 'axios';

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && window.location.hash !== '#/login') {
    window.location.hash = '#/login';
  }
};

const api = axios.create({
  baseURL: 'https://portafolio-proyecto-thirix.onrender.com/api',
  withCredentials: true,
});

let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (cb: () => void) => { unauthorizedHandler = cb; };

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      if (unauthorizedHandler) unauthorizedHandler();
      else redirectToLogin();
    }
    return Promise.reject(e);
  }
);

export default api;
