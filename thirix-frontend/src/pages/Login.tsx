import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { connectSocket } from '../lib/socket';
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const validate = () => {
    if (!email.trim()) { Swal.fire('Campo requerido', 'Ingresa tu correo', 'warning'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Swal.fire('Correo invalido', 'Ingresa un correo valido', 'warning'); return false; }
    if (!password) { Swal.fire('Campo requerido', 'Ingresa tu contrasena', 'warning'); return false; }
    if (password.length < 6) { Swal.fire('Contrasena corta', 'Minimo 6 caracteres', 'warning'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ email, password });
      console.log('Login response:', res);
      let userData = res.user || res;
      console.log('User data before transform:', userData);
      
      
      if (userData && !userData._id && (userData as any).id) {
        userData = { ...userData, _id: (userData as any).id };
      }
      
      if (!userData._id) {
        Swal.fire('Error', 'Error de autenticación: sin ID de usuario', 'error');
        return;
      }
      
      console.log('User data after transform:', userData);
      const token = (res as any)?.token || (res as any)?.accessToken || (res as any)?.jwt || (res as any)?.authorization?.token;
      if (token) {
        window.localStorage.setItem('auth_token', token);
      }
      setUser(userData);
      connectSocket(userData._id);
      Swal.fire('Bienvenido', 'Has iniciado sesion correctamente', 'success');
      navigate('/');
    } catch (err: any) { Swal.fire('Error', err.response?.data?.message || 'Credenciales incorrectas', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
         <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center mx-auto mb-4">
  <img
    src="/favicon.ico"
    alt="Thirix Logo"
    className="w-full h-full object-cover"
  />
</div>
          <h1 className="text-3xl font-bold text-white">Thirix</h1>
          <p className="text-gray-400 mt-2">Inicia sesion para conectarte</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo</label>
            <div className="relative"><Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full bg-white/10 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contrasena</label>
            <div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contrasena" className="w-full bg-white/10 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">{loading ? 'Iniciando...' : 'Iniciar Sesion'}</button>
          <p className="text-center text-sm text-gray-400">No tienes cuenta? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Registrate</Link></p>
        </form>
      </div>
    </div>
  );
}
