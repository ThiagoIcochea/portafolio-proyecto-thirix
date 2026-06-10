import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, MapPin, MoreHorizontal, Trash2 } from 'lucide-react';
import { Post, User } from '../types';
import { toggleLike, deletePost } from '../services/post.service';
import { toggleSavePost } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from './CommentSection';
import Swal from 'sweetalert2';

interface Props { post: Post; onDeleted?: (id: string) => void; onSavedToggle?: (id: string, saved: boolean) => void; initialSaved?: boolean }

export default function PostCard({ post, onDeleted, onSavedToggle, initialSaved }: Props) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<string[]>(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [saved, setSaved] = useState(post.saved ?? initialSaved ?? false);
  const [menuOpen, setMenuOpen] = useState(false);
  const author = typeof post.author === 'object' && post.author !== null ? (post.author as User) : null;
  const authorLink = author ? `/profile/${author._id}` : '/';
  const authorName = author ? `${author.firstName} ${author.lastName}` : 'Usuario eliminado';
  const authorUsername = author ? `@${author.username}` : 'Autor no disponible';
  const isLiked = user ? likes.includes(user._id) : false;
  const isOwner = user && author ? author._id === user._id : false;

  const handleLike = async () => {
    if (!user) return;
    try {
      await toggleLike(post._id);
      setLikes(p => isLiked ? p.filter(i => i !== user._id) : [...p, user._id]);
    } catch {
      Swal.fire('Error', 'No se pudo dar like', 'error');
    }
  };
  const handleSave = async () => {
    try {
      const newSaved = !saved;
      await toggleSavePost(post._id);
      setSaved(newSaved);
      onSavedToggle?.(post._id, newSaved);
    } catch {
      Swal.fire('Error', 'No se pudo guardar', 'error');
    }
  };
  const handleDelete = async () => {
    const r = await Swal.fire({
      title: 'Eliminar publicacion',
      text: 'Esta accion no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });
    if (r.isConfirmed) {
      try {
        await deletePost(post._id);
        onDeleted?.(post._id);
      } catch {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const timeAgo = (d: string) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link to={authorLink} className="flex items-center gap-3 group">
            <img src={author?.avatar || `https://ui-avatars.com/api/?name=${author?.firstName ?? 'Usuario'}+${author?.lastName ?? 'Anonimo'}&background=3b82f6&color=fff`} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all" />
            <div>
              <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{authorName}</p>
              <p className="text-xs text-gray-400">{authorUsername} · {timeAgo(post.createdAt)}</p>
            </div>
          </Link>
          {isOwner && <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>
            {menuOpen && <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]"><button onClick={handleDelete} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} />Eliminar</button></div>}
          </div>}
        </div>
        <p className="mt-3 text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.location && <div className="mt-2 flex items-center gap-1 text-xs text-gray-400"><MapPin size={12} />{post.location}</div>}
        {post.hashtags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{post.hashtags.map((t, i) => <span key={i} className="text-xs text-primary-500 font-medium">#{t}</span>)}</div>}
      </div>
      {post.media?.length > 0 && <div className={`grid ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {post.media.map((m, i) => <div key={i} className={`${post.media.length === 3 && i === 0 ? 'col-span-2' : ''}`}>
          {m.type === 'video' ? <video src={m.url} controls className="w-full max-h-[500px] object-cover bg-black" /> : <img src={m.url} alt="" className="w-full max-h-[500px] object-cover" />}
        </div>)}
      </div>}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-all ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} className="transition-transform active:scale-125" /><span className="font-medium">{likes.length}</span>
            </button>
            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"><MessageCircle size={20} /><span className="font-medium">{commentsCount}</span></button>
          </div>
          <button onClick={handleSave} className={`transition-colors ${saved ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'}`}><Bookmark size={20} fill={saved ? 'currentColor' : 'none'} /></button>
        </div>
      </div>
      {showComments && <CommentSection postId={post._id} onCommentAdded={() => setCommentsCount(c => c + 1)} />}
    </div>
  );
}
