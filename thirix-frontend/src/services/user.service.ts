import api from '../lib/api';
import { User, Post } from '../types';

export const getProfile = async (): Promise<User> => { const r = await api.get('/users/profile'); return r.data.user || r.data; };
export const updateProfile = async (data: Partial<User>): Promise<User> => { const r = await api.put('/users/profile', data); return r.data.user || r.data; };
export const uploadAvatar = async (avatar: File) => {
  const fd = new FormData();
  fd.append('avatar', avatar);
  const r = await api.put('/users/avatar', fd);
  return r.data.user || r.data;
};

export const uploadCoverImage = async (coverImage: File) => {
  const fd = new FormData();
  fd.append('coverImage', coverImage);
  const r = await api.put('/users/cover-image', fd);
  return r.data.user || r.data;
};
export const searchUsers = async (q: string): Promise<User[]> => {
  const r = await api.get('/users/search', { params: { q } });
  const rawUsers = Array.isArray(r.data)
    ? r.data
    : Array.isArray(r.data.users)
      ? r.data.users
      : [];

  return rawUsers.map((u: any) => {
    const followers = u.followers;
    const following = u.following;
    const followersCount = typeof followers === 'number'
      ? followers
      : u.followersCount ?? u.followers_count ?? u._count?.followers ?? (Array.isArray(followers) ? followers.length : 0);
    const followingCount = typeof following === 'number'
      ? following
      : u.followingCount ?? u.following_count ?? u._count?.following ?? (Array.isArray(following) ? following.length : 0);

    return {
      ...u,
      followers: Array.isArray(followers) ? followers : [],
      following: Array.isArray(following) ? following : [],
      followersCount,
      followingCount,
    };
  });
};
export const toggleSavePost = async (id: string) => { const r = await api.post(`/users/saved-posts/${id}`); return r.data; };
export const getSavedPosts = async (): Promise<Post[]> => {
  const r = await api.get('/users/saved-posts');
  if (Array.isArray(r.data)) return r.data;
  if (Array.isArray(r.data.posts)) return r.data.posts;
  if (Array.isArray(r.data.savedPosts)) return r.data.savedPosts;
  return [];
};
export const getUserById = async (id: string): Promise<User> => { const r = await api.get(`/users/${id}`); return r.data.user || r.data; };
export const followUser = async (id: string) => { const r = await api.post(`/users/${id}/follow`); return r.data; };
export const unfollowUser = async (id: string) => { const r = await api.post(`/users/${id}/unfollow`); return r.data; };
