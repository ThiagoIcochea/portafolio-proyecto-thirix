import { FormEvent, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { User } from '../types';
import { searchUsers } from '../services/user.service';
import UserCard from '../components/UserCard';

export default function Search() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await searchUsers(query.trim());
      setUsers(Array.isArray(result) ? result : []);
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Ocurrió un error al buscar. Intenta de nuevo.');
      setUsers([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Buscar personas</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, usuario o apellido..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-primary-600 text-white py-3 text-sm font-semibold hover:bg-primary-700 transition-colors disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          Buscar
        </button>
      </form>
      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searched && users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron resultados para "{query}"</p>
        </div>
      ) : !searched ? (
        <div className="text-center py-12">
          <SearchIcon size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Busca personas por nombre, usuario o apellido</p>
        </div>
      ) : (
        <div className="space-y-3">{users.map(u => <UserCard key={u._id} user={u} />)}</div>
      )}
    </div>
  );
}
