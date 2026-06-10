import api from '../lib/api';
import { AuthUser } from '../types';

const getAuthUserFromResponse = (payload: any): AuthUser => payload?.user ?? payload?.data ?? payload;

export const register = async (data: any) => { const r = await api.post('/auth/register', data); return r.data; };
export const login = async (data: { email: string; password: string }) => {
  const r = await api.post('/auth/login', data);
  return {
    data: r.data,
    headers: r.headers,
  };
};
export const getMe = async (): Promise<AuthUser> => {
  const candidates = ['/auth/me', '/users/me', '/me'];

  for (let index = 0; index < candidates.length; index += 1) {
    try {
      const r = await api.get(candidates[index]);
      return getAuthUserFromResponse(r.data);
    } catch (error: any) {
      if (error?.response?.status !== 404 || index === candidates.length - 1) {
        throw error;
      }
    }
  }

  throw new Error('No auth endpoint available');
};
export const logout = async () => { await api.post('/auth/logout'); };
