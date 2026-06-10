import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ||
  "http://localhost:5000";

const normalizeLiveMessage = (data: any) => {
  if (!data) return null;

  if (typeof data === "string") {
    return { user: "Anónimo", message: data };
  }

  if (typeof data === "object") {
    const user =
      data.user ??
      data.username ??
      data.sender ??
      data.from ??
      data.author ??
      "Anónimo";
    const message =
      data.message ?? data.text ?? data.content ?? data.body ?? "";

    return { user, message };
  }

  return null;
};


export const connectSocket = (userId: string): Socket => {
  if (socket) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(URL, {
    transports: ["websocket"],
    autoConnect: true
  });

  socket.on("connect", () => {
    console.log("Socket conectado:", socket?.id);
    socket?.emit("user_connected", userId);
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado");
  });

  return socket;
};


export const ensureSocket = (userId: string): Socket => {
  if (!socket) return connectSocket(userId);
  if (!socket.connected) socket.connect();
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};


export const joinConversation = (id: string) =>
  socket?.emit("join_conversation", id);

export const sendMessageSocket = (data: any) =>
  socket?.emit("send_message", data);

export const emitTyping = (id: string) =>
  socket?.emit("typing", { conversationId: id });

export const emitStopTyping = (id: string) =>
  socket?.emit("stop_typing", { conversationId: id });

export const emitMessageRead = (id: string) =>
  socket?.emit("message_read", { messageId: id });


const emitWhenReady = (event: string, payload: any) => {
  const s = socket;
  if (!s) return;

  if (s.connected) {
    s.emit(event, payload);
  } else {
    s.once("connect", () => s.emit(event, payload));
  }
};

export const joinLive = (streamId: string, userId: string) =>
  emitWhenReady("join_live", { streamId, userId });

export const startLive = (streamId: string, userId: string) =>
  emitWhenReady("start_live", { streamId, userId });

export const endLive = (streamId: string) =>
  emitWhenReady("end_live", { streamId });

export const leaveLive = (streamId: string, userId: string) =>
  emitWhenReady("leave_live", { streamId, userId });

export const sendLiveMessage = (
  streamId: string,
  user: string,
  message: string
) => emitWhenReady("live_message", { streamId, user, message });

export const sendReaction = (streamId: string, emoji: string) =>
  socket?.emit("live_reaction", { streamId, emoji });


export const sendWebRTCOffer = (to: string, offer: RTCSessionDescriptionInit) =>
  socket?.emit("webrtc_offer", { to, offer });

export const sendWebRTCAnswer = (to: string, answer: RTCSessionDescriptionInit) =>
  socket?.emit("webrtc_answer", { to, answer });

export const sendICECandidate = (to: string, candidate: RTCIceCandidate) =>
  socket?.emit("webrtc_ice_candidate", { to, candidate });


export const onLiveList = (cb: (list: any[]) => void) => {
  const handler = (data: any) => {
    if (!data) return cb([]);

    const list = Array.isArray(data) ? data : [];

    cb(
      list.map((l) => ({
        streamId: l.streamId,
        userId: l.userId,
        viewers: l.viewers ?? 0
      }))
    );
  };

  socket?.on("live_list", handler);
  return () => socket?.off("live_list", handler);
};

export const requestLiveList = () => {
  if (socket?.connected) {
    socket.emit("get_live_list");
  }
};

export const onLiveStarted = (cb: (data: any) => void) => {
  const handler = (data: any) => {
    if (!data) return;

    cb({
      streamId: data.streamId,
      userId: data.userId
    });
  };

  socket?.on("live_started", handler);
  return () => socket?.off("live_started", handler);
};

export const onLiveEnded = (cb: () => void) => {
  socket?.on("live_ended", cb);
  return () => socket?.off("live_ended", cb);
};

export const onLiveViewers = (cb: (count: number) => void) => {
  const handler = (data: any) => {
    if (typeof data === "number") {
      cb(data);
      return;
    }

    const count = Number(
      data?.count ?? data?.viewers ?? data?.total ?? data?.participants ?? 0
    );
    cb(Number.isFinite(count) ? count : 0);
  };

  socket?.on("live_viewers", handler);
  return () => {
    socket?.off("live_viewers", handler);
  };
};

export const onLiveMessage = (cb: (data: any) => void) => {
  const handler = (data: any) => {
    const normalized = normalizeLiveMessage(data);
    if (!normalized) return;
    cb(normalized);
  };

  socket?.on("live_message", handler);
  socket?.on("live_chat_message", handler);
  socket?.on("message", handler);

  return () => {
    socket?.off("live_message", handler);
    socket?.off("live_chat_message", handler);
    socket?.off("message", handler);
  };
};

export const onLiveReaction = (cb: (data: any) => void) => {
  socket?.on("live_reaction_update", cb);
  return () => socket?.off("live_reaction_update", cb);
};


export const onReceiveMessage = (cb: (m: any) => void) => {
  socket?.on("receive_message", cb);
  return () => socket?.off("receive_message", cb);
};

export const onUserTyping = (cb: (d: any) => void) => {
  socket?.on("user_typing", cb);
  return () => socket?.off("user_typing", cb);
};

export const onUserStopTyping = (cb: (d: any) => void) => {
  socket?.on("user_stop_typing", cb);
  return () => socket?.off("user_stop_typing", cb);
};

export const onOnlineUsers = (cb: (u: string[]) => void) => {
  socket?.on("online_users", cb);
  return () => socket?.off("online_users", cb);
};

export const onMessageSeen = (cb: (d: any) => void) => {
  socket?.on("message_seen", cb);
  return () => socket?.off("message_seen", cb);
};


export const onWebRTCOffer = (cb: (d: any) => void) => {
  const handler = (d: any) => cb(d);
  socket?.on("webrtc_offer", handler);
  return () => socket?.off("webrtc_offer", handler);
};

export const onWebRTCAnswer = (cb: (d: any) => void) => {
  const handler = (d: any) => cb(d);
  socket?.on("webrtc_answer", handler);
  return () => socket?.off("webrtc_answer", handler);
};

export const onICE = (cb: (d: any) => void) => {
  const handler = (d: any) => cb(d);
  socket?.on("webrtc_ice_candidate", handler);
  return () => socket?.off("webrtc_ice_candidate", handler);
};