import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg overflow-hidden flex items-center justify-center">      <img
    src="/favicon.ico"
    alt="Thirix Logo"
    className="w-full h-full object-cover"
  /></div>
          <span className="text-sm font-semibold text-gray-700">Thirix</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <Link to="/search" className="hover:text-gray-900 transition-colors">Buscar</Link>
          <Link to="/messages" className="hover:text-gray-900 transition-colors">Mensajes</Link>
        </nav>
        <p className="text-xs text-gray-400">&copy; 2026 Thirix. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
