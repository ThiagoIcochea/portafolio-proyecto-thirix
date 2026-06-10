import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, MessageCircle, Bell, Bookmark, User, LogOut, PenSquare } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const nav = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/search', icon: Search, label: 'Buscar' },
    { path: '/messages', icon: MessageCircle, label: 'Mensajes' },
    { path: '/notifications', icon: Bell, label: 'Notificaciones' },
    { path: '/saved', icon: Bookmark, label: 'Guardados' },
    { path: `/profile/${user._id}`, icon: User, label: 'Perfil' },
  ];
  const active = (p: string) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700  flex items-center justify-center">
            <img
    src="/favicon.ico"
    alt="Thirix Logo"
    className="w-full h-full object-cover"
  />
          </div>
          <span className="text-xl font-bold text-gray-900 hidden sm:block">Thirix</span>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} title={label}
              className={`relative p-2.5 rounded-xl transition-all group ${active(path) ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <Icon size={22} strokeWidth={active(path) ? 2.5 : 2} />
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-900 text-white px-2 py-0.5 rounded">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/create-post')} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors"><PenSquare size={16} />Publicar</button>
          <button onClick={() => navigate('/create-post')} className="sm:hidden p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"><PenSquare size={18} /></button>
          <button onClick={logout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Cerrar sesion"><LogOut size={20} /></button>
        </div>
      </div>
    </header>
  );
}
