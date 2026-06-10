import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  connectSocket,
  getSocket,
  joinLive,
  startLive,
  endLive,
  leaveLive,
  sendLiveMessage,
  sendWebRTCAnswer,
  sendICECandidate,
  requestLiveList,
  onLiveList,
  onLiveViewers,
  onLiveMessage,
  onLiveEnded,
  onLiveReaction,
  onWebRTCOffer,
  onWebRTCAnswer,
  onICE,
  sendReaction as sendLiveReaction
} from "../lib/socket";

const USER_ID =
  localStorage.getItem("userId") ||
  (localStorage.setItem("userId", crypto.randomUUID()),
  localStorage.getItem("userId")!);

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

const normalizeMessage = (msg: any, currentUsername: string, currentUserId: string) => {
  if (!msg) return null;

  const cleanUsername = (value: unknown) => {
    if (typeof value !== "string") return "";
    return value.replace(/^@/, "").trim();
  };

  if (typeof msg === "string") {
    return {
      user: cleanUsername(currentUsername) || "Usuario",
      message: msg,
      timestamp: Date.now(),
      isOwn: true
    };
  }

  if (typeof msg === "object") {
    const senderName = cleanUsername(
      msg.user ?? msg.username ?? msg.sender ?? msg.from ?? msg.author
    );
    const senderId = msg.userId ?? msg.senderId ?? msg.fromId ?? msg.authorId;
    const user = senderName || cleanUsername(currentUsername) || "Usuario";
    const message = msg.message ?? msg.text ?? msg.content ?? msg.body ?? "";
    const timestamp =
      (typeof msg.timestamp === "number" && msg.timestamp) ||
      (typeof msg.createdAt === "number" && msg.createdAt) ||
      Date.now();

    const isOwn = Boolean(
      (senderId && senderId === currentUserId) ||
      (senderName && senderName.toLowerCase() === currentUsername.toLowerCase())
    );

    return { user, message, timestamp, isOwn };
  }

  return null;
};

