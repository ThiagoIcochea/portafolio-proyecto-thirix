import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Search } from 'lucide-react';
import { Conversation, User } from '../types';
import { getConversations } from '../services/message.service';
import { useAuth } from '../contexts/AuthContext';

export default function Messages() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => { (async () => { try { setConvs(await getConversations()); } catch {} finally { setLoading(false); } })(); }, []);

  const other = (c: Conversation) => (c.participants as User[]).find(p => p._id !== user?._id) || null;
  const filtered = convs.filter(c => { const o = other(c); if (!o) return false; const q = search.toLowerCase(); return o.firstName.toLowerCase().includes(q) || o.username.toLowerCase().includes(q); });
  const timeAgo = (d: string) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
      </div>
      <div className="relative mb-4"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conversaciones..." className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all shadow-sm" /></div>

      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div> :
       filtered.length === 0 ? <div className="text-center py-12"><MessageCircle size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-400">No hay conversaciones</p><p className="text-gray-300 text-sm mt-1">Busca personas y enviales un mensaje</p></div> :
       <div className="space-y-2">{filtered.map(c => { const o = other(c); if (!o) return null; return <Link key={c._id} to={`/messages/${c._id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all group"><img src={o.avatar || `https://ui-avatars.com/api/?name=${o.firstName}+${o.lastName}&background=3b82f6&color=fff`} alt="" className="w-12 h-12 rounded-full object-cover" /><div className="flex-1 min-w-0"><p className="font-semibold text-sm text-gray-900 group-hover:text-primary-600 transition-colors">{o.firstName} {o.lastName}</p><p className="text-xs text-gray-400 truncate">@{o.username}</p>{c.lastMessage && <p className="text-sm text-gray-500 truncate mt-0.5">{c.lastMessage}</p>}</div><span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.updatedAt)}</span></Link>; })}</div>}
    </div>
  );
}
