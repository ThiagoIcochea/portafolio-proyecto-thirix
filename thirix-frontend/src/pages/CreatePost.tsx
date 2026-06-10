import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Hash, Globe, Lock, ArrowLeft } from 'lucide-react';
import { createPost } from '../services/post.service';
import MediaUpload from '../components/MediaUpload';
import Swal from 'sweetalert2';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [visibility, setVisibility] = useState<'public'|'private'>('public');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) { Swal.fire('Vacio', 'Escribe algo o agrega media', 'warning'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      if (location.trim()) fd.append('location', location.trim());
      fd.append('visibility', visibility);
      if (hashtags.trim()) fd.append('hashtags', JSON.stringify(hashtags.split(',').map(t => t.trim().replace('#','')).filter(Boolean)));
      files.forEach(f => fd.append('media', f));
      await createPost(fd);
      Swal.fire('Publicado', 'Tu publicacion esta lista', 'success');
      navigate('/');
    } catch { Swal.fire('Error', 'No se pudo publicar', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"><ArrowLeft size={20} />Volver</button>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Crear publicacion</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Que estas pensando?" rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary-300 transition-all resize-none" />
          <MediaUpload files={files} onFilesChange={setFiles} />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Ubicacion</label><div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Opcional" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all" /></div></div>
            <div><label className="block text-xs font-medium text-gray-500 mb-1">Hashtags</label><div className="relative"><Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="tecnologia, arte" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all" /></div></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-500 mb-2">Visibilidad</label><div className="flex gap-3">
            <button type="button" onClick={() => setVisibility('public')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${visibility==='public' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Globe size={16} />Publico</button>
            <button type="button" onClick={() => setVisibility('private')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${visibility==='private' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Lock size={16} />Privado</button>
          </div></div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">{loading ? 'Publicando...' : 'Publicar'}</button>
        </form>
      </div>
    </div>
  );
}
