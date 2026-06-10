const onlineUsers = new Map();
const liveStreams = new Map();

const leaveCurrentStream = (socket, io) => {
  const previousStreamId = socket.data?.currentStreamId;
  if (previousStreamId) {
    socket.leave(previousStreamId);
    const stream = liveStreams.get(previousStreamId);
    if (stream && stream.viewers) {
      stream.viewers.delete(socket.data?.userId || socket.id);
      io.to(previousStreamId).emit("live_viewers", { count: stream.viewers.size });
    }
  }
  socket.data.currentStreamId = null;
};

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    const getSocketId = (userId) => onlineUsers.get(userId);

  
    socket.on("user_connected", (userId) => {
      socket.data.userId = userId;
      onlineUsers.set(userId, socket.id);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("send_message", (messageData) => {
      io.to(messageData.conversationId).emit("receive_message", messageData);
    });

    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("user_typing", { userId: data.userId });
    });

    socket.on("stop_typing", (data) => {
      socket.to(data.conversationId).emit("user_stop_typing", { userId: data.userId });
    });

    socket.on("message_read", (data) => {
      socket.to(data.conversationId).emit("message_seen", data);
    });

    

    socket.on("start_live", ({ streamId, userId }) => {
      leaveCurrentStream(socket, io);

      const existing = liveStreams.get(streamId);
      liveStreams.set(streamId, {
        hostId: userId,
        hostSocketId: socket.id,
        viewers: existing?.viewers || new Set()
      });

      socket.data.currentStreamId = streamId;
      socket.join(streamId);

      io.emit("live_started", { streamId, userId });
      io.to(streamId).emit("live_viewers", { count: liveStreams.get(streamId).viewers.size });
      io.to(socket.id).emit("host_ready", { streamId, hostSocketId: socket.id });

      io.emit("live_list", Array.from(liveStreams.entries()).map(([id, data]) => ({
        streamId: id,
        userId: data.hostId,
        viewers: data.viewers.size
      })));
    });

    socket.on("join_live", ({ streamId, userId }) => {
      let stream = liveStreams.get(streamId);

      if (!stream) {
        stream = {
          hostId: null,
          hostSocketId: null,
          viewers: new Set()
        };
        liveStreams.set(streamId, stream);
      }

      leaveCurrentStream(socket, io);

      socket.data.currentStreamId = streamId;
      socket.join(streamId);

      stream.viewers.add(userId);

      io.to(streamId).emit("live_viewers", {
        count: stream.viewers.size
      });

      if (stream.hostSocketId) {
        io.to(stream.hostSocketId).emit("viewer_joined", {
          userId,
          socketId: socket.id
        });
      }

      if (stream.hostSocketId) {
        io.to(socket.id).emit("host_ready", {
          streamId,
          hostSocketId: stream.hostSocketId
        });
      }
    });

    socket.on("leave_live", ({ streamId }) => {
      if (!streamId) return;
      socket.leave(streamId);
      const stream = liveStreams.get(streamId);
      if (stream) {
        stream.viewers.delete(socket.data?.userId || socket.id);
        io.to(streamId).emit("live_viewers", { count: stream.viewers.size });
        io.to(streamId).emit("viewer_left", {
          userId: socket.data?.userId || socket.id,
          socketId: socket.id
        });
      }
      if (socket.data?.currentStreamId === streamId) {
        socket.data.currentStreamId = null;
      }
    });

   
    socket.on("get_live_list", () => {
      const list = Array.from(liveStreams.entries()).map(([id, data]) => ({
        streamId: id,
        userId: data.hostId,
        viewers: data.viewers.size
      }));

      socket.emit("live_list", list);
    });

   
    socket.on("end_live", ({ streamId }) => {
      liveStreams.delete(streamId);

      io.to(streamId).emit("live_ended");

      io.emit("live_list", Array.from(liveStreams.entries()).map(([id, data]) => ({
        streamId: id,
        userId: data.hostId,
        viewers: data.viewers.size
      })));

      io.socketsLeave(streamId);
    });

    

    socket.on("webrtc_offer", ({ to, offer }) => {
      io.to(to).emit("webrtc_offer", {
        offer,
        from: socket.id
      });
    });

    socket.on("webrtc_answer", ({ to, answer }) => {
      io.to(to).emit("webrtc_answer", {
        answer,
        from: socket.id
      });
    });

    socket.on("webrtc_ice_candidate", ({ to, candidate }) => {
      io.to(to).emit("webrtc_ice_candidate", {
        candidate,
        from: socket.id
      });
    });

   
    socket.on("live_message", ({ streamId, user, message }) => {
      io.to(streamId).emit("live_message", { user, message });
    });

    socket.on("live_reaction", ({ streamId, emoji }) => {
      io.to(streamId).emit("live_reaction_update", { emoji });
    });

   
    socket.on("disconnect", () => {
      const previousStreamId = socket.data?.currentStreamId;
      if (previousStreamId) {
        const stream = liveStreams.get(previousStreamId);
        if (stream) {
          stream.viewers.delete(socket.data?.userId || socket.id);
          io.to(previousStreamId).emit("live_viewers", { count: stream.viewers.size });
          io.to(previousStreamId).emit("viewer_left", {
            userId: socket.data?.userId || socket.id,
            socketId: socket.id
          });
        }
      }

      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = {
  initializeSocket,
  onlineUsers,
  liveStreams
};