import { useRef, useState } from 'react';
import { Image, Video, X } from 'lucide-react';

interface Props { onFilesChange: (f: File[]) => void; files: File[]; maxFiles?: number }

export default function MediaUpload({ onFilesChange, files, maxFiles = 4 }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nf = Array.from(e.target.files || []);
    const combined = [...files, ...nf].slice(0, maxFiles);
    onFilesChange(combined);
    const np = nf.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' }));
    setPreviews(p => [...p, ...np].slice(0, maxFiles));
    e.target.value = '';
  };

  const remove = (i: number) => {
    onFilesChange(files.filter((_, j) => j !== i));
    setPreviews(previews.filter((_, j) => j !== i));
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => ref.current?.click()} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Image size={18} />Foto</button>
        <button type="button" onClick={() => ref.current?.click()} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Video size={18} />Video</button>
        <input ref={ref} type="file" accept="image/*,video/*" multiple onChange={handleChange} className="hidden" />
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {previews.map((p, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden bg-gray-100">
              {p.type === 'video' ? <video src={p.url} className="w-full h-32 object-cover" /> : <img src={p.url} alt="" className="w-full h-32 object-cover" />}
              <button type="button" onClick={() => remove(i)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
