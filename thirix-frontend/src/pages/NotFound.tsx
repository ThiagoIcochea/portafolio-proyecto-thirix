import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-5xl font-bold text-primary-600">404</span></div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagina no encontrada</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">La pagina que buscas no existe o ha sido movida.</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors"><ArrowLeft size={16} />Volver</button>
          <Link to="/" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors"><Home size={16} />Inicio</Link>
        </div>
      </div>
    </div>
  );
}
