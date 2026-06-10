import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

let unauthorizedHandler: (() => void) | null = null;
export const setUnauthorizedHandler = (cb: () => void) => { unauthorizedHandler = cb; };

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      if (unauthorizedHandler) unauthorizedHandler();
      else window.location.href = '/login';
    }
    return Promise.reject(e);
  }
);

export default api;
