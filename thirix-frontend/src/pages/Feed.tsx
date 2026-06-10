import { useEffect, useState } from "react";
import { Post } from "../types";
import { getPosts } from "../services/post.service";
import { getSavedPosts } from "../services/user.service";
import PostCard from "../components/PostCard";
import { Loader2, Video, Radio, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  connectSocket,
  requestLiveList,
  onLiveList,
  onLiveStarted
} from "../lib/socket";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState<any[]>([]);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const navigate = useNavigate();

  /* =========================
     POSTS
  ========================= */
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const [allPosts, savedPosts] = await Promise.all([
          getPosts(),
          getSavedPosts()
        ]);

        const savedIds = new Set((savedPosts || []).map((p: any) => p._id));

        setPosts(
          (allPosts || []).map((p: any) => ({
            ...p,
            saved: savedIds.has(p._id)
          }))
        );
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  /* =========================
     LIVE SYSTEM FIXED
  ========================= */
  useEffect(() => {
    const socket = connectSocket("feed");

    const request = () => requestLiveList();

    request();
    if (socket.connected) {
      request();
    } else {
      socket.once("connect", request);
    }

    const offList = onLiveList((list) => {
      setLives(list || []);
    });

    const offStarted = onLiveStarted((live) => {
      setLives((prev) => {
        const exists = prev.some((l) => l.streamId === live.streamId);
        if (exists) return prev;
        return [...prev, { ...live, viewers: 0 }];
      });
    });

    return () => {
      offList?.();
      offStarted?.();
      socket.off("connect", request);
    };
  }, []);

  const openJoinModal = () => {
    setJoinModalOpen(true);
    setRoomIdInput("");
    setJoinError("");
  };

  const closeJoinModal = () => {
    setJoinModalOpen(false);
    setRoomIdInput("");
    setJoinError("");
  };

  const handleJoinLive = () => {
    const trimmedId = roomIdInput.trim();

    if (!trimmedId) {
      setJoinError("Ingresa un ID de sala.");
      return;
    }

    const exists = lives.some((live) => live.streamId === trimmedId);

    if (!exists) {
      setJoinError("No se encontró una sala activa con ese ID.");
      return;
    }

    navigate(`/live/${trimmedId}`);
    closeJoinModal();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

     
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Inicio</h1>

        <div className="flex gap-3">
          <button onClick={() => navigate(`/live/${Date.now()}`)}>
            <Radio />
          </button>

          <button onClick={openJoinModal} className="rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-colors" aria-label="Unirse a una sala">
            <Video />
          </button>

          <button onClick={() => navigate("/messages")}>
            <MessageCircle />
          </button>
        </div>
      </div>

      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Unirse a una sala</h3>
              <button onClick={closeJoinModal} className="text-gray-500 hover:text-gray-700 text-xl">
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Ingresa el ID de la sala para entrar al live.
            </p>

            <input
              value={roomIdInput}
              onChange={(e) => {
                setRoomIdInput(e.target.value);
                if (joinError) setJoinError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoinLive();
              }}
              placeholder="Ej: 1712345678901"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
            />

            {joinError ? <p className="mt-2 text-sm text-red-600">{joinError}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeJoinModal} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleJoinLive} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

     
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}