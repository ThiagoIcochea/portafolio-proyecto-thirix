import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { Post } from '../types';
import { getSavedPosts } from '../services/user.service';
import PostCard from '../components/PostCard';

export default function SavedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setPosts(await getSavedPosts()); } catch {} finally { setLoading(false); } })(); }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Publicaciones guardadas</h1>
      {loading ? <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-500" /></div> :
       posts.length === 0 ? <div className="text-center py-20"><Bookmark size={48} className="text-gray-300 mx-auto mb-3" /><h3 className="text-lg font-semibold text-gray-700">Sin publicaciones guardadas</h3><p className="text-gray-400 mt-1">Guarda publicaciones para verlas despues</p></div> :
       <div className="space-y-4">{posts.map(p => <PostCard key={p._id} post={p} initialSaved={true} onDeleted={id => setPosts(pp => pp.filter(x => x._id !== id))} onSavedToggle={(id, saved) => { if (!saved) setPosts(pp => pp.filter(x => x._id !== id)); }} />)}</div>}
    </div>
  );
}
