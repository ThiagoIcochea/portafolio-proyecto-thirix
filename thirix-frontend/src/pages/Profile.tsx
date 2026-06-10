import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User as U, Post } from '../types';
import { getUserById, followUser, unfollowUser } from '../services/user.service';
import { getPosts } from '../services/post.service';
import { getSavedPosts } from '../services/user.service';
import { createConversation } from '../services/message.service';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { MapPin, Link as LinkIcon, Briefcase, Calendar, UserPlus, UserMinus, MessageCircle, Settings, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<U | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const own = me?._id === userId;

  useEffect(() => {
    (async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const u = await getUserById(userId);
        setProfile(u);
        setIsFollowing(u.followers.includes(me?._id || ''));
        const all = await getPosts();
        setPosts(all.filter(p => {
          const authorId = typeof p.author === 'string' ? p.author : (p.author as any)?._id;
          return authorId === userId;
        }));
          if (me) {
            try {
              const saved = await getSavedPosts();
              const savedIds = new Set(saved.map(s => s._id));
              setPosts(prevPosts => prevPosts.map(p => ({ ...p, saved: savedIds.has(p._id) })));
            } catch (e) {
              console.error('Failed to load saved posts for marking:', e);
            }
          }
      } catch {
        Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, me]);

  const handleFollow = async () => {
    if (!me || !userId) return;
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setProfile(p => p ? { ...p, followers: p.followers.filter(i => i !== me._id) } : p);
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setProfile(p => p ? { ...p, followers: [...p.followers, me._id] } : p);
      }
    } catch {
      Swal.fire('Error', 'No se pudo completar', 'error');
    }
  };
  const handleMsg = async () => {
    if (!userId) return;
    try {
      const c = await createConversation(userId);
      navigate(`/messages/${c._id}`);
    } catch {
      Swal.fire('Error', 'No se pudo crear la conversacion', 'error');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-500" /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Usuario no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-700">{profile.coverImage && <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />}</div>
      <div className="relative px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
          <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=3b82f6&color=fff&size=128`} alt="" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg" />
          <div className="flex-1 sm:pb-1"><h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1><p className="text-sm text-gray-400">@{profile.username}</p></div>
          <div className="flex items-center gap-2 sm:pb-1">
            {own ? <Link to="/edit-profile" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"><Settings size={16} />Editar perfil</Link> :
            <><button onClick={handleFollow} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>{isFollowing ? <><UserMinus size={16} />Siguiendo</> : <><UserPlus size={16} />Seguir</>}</button>
            <button onClick={handleMsg} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"><MessageCircle size={16} />Mensaje</button></>}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {profile.bio && <p className="text-gray-700 text-sm">{profile.bio}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {profile.profession && <span className="flex items-center gap-1"><Briefcase size={13} />{profile.profession}</span>}
            {profile.location && <span className="flex items-center gap-1"><MapPin size={13} />{profile.location}</span>}
            {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-500 hover:underline"><LinkIcon size={13} />{profile.website.replace(/^https?:\/\//, '')}</a>}
            <span className="flex items-center gap-1"><Calendar size={13} />Se unio {new Date(profile.createdAt).toLocaleDateString('es', { month: 'long', year: 'numeric' })}</span>
          </div>
          {profile.interests?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{profile.interests.map(i => <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-600 text-xs rounded-lg font-medium">{i}</span>)}</div>}
          <div className="flex items-center gap-5 text-sm pt-2"><span><strong className="text-gray-900">{profile.following.length}</strong> <span className="text-gray-500">siguiendo</span></span><span><strong className="text-gray-900">{profile.followers.length}</strong> <span className="text-gray-500">seguidores</span></span></div>
        </div>
      </div>
      <div className="mt-8"><h2 className="text-lg font-bold text-gray-900 mb-4">Publicaciones</h2>{posts.length === 0 ? <div className="text-center py-12 text-gray-400"><p>Aun no hay publicaciones</p></div> : <div className="space-y-4">{posts.map(p => <PostCard key={p._id} post={p} initialSaved={!!p.saved} onSavedToggle={(id, saved) => setPosts(pp => pp.map(x => x._id === id ? { ...x, saved } : x))} onDeleted={id => setPosts(pp => pp.filter(x => x._id !== id))} />)}</div>}</div>
    </div>
  );
}
