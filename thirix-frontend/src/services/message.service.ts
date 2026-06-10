import api from '../lib/api';
import { Conversation, Message } from '../types';

export const createConversation = async (userId: string): Promise<Conversation> => { const r = await api.post('/conversations', { userId }); return r.data; };
export const getConversations = async (): Promise<Conversation[]> => { const r = await api.get('/conversations'); return r.data; };
export const sendMessage = async (id: string, data: FormData | { text: string }): Promise<Message> => {
  if (data instanceof FormData) {
  
    const r = await api.post(`/messages/${id}`, data);
    return r.data;
  }
  const r = await api.post(`/messages/${id}`, data);
  return r.data;
};
export const getMessages = async (id: string): Promise<Message[]> => { const r = await api.get(`/messages/${id}`); return r.data; };
export const markAsRead = async (id: string) => { await api.put(`/messages/read/${id}`); };