export default function LiveStream() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUsername = (user?.username || localStorage.getItem("username") || localStorage.getItem("userName") || "Usuario").replace(/^@/, "").trim();

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const hostPeers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const viewerPc = useRef<RTCPeerConnection | null>(null);
  const pendingViewers = useRef<string[]>([]);

  const [viewers, setViewers] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [roomExists, setRoomExists] = useState(false);
  const [roomCheckDone, setRoomCheckDone] = useState(false);
  const [reactionBurst, setReactionBurst] = useState<{ emoji: string; id: number } | null>(null);

  const quickEmojis = ["😀", "😂", "❤️", "🔥", "🎉", "👏"];
  const quickReactions = ["❤️", "🔥", "🎉", "👏"];
  const messageColors = ["#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#a78bfa", "#fb7185", "#22d3ee"];

  const getMessageColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = (hash * 31 + name.charCodeAt(i)) % messageColors.length;
    }
    return messageColors[hash];
  };

  const attachLocalStream = (videoEl: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoEl || !stream) return;

    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.autoplay = true;

    const playStream = async () => {
      try {
        await videoEl.play();
      } catch {
        window.setTimeout(playStream, 500);
      }
    };

    videoEl.onloadedmetadata = () => {
      playStream();
    };

    playStream();
  };

  const createHostPeer = (socketId: string, s: any) => {
    if (!streamRef.current) {
      pendingViewers.current.push(socketId);
      return;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    hostPeers.current.set(socketId, pc);

    streamRef.current.getTracks().forEach((t) =>
      pc.addTrack(t, streamRef.current!)
    );

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendICECandidate(socketId, e.candidate);
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      s.emit("webrtc_offer", {
        to: socketId,
        offer
      });
    };
  };

  
  useEffect(() => {
    connectSocket(USER_ID);
    const s = getSocket();
    if (!s) return;

    const offViewers = onLiveViewers(setViewers);

    const request = () => requestLiveList();
    request();
    if (s.connected) {
      request();
    } else {
      s.once("connect", request);
    }

    const offList = onLiveList((list) => {
      const exists = (list || []).some((live: any) => live.streamId === id);
      setRoomExists(exists);
      setRoomCheckDone(true);
    });

    const offMsg = onLiveMessage((msg) => {
      const normalized = normalizeMessage(msg, currentUsername, USER_ID);
      if (!normalized) return;

      setMessages((prev) => {
        const duplicate = prev.some(
          (item) =>
            item.user === normalized.user &&
            item.message === normalized.message &&
            item.timestamp === normalized.timestamp
        );

        if (duplicate) return prev;

        return [...prev, { ...normalized, timestamp: normalized.timestamp ?? Date.now() }];
      });
    });

    const offReaction = onLiveReaction((data: any) => {
      const emoji = data?.emoji || "❤️";
      showReaction(emoji);
    });

    const offEnded = onLiveEnded(() => {
      viewerPc.current?.close();
      viewerPc.current = null;
      setViewers(0);
      navigate("/");
    });

    
    const onViewerJoined = ({ socketId }: any) => {
      createHostPeer(socketId, s);
    };

    s.on("viewer_joined", onViewerJoined);

    const onViewerLeft = () => {
      setViewers((prev) => Math.max(0, prev - 1));
    };

    s.on("viewer_left", onViewerLeft);

    const offAnswer = onWebRTCAnswer(async ({ answer, from }) => {
      const pc = hostPeers.current.get(from);
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

   
    const offOffer = onWebRTCOffer(async ({ offer, from }) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      viewerPc.current = pc;

      pc.ontrack = (event) => {
        const stream = event.streams[0] || (event.track ? new MediaStream([event.track]) : null);
        if (!remoteVideoRef.current || !stream) return;

        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.autoplay = true;
        remoteVideoRef.current.playsInline = true;

        const play = async () => {
          try {
            await remoteVideoRef.current!.play();
          } catch {
            setTimeout(play, 500);
          }
        };

        remoteVideoRef.current.onloadedmetadata = play;
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendICECandidate(from, e.candidate);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendWebRTCAnswer(from, answer);
    });

    const offIce = onICE(async ({ candidate, from }) => {
      const ice = new RTCIceCandidate(candidate);

      const host = hostPeers.current.get(from);
      if (host) return host.addIceCandidate(ice).catch(() => {});

      if (viewerPc.current)
        return viewerPc.current.addIceCandidate(ice).catch(() => {});
    });

    return () => {
      offViewers?.();
      offList?.();
      offMsg?.();
      offReaction?.();
      offEnded?.();
      offAnswer?.();
      offOffer?.();
      offIce?.();
      s.off("connect", request);
      s.off("viewer_joined", onViewerJoined);
      s.off("viewer_left", onViewerLeft);
      if (id) leaveLive(id, USER_ID);
    };
  }, [id]);

 
  const start = async () => {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      streamRef.current = stream;

      pendingViewers.current.forEach((socketId) => createHostPeer(socketId, getSocket()));
      pendingViewers.current = [];

      if (videoRef.current) {
        attachLocalStream(videoRef.current, stream);
      }

      connectSocket(USER_ID);
      joinLive(id!, USER_ID);
      startLive(id!, USER_ID);
      setRoomExists(true);
      setRoomCheckDone(true);
      setViewers(0);
      setIsHost(true);
      setIsLive(true);
    } catch (err: any) {
      console.error("No se pudo acceder a la cámara/micrófono", err);
      if (err?.name === "NotAllowedError") {
        setError("Permiso denegado para cámara o micrófono. Activa los permisos del navegador y vuelve a intentarlo.");
      } else {
        setError("No se pudo acceder a la cámara o al micrófono. Prueba en otra pestaña o navegador.");
      }
    }
  };

  const join = () => {
    if (!id) return;
    connectSocket(USER_ID);
    joinLive(id, USER_ID);
    setRoomExists(true);
    setRoomCheckDone(true);
    setViewers(0);
    setIsHost(false);
    setIsLive(true);
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    hostPeers.current.forEach((pc) => pc.close());
    hostPeers.current.clear();
    if (id) leaveLive(id, USER_ID);
    endLive(id!);
    navigate("/");
  };

  const addEmojiToMessage = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const showReaction = (emoji: string) => {
    const reactionId = Date.now();
    setReactionBurst({ emoji, id: reactionId });
    window.setTimeout(() => {
      setReactionBurst((prev) => (prev?.id === reactionId ? null : prev));
    }, 1200);
  };

  const reactToLive = (emoji: string) => {
    if (!id) return;

    connectSocket(USER_ID);
    sendLiveReaction(id, emoji);
    showReaction(emoji);
  };

  const sendMsg = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    connectSocket(USER_ID);
    sendLiveMessage(id!, currentUsername, trimmed);
    setMessages((p) => {
      const exists = p.some((item) => item.message === trimmed && item.user === currentUsername);
      if (exists) return p;
      return [...p, { user: currentUsername, message: trimmed, timestamp: Date.now(), isOwn: true }];
    });
    setMessage("");
  };

  useEffect(() => {
    if (isHost && streamRef.current && videoRef.current) {
      attachLocalStream(videoRef.current, streamRef.current);
    }
  }, [isHost, isLive]);

  if (!id) return <div>Live inválido</div>;

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">

     
      <div className="p-3 flex justify-between">
        <span className="flex gap-2 items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          LIVE
        </span>
        <span>{viewers} viewers</span>
      </div>

      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">

        {!isLive ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
            <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold mb-2">Live</p>
              <p className="text-xs text-gray-300 mb-3">
                Inicia la transmisión desde esta misma vista o entra a la sala desde otra pestaña con el mismo código.
              </p>

              <div className="mt-3 flex gap-2">
                {roomCheckDone ? (
                  roomExists ? (
                    <button onClick={join} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium">
                      Unirme al live
                    </button>
                  ) : (
                    <button onClick={start} className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium">
                      Transmitir
                    </button>
                  )
                ) : (
                  <button disabled className="flex-1 rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-gray-200">
                    Verificando sala...
                  </button>
                )}
              </div>
            </div>

            {error ? <p className="text-sm text-red-300 max-w-md text-center">{error}</p> : null}
          </div>
        ) : (
          <>
            {isHost && (
              <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover" />
            )}

            {!isHost && (
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
          </>
        )}

        {isLive && isHost && (
          <button onClick={stop} className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded">
            Terminar
          </button>
        )}

      </div>

      
      {isLive && (
        <div className="p-3 bg-black/60 border-t border-white/10">
          <div className="h-32 overflow-auto mb-2">
            {reactionBurst ? (
              <div className="mb-2 text-sm text-yellow-300 animate-bounce">Reacción enviada: {reactionBurst.emoji}</div>
            ) : null}

            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">Aún no hay mensajes en este live.</p>
            ) : (
              messages.map((m, i) => {
                const displayName = String(m.user || "Usuario").replace(/^@/, "");
                const label = m.isOwn ? `Tú (@${displayName})` : `@${displayName}`;
                const color = getMessageColor(displayName);

                return (
                  <div key={i} className="text-sm py-1">
                    <b style={{ color }}>{label}:</b> {m.message}
                  </div>
                );
              })
            )}
          </div>

          <div className="mb-2 flex flex-wrap gap-1">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmojiToMessage(emoji)}
                className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-sm hover:bg-white/20"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="mb-2 flex flex-wrap gap-2">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => reactToLive(emoji)}
                className="rounded-full border border-yellow-400/40 bg-yellow-500/10 px-2 py-1 text-sm text-yellow-200 hover:bg-yellow-500/20"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMsg();
                }
              }}
              placeholder="Escribe algo para el chat"
              className="flex-1 text-black p-2 rounded"
            />
            <button onClick={sendMsg} className="bg-green-500 px-4 rounded">
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}