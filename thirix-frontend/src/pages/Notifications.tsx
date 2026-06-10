import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { onOnlineUsers } from '../lib/socket';

import {
  getNotifications,
  markAsRead
} from "../services/notification.service";

export default function Notifications() {
  const { user } = useAuth();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    if (user) {
      onOnlineUsers((u: string[]) => {
        setOnlineUsers(u);
      });
    }
  }, [user]);

 
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

 
  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);

    setNotifications(prev =>
      prev.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Notificaciones
      </h1>

      <div className="space-y-3">

       
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="font-semibold text-gray-900">
              Usuarios en línea
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {onlineUsers.length}
            </span>
          </div>

          {onlineUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No hay usuarios en línea
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map(uid => (
                <span
                  key={uid}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {uid === user?._id ? 'Tú' : uid.slice(-6)}
                </span>
              ))}
            </div>
          )}
        </div>

      
        <div className="bg-white rounded-2xl border border-gray-200 p-6">

          {loading ? (
            <p className="text-center text-gray-400 py-6">
              Cargando notificaciones...
            </p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={40} className="text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700">
                Sin notificaciones
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Likes, comentarios y seguidores aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {notifications.map((n: any) => (
                <div
                  key={n._id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    n.isRead ? "bg-gray-50" : "bg-white"
                  }`}
                >

                 
                  <div>
                    <p className="text-sm text-gray-800">
                      <b>{n.sender?.username || "Usuario"}</b>{" "}
                      realizó{" "}
                      <span className="font-semibold">
                        {n.type}
                      </span>
                    </p>

                    {n.post?.content && (
                      <p className="text-xs text-gray-400">
                        {n.post.content.slice(0, 60)}
                      </p>
                    )}
                  </div>

                
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <Check size={14} />
                      Marcar leído
                    </button>
                  )}

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}