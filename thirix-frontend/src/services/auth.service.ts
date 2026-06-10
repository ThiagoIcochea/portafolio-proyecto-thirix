import api from '../lib/api';
import { AuthUser } from '../types';

export const register = async (data: any) => { const r = await api.post('/auth/register', data); return r.data; };
export const login = async (data: { email: string; password: string }) => { const r = await api.post('/auth/login', data); return r.data; };
export const getMe = async (): Promise<AuthUser> => { const r = await api.get('/auth/me'); return r.data; };
export const logout = async () => { await api.post('/auth/logout'); };
