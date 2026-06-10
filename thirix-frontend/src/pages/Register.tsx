import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Calendar, Briefcase } from 'lucide-react';
import { register } from '../services/auth.service';
import Swal from 'sweetalert2';

const GENDERS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];
const INTERESTS = ['Tecnologia','Deportes','Musica','Arte','Ciencia','Viajes','Fotografia','Cine','Literatura','Gastronomia','Moda','Negocios','Salud','Educacion','Gaming'];

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', confirmPassword:'', firstName:'', lastName:'', motherLastName:'', birthDate:'', gender:'', profession:'', interests:[] as string[] });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const upd = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const toggleInterest = (i: string) => setForm(p => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter(x => x !== i) : [...p.interests, i] }));

  const validate = () => {
    if (!form.username.trim()) { Swal.fire('Campo requerido', 'Ingresa un nombre de usuario', 'warning'); return false; }
    if (form.username.length < 3) { Swal.fire('Usuario corto', 'Minimo 3 caracteres', 'warning'); return false; }
    if (!form.email.trim()) { Swal.fire('Campo requerido', 'Ingresa tu correo', 'warning'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { Swal.fire('Correo invalido', 'Ingresa un correo valido', 'warning'); return false; }
    if (!form.password) { Swal.fire('Campo requerido', 'Ingresa una contrasena', 'warning'); return false; }
    if (form.password.length < 6) { Swal.fire('Contrasena corta', 'Minimo 6 caracteres', 'warning'); return false; }
    if (form.password !== form.confirmPassword) { Swal.fire('Contrasenas diferentes', 'No coinciden', 'warning'); return false; }
    if (!form.firstName.trim()) { Swal.fire('Campo requerido', 'Ingresa tu nombre', 'warning'); return false; }
    if (!form.lastName.trim()) { Swal.fire('Campo requerido', 'Ingresa tu apellido', 'warning'); return false; }
    if (!form.birthDate) { Swal.fire('Campo requerido', 'Ingresa tu fecha de nacimiento', 'warning'); return false; }
    if (!form.gender) { Swal.fire('Campo requerido', 'Selecciona tu genero', 'warning'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { const { confirmPassword, ...data } = form; await register(data); Swal.fire('Cuenta creada', 'Ahora puedes iniciar sesion', 'success'); navigate('/login'); }
    catch (err: any) { Swal.fire('Error', err.response?.data?.message || 'No se pudo crear la cuenta', 'error'); }
    finally { setLoading(false); }
  };

  const inp = "w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-primary-500 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25"><span className="text-white font-bold text-2xl">T</span></div>
          <h1 className="text-3xl font-bold text-white">Unete a Thirix</h1>
          <p className="text-gray-400 mt-2">Crea tu cuenta y conectate con el mundo</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Usuario</label><div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={form.username} onChange={e => upd('username', e.target.value)} placeholder="username" className={`${inp} pl-9`} /></div></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Correo</label><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="correo@ejemplo.com" className={`${inp} pl-9`} /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Contrasena</label><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type={showPass?'text':'password'} value={form.password} onChange={e => upd('password', e.target.value)} placeholder="Minimo 6 caracteres" className={`${inp} pl-9`} /></div></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Confirmar</label><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type={showPass?'text':'password'} value={form.confirmPassword} onChange={e => upd('confirmPassword', e.target.value)} placeholder="Repetir contrasena" className={`${inp} pl-9`} /></div></div>
          </div>
          <button type="button" onClick={() => setShowPass(!showPass)} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">{showPass ? <EyeOff size={12} /> : <Eye size={12} />}{showPass ? 'Ocultar' : 'Mostrar'} contrasenas</button>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label><input value={form.firstName} onChange={e => upd('firstName', e.target.value)} placeholder="Nombre" className={inp} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Apellido</label><input value={form.lastName} onChange={e => upd('lastName', e.target.value)} placeholder="Apellido" className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Apellido materno</label><input value={form.motherLastName} onChange={e => upd('motherLastName', e.target.value)} placeholder="Opcional" className={inp} /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Fecha de nacimiento</label><div className="relative"><Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="date" value={form.birthDate} onChange={e => upd('birthDate', e.target.value)} className={`${inp} pl-9 [color-scheme:dark]`} /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Genero</label><select value={form.gender} onChange={e => upd('gender', e.target.value)} className={inp}><option value="" className="bg-gray-800">Seleccionar</option>{GENDERS.map(g => <option key={g} value={g} className="bg-gray-800">{g}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Profesion</label><div className="relative"><Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={form.profession} onChange={e => upd('profession', e.target.value)} placeholder="Opcional" className={`${inp} pl-9`} /></div></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">Intereses</label><div className="flex flex-wrap gap-2">{INTERESTS.map(i => <button key={i} type="button" onClick={() => toggleInterest(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.interests.includes(i) ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>{i}</button>)}</div></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">{loading ? 'Creando cuenta...' : 'Crear Cuenta'}</button>
          <p className="text-center text-sm text-gray-400">Ya tienes cuenta? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Inicia sesion</Link></p>
        </form>
      </div>
    </div>
  );
}
