import api from '../lib/api';
import { Post, Comment } from '../types';

export const createPost = async (data: FormData): Promise<Post> => { const r = await api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } }); return r.data; };
export const getPosts = async (): Promise<Post[]> => { const r = await api.get('/posts'); return r.data; };
export const getPostById = async (id: string): Promise<Post> => { const r = await api.get(`/posts/${id}`); return r.data; };
export const updatePost = async (id: string, data: Partial<Post>): Promise<Post> => { const r = await api.put(`/posts/${id}`, data); return r.data; };
export const deletePost = async (id: string) => { await api.delete(`/posts/${id}`); };
export const toggleLike = async (id: string) => { const r = await api.post(`/posts/${id}/like`); return r.data; };
export const addComment = async (postId: string, content: string): Promise<Comment> => { const r = await api.post(`/posts/${postId}/comments`, { content }); return r.data; };
export const getComments = async (postId: string): Promise<Comment[]> => { const r = await api.get(`/posts/${postId}/comments`); return r.data; };
export const deleteComment = async (id: string) => { await api.delete(`/comments/${id}`); };
