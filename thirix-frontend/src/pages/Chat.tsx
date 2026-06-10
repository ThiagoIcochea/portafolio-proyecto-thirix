import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Download, X, Smile } from 'lucide-react';
import { Message, User, Conversation } from '../types';
import { getMessages, sendMessage, markAsRead } from '../services/message.service';
import { getConversations } from '../services/message.service';
import { useAuth } from '../contexts/AuthContext';
import { Camera } from "lucide-react";
import { Mic } from "lucide-react";
import CameraModal from "../components/chat/CameraModal";
import AudioRecorderModal from "../components/chat/AudioRecorderModal";
import { joinConversation, sendMessageSocket as socketSend, emitTyping, emitStopTyping, onReceiveMessage, onUserTyping, onUserStopTyping } from '../lib/socket';
import Swal from 'sweetalert2';

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [otherUser, setOtherUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
 const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const emojiCatalog = [
    { emoji: '😀', keywords: ['sonrisa', 'feliz', 'smile'] },
    { emoji: '😂', keywords: ['risa', 'divertido', 'haha'] },
    { emoji: '😍', keywords: ['amor', 'enamorado', 'love'] },
    { emoji: '❤️', keywords: ['corazon', 'amor', 'heart'] },
    { emoji: '🔥', keywords: ['fuego', 'cool', 'fire'] },
    { emoji: '🎉', keywords: ['fiesta', 'celebracion', 'party'] },
    { emoji: '👏', keywords: ['aplausos', 'bien', 'clap'] },
    { emoji: '👍', keywords: ['me gusta', 'bien', 'thumbs'] },
    { emoji: '🙏', keywords: ['gracias', 'por favor', 'please'] },
    { emoji: '✨', keywords: ['estrella', 'brillante', 'star'] },
    { emoji: '💡', keywords: ['idea', 'inteligente', 'light'] },
    { emoji: '😎', keywords: ['guay', 'cool', 'stylish'] },
    { emoji: '😢', keywords: ['triste', 'llorar', 'sad'] },
    { emoji: '😮', keywords: ['sorprendido', 'wow', 'surprise'] },
    { emoji: '🥳', keywords: ['fiesta', 'celebrar', 'party'] },
    { emoji: '🎂', keywords: ['cumpleanos', 'torta', 'cake'] },
    { emoji: '💬', keywords: ['mensaje', 'chat', 'talk'] },
    { emoji: '😴', keywords: ['dormir', 'sueño', 'sleep'] },
    { emoji: '🤔', keywords: ['pensar', 'duda', 'think'] },
    { emoji: '😡', keywords: ['enojado', 'molesto', 'angry'] },
    { emoji: '🥺', keywords: ['implorar', 'sad', 'please'] },
    { emoji: '💪', keywords: ['fuerza', 'fortaleza', 'strong'] },
    { emoji: '🤝', keywords: ['acuerdo', 'deal', 'handshake'] },
    { emoji: '🍕', keywords: ['comida', 'pizza', 'food'] },
    { emoji: '☕', keywords: ['cafe', 'coffee', 'bebida'] },
    { emoji: '🎵', keywords: ['musica', 'song', 'music'] },
    { emoji: '🏖️', keywords: ['playa', 'vacaciones', 'beach'] },
    { emoji: '🚀', keywords: ['viaje', 'futuro', 'rocket'] },
    { emoji: '💀', keywords: ['muerte', 'funny', 'dead'] },
    { emoji: '👀', keywords: ['ver', 'mirar', 'look'] },
    { emoji: '🤍', keywords: ['blanco', 'suave', 'white'] },
    { emoji: '💔', keywords: ['rotura', 'heartbreak', 'broken'] },
    { emoji: '🥰', keywords: ['cariño', 'amor', 'cute'] },
    { emoji: '😇', keywords: ['angel', 'bueno', 'angel'] },
    { emoji: '🙌', keywords: ['celebrar', 'victoria', 'hooray'] },
    { emoji: '🫶', keywords: ['amor', 'cariño', 'love'] },
    { emoji: '💯', keywords: ['mil', 'perfecto', '100'] },
    { emoji: '✅', keywords: ['listo', 'bien', 'ok'] },
    { emoji: '❌', keywords: ['error', 'no', 'wrong'] },
    { emoji: '⚡', keywords: ['rapido', 'energia', 'lightning'] },
    { emoji: '🌈', keywords: ['color', 'arcoiris', 'rainbow'] },
    { emoji: '🌟', keywords: ['estrella', 'brillante', 'star'] },
    { emoji: '🎁', keywords: ['regalo', 'gift', 'present'] },
    { emoji: '🍀', keywords: ['suerte', 'luck', 'lucky'] },
    { emoji: '💖', keywords: ['amor', 'corazon', 'heart'] }
  ];

  const filteredEmojis = emojiCatalog.filter(({ emoji, keywords }) => {
    const query = emojiQuery.trim().toLowerCase();
    if (!query) return true;
    const hayCoincidencia = [emoji, ...keywords].some((value) => value.toLowerCase().includes(query));
    return hayCoincidencia;
  });

  const dedupeMessages = (arr: Message[]) => {
    const map = new Map<string, Message>();
    arr.forEach((m, i) => {
      const key = m._id ?? `${m.createdAt}-${i}`;
      if (!map.has(key)) map.set(key, m);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    (async () => {
      try {
        const convs = await getConversations();
        const conv = convs.find((c: Conversation) => c._id === conversationId);
        if (conv) {
          const o = (conv.participants as User[]).find(p => p._id !== user?._id);
          setOtherUser(o || null);
        }
        const msgs = await getMessages(conversationId!);
        const unique = dedupeMessages(msgs);
        setMessages(unique);
        unique.forEach(m => { if (!m.isRead && m.sender !== user?._id) markAsRead(m._id).catch(()=>{}); });
      } catch {
        Swal.fire('Error', 'No se pudo cargar el chat', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [conversationId]);
  

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    const offR = onReceiveMessage((msg: any) => {
     
      setMessages(p => dedupeMessages([...p, msg]));
      if (msg._id) markAsRead(msg._id).catch(()=>{});
    });
    const offT = onUserTyping((d: any) => { if (d.conversationId === conversationId) setTyping(true); });
    const offS = onUserStopTyping((d: any) => { if (d.conversationId === conversationId) setTyping(false); });
    return () => { offR(); offT(); offS(); };
  }, [conversationId]);

  const handleType = (v: string) => { setText(v); if (!conversationId) return; if (v.trim()) { emitTyping(conversationId); if (typingRef.current) {
  clearTimeout(typingRef.current);
}; typingRef.current = setTimeout(() => emitStopTyping(conversationId), 2000); } else { emitStopTyping(conversationId); } };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setEmojiOpen(false);
    setEmojiQuery('');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !conversationId || !user) return;
    const msg = text.trim(); setText(''); emitStopTyping(conversationId);
    try {
      socketSend({ conversationId, text: msg, sender: user._id });
      const n = await sendMessage(conversationId, { text: msg });
      setMessages(p => dedupeMessages([...p, n]));
    } catch {
      Swal.fire('Error', 'No se pudo enviar', 'error');
    }
  };

  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !conversationId) return;
    try {
      const fd = new FormData();
      fd.append('text', text.trim() || 'Archivo adjunto');
      fd.append('attachments', f);
      const n = await sendMessage(conversationId, fd);
      console.log('sendMessage response:', n);
      if (!n.attachments || n.attachments.length === 0) {
        Swal.fire('Advertencia', 'La respuesta del servidor no contiene attachments', 'warning');
      }
      setMessages(p => dedupeMessages([...p, n]));
      setText('');
    } catch (err) {
      console.error('send attach error:', err);
      Swal.fire('Error', 'No se pudo enviar', 'error');
    }
  };

  const uploadFile = async (file: File) => {
  if (!conversationId) return;

  try {
    const fd = new FormData();

    fd.append(
      "text",
      text.trim() || file.name
    );

    fd.append(
      "attachments",
      file
    );

    const response =
      await sendMessage(
        conversationId,
        fd
      );

    setMessages(prev =>
      dedupeMessages([
        ...prev,
        response
      ])
    );

    setText("");

  } catch (error) {

    console.error(error);

    Swal.fire(
      "Error",
      "No se pudo enviar el archivo",
      "error"
    );
  }
};

  const time = (d: string) => new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[calc(100dvh-8rem)] min-h-[calc(100dvh-8rem)] overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-3 sm:px-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button onClick={() => navigate('/messages')} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
        {otherUser && <Link to={`/profile/${otherUser._id}`} className="flex items-center gap-3 flex-1 min-w-0"><img src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&background=3b82f6&color=fff`} alt="" className="w-10 h-10 rounded-full object-cover" /><div className="min-w-0"><p className="font-semibold text-sm text-gray-900 truncate">{otherUser.firstName} {otherUser.lastName}</p><p className="text-xs text-gray-400">@{otherUser.username}</p></div></Link>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? <div className="text-center py-20 text-gray-400 text-sm">Inicia la conversacion</div> :
         messages.map((m, idx) => { const isMe = (m.sender as any)?._id === user?._id || m.sender === user?._id; return (
          <div key={m._id ?? `msg-${idx}-${m.createdAt}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] w-fit break-words overflow-hidden rounded-2xl px-3 py-2.5 sm:px-4 ${isMe ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'}`}>
              {m.attachments?.map((a, i) => (
  <div key={i} className="mb-2">

    {a.fileType === 'image' ? (

      <div className="relative group">
        <img
          src={a.url}
          alt=""
          onClick={() => {
            setPreviewUrl(a.url);
            setPreviewType('image');
            setPreviewOpen(true);
          }}
          className="rounded-lg max-h-60 w-full max-w-full object-cover cursor-pointer hover:opacity-90"
        />

        <a
          href={a.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100"
        >
          Descargar
        </a>
      </div>

    ) : a.fileType === 'video' ? (

      <div className="relative group">
        <video
          src={a.url}
          className="rounded-lg max-h-60 w-full max-w-full cursor-pointer"
          onClick={() => {
            setPreviewUrl(a.url);
            setPreviewType('video');
            setPreviewOpen(true);
          }}
        />

        <a
          href={a.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100"
        >
          Descargar
        </a>
      </div>

    ) : (

      <div className="flex items-center gap-2">

        <a
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline"
        >
          Abrir archivo
        </a>

        <a
          href={a.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline"
        >
          Descargar
        </a>

      </div>

    )}

  </div>
))}
              {m.text && <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{m.text}</p>}
              <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>{time(m.createdAt)}</p>
            </div>
          </div>
        ); })}
        {typing && <div className="flex justify-start"><div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 rounded-bl-md"><div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} /></div></div></div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className="relative flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-1 shrink-0">
          <label className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"><Paperclip size={20} /><input type="file" accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleAttach} className="hidden" /></label>
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="p-2 text-gray-500 hover:text-primary-600"
          >
            <Camera size={20}/>
          </button>

          <button
            type="button"
            onClick={() => setAudioOpen(true)}
            className="p-2 text-gray-500 hover:text-primary-600"
          >
            <Mic size={20}/>
          </button>

          <button
            type="button"
            onClick={() => setEmojiOpen((prev) => !prev)}
            className="p-2 text-gray-500 hover:text-primary-600"
            aria-label="Agregar emoji"
          >
            <Smile size={20}/>
          </button>
        </div>

        <input value={text} onChange={e => handleType(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 min-w-[140px] basis-full sm:basis-auto bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all" />
        <button type="submit" disabled={!text.trim()} className="p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-full transition-colors disabled:opacity-40"><Send size={18} /></button>

        {emojiOpen && (
          <div className="absolute bottom-16 left-2 right-2 z-20 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
            <div className="mb-2">
              <input
                value={emojiQuery}
                onChange={(e) => setEmojiQuery(e.target.value)}
                placeholder="Buscar emoji..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {filteredEmojis.map(({ emoji }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-lg hover:bg-gray-50"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {previewOpen && (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    onClick={() => setPreviewOpen(false)}
  >

    <div
      className="relative max-w-6xl max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >

     <button
  onClick={() => setPreviewOpen(false)}
  className="absolute -top-12 right-0 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
  title="Cerrar"
>
  <X size={20} />
</button>

    <a
  href={previewUrl}
  download
  target="_blank"
  rel="noopener noreferrer"
  className="absolute -top-12 left-0 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
  title="Descargar"
>
  <Download size={20} />
</a>

      {previewType === 'image' ? (
        <img
          src={previewUrl}
          alt=""
          className="max-h-[90vh] max-w-full rounded-lg"
        />
      ) : (
        <video
          src={previewUrl}
          controls
          autoPlay
          className="max-h-[90vh] max-w-full rounded-lg"
        />
      )}

    </div>

  </div>
)}

<CameraModal
  open={cameraOpen}
  onClose={() => setCameraOpen(false)}
  onCapture={uploadFile}
/>

<AudioRecorderModal
  open={audioOpen}
  onClose={() => setAudioOpen(false)}
  onRecorded={uploadFile}
/>
    </div>
  );
}
