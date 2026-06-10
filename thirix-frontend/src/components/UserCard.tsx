import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserMinus } from 'lucide-react';
import { User as U } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { followUser, unfollowUser } from '../services/user.service';
import Swal from 'sweetalert2';

interface Props { user: U }

export default function UserCard({ user: target }: Props) {
  const { user: me } = useAuth();
  const followersArray = Array.isArray(target.followers) ? target.followers : [];
  const getCount = (field: 'followers' | 'following') => {
    const value = (target as any)[field];
    if (typeof value === 'number') return value;
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'object' && value !== null && typeof value.count === 'number') return value.count;
    const countField = (target as any)[`${field}Count`];
    if (typeof countField === 'number') return countField;
    const snakeField = (target as any)[`${field}_count`];
    if (typeof snakeField === 'number') return snakeField;
    const nestedCount = (target as any)._count?.[field];
    if (typeof nestedCount === 'number') return nestedCount;
    return 0;
  };
  const followersCount = getCount('followers');
  const followingCount = getCount('following');
  const [following, setFollowing] = useState(me ? followersArray.includes(me._id) : false);
  const [fCount, setFCount] = useState(followersCount);
  const self = me?._id === target._id;

  const handleFollow = async () => {
    if (!me) return;
    try {
      if (following) {
        await unfollowUser(target._id);
        setFollowing(false);
        setFCount((c: number) => Math.max(0, c - 1));
      } else {
        await followUser(target._id);
        setFollowing(true);
        setFCount((c: number) => c + 1);
      }
    } catch {
      Swal.fire('Error', 'No se pudo completar', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${target._id}`} className="shrink-0"><img src={target.avatar || `https://ui-avatars.com/api/?name=${target.firstName}+${target.lastName}&background=3b82f6&color=fff`} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100" /></Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${target._id}`} className="block"><p className="font-semibold text-gray-900 text-sm truncate hover:text-primary-600 transition-colors">{target.firstName} {target.lastName}</p><p className="text-xs text-gray-400 truncate">@{target.username}</p></Link>
          {target.profession && <p className="text-xs text-gray-500 mt-0.5 truncate">{target.profession}</p>}
        </div>
        {!self && me && <button onClick={handleFollow} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${following ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
          {following ? <><UserMinus size={14} />Siguiendo</> : <><UserPlus size={14} />Seguir</>}
        </button>}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span><strong className="text-gray-600">{fCount}</strong> seguidores</span>
        <span><strong className="text-gray-600">{followingCount}</strong> siguiendo</span>
      </div>
    </div>
  );
}
