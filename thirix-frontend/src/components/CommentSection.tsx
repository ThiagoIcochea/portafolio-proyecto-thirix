import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Comment, User } from '../types';
import { getComments, addComment, deleteComment } from '../services/post.service';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

interface Props { postId: string; onCommentAdded?: () => void }

export default function CommentSection({ postId, onCommentAdded }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setComments(await getComments(postId)); } catch {} finally { setLoading(false); } })(); }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try { const c = await addComment(postId, text.trim()); setComments(p => [...p, c]); setText(''); onCommentAdded?.(); }
    catch { Swal.fire('Error', 'No se pudo publicar el comentario', 'error'); }
  };

  const handleDelete = async (id: string) => {
    const r = await Swal.fire({ title: 'Eliminar comentario', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#ef4444' });
    if (r.isConfirmed) { try { await deleteComment(id); setComments(p => p.filter(c => c._id !== id)); } catch { Swal.fire('Error', 'No se pudo eliminar', 'error'); } }
  };

  const timeAgo = (d: string) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; };

  return (
    <div className="border-t border-gray-100 bg-gray-50/50">
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {loading ? <p className="text-xs text-gray-400 text-center py-2">Cargando...</p> :
         comments.length === 0 ? <p className="text-xs text-gray-400 text-center py-2">Sin comentarios</p> :
         comments.map(c => {
           const a = typeof c.author === 'object' && c.author !== null ? (c.author as User) : null;
           const own = user && a ? user._id === a._id : false;
           return (
             <div key={c._id} className="group">
               <div className="flex items-start gap-2.5">
                 {a ? (
                   <Link to={`/profile/${a._id}`}><img src={a.avatar || `https://ui-avatars.com/api/?name=${a.firstName}+${a.lastName}&background=3b82f6&color=fff`} alt="" className="w-7 h-7 rounded-full object-cover" /></Link>
                 ) : (
                   <div className="w-7 h-7 rounded-full bg-gray-200" />
                 )}
                 <div className="flex-1 min-w-0">
                   <div className="bg-white rounded-xl px-3 py-2 border border-gray-100">
                     <div className="flex items-center gap-2">
                       {a ? (
                         <Link to={`/profile/${a._id}`} className="font-semibold text-xs text-gray-900 hover:text-primary-600">{a.firstName} {a.lastName}</Link>
                       ) : (
                         <span className="font-semibold text-xs text-gray-900">Usuario eliminado</span>
                       )}
                       <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                     </div>
                     <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                   </div>
                   {own && <button onClick={() => handleDelete(c._id)} className="text-[10px] text-gray-400 hover:text-red-500 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>}
                 </div>
               </div>
             </div>
           );
         })}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Escribe un comentario..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all" />
        <button type="submit" disabled={!text.trim()} className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors disabled:opacity-40"><Send size={18} /></button>
      </form>
    </div>
  );
}
