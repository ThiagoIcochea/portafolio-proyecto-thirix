import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const navigate = useNavigate();

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
      else navigate('/login');
    }
    return Promise.reject(e);
  }
);

export default api;
