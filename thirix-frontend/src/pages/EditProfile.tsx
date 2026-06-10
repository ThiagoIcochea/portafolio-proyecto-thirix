import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { getProfile, updateProfile, uploadAvatar, uploadCoverImage } from '../services/user.service';
import { User } from '../types';
import Swal from 'sweetalert2';

const INTERESTS = ['Tecnologia','Deportes','Musica','Arte','Ciencia','Viajes','Fotografia','Cine','Literatura','Gastronomia','Moda','Negocios','Salud','Educacion','Gaming'];

export default function EditProfile() {
  const [form, setForm] = useState({ firstName:'', lastName:'', motherLastName:'', bio:'', location:'', website:'', profession:'' });
  const [interests, setInterests] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File|null>(null);
  const [coverFile, setCoverFile] = useState<File|null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const upd = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const normalizeImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://portafolio-proyecto-thirix.onrender.com${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const normalizeInterests = (items: any[]): string[] => {
    const normalized: string[] = [];
    items.forEach(item => {
      if (typeof item !== 'string') return;
      let value = item.trim();
      if (!value) return;
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            parsed.forEach(i => {
              if (typeof i === 'string' && i.trim()) normalized.push(i.trim());
            });
            return;
          }
        } catch {
          
        }
      }
      normalized.push(value);
    });
    return Array.from(new Set(normalized));
  };

  useEffect(() => {
    (async () => {
      try {
        const p: User = await getProfile();
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          motherLastName: p.motherLastName || '',
          bio: p.bio || '',
          location: p.location || '',
          website: p.website || '',
          profession: p.profession || ''
        });
        setInterests(normalizeInterests(p.interests || []));
        setAvatarPreview(normalizeImageUrl(p.avatar || ''));
        setCoverPreview(normalizeImageUrl(p.coverImage || ''));
      } catch {
        Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) { Swal.fire('Campo requerido', 'El nombre es requerido', 'warning'); return; }
    if (!form.lastName.trim()) { Swal.fire('Campo requerido', 'El apellido es requerido', 'warning'); return; }
    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        motherLastName: form.motherLastName.trim() || undefined,
        bio: form.bio.trim() || undefined,
        location: form.location.trim() || undefined,
        website: form.website.trim() || undefined,
        profession: form.profession.trim() || undefined,
        interests: normalizeInterests(interests)
      };

      await updateProfile(payload);

      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }

      if (coverFile) {
        await uploadCoverImage(coverFile);
      }

      Swal.fire('Actualizado', 'Tu perfil ha sido actualizado', 'success');
      navigate(-1);
    } catch (err: any) {
      console.error('EditProfile update error:', err);
      const msg = err?.response?.data?.message || err?.message || 'No se pudo actualizar';
      Swal.fire('Error', msg, 'error');
    } finally { setLoading(false); }
  };

  const ci = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"><ArrowLeft size={20} />Volver</button>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-primary-400 to-primary-700 group">{coverPreview && <img src={coverPreview} alt="" className="w-full h-full object-cover" />}
          <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"><Upload size={24} className="text-white" /><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } }} className="hidden" /></label>
        </div>
        <div className="relative px-6 -mt-12">
          <label className="relative inline-block cursor-pointer group">
            <img src={avatarPreview || `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=3b82f6&color=fff&size=128`} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity border-4 border-white"><Upload size={20} className="text-white" /></div>
            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); } }} className="hidden" />
          </label>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label><input value={form.firstName} onChange={e => upd('firstName', e.target.value)} className={ci} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label><input value={form.lastName} onChange={e => upd('lastName', e.target.value)} className={ci} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Apellido materno</label><input value={form.motherLastName} onChange={e => upd('motherLastName', e.target.value)} className={ci} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Biografia</label><textarea value={form.bio} onChange={e => upd('bio', e.target.value)} rows={3} placeholder="Cuenta algo sobre ti..." className={`${ci} resize-none`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ubicacion</label><input value={form.location} onChange={e => upd('location', e.target.value)} placeholder="Ciudad, Pais" className={ci} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label><input value={form.website} onChange={e => upd('website', e.target.value)} placeholder="https://..." className={ci} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Profesion</label><input value={form.profession} onChange={e => upd('profession', e.target.value)} placeholder="Tu profesion" className={ci} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Intereses</label><div className="flex flex-wrap gap-2">{INTERESTS.map(i => <button key={i} type="button" onClick={() => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${interests.includes(i) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{i}</button>)}</div></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
        </form>
      </div>
    </div>
  );
}
