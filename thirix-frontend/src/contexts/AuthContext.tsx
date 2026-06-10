import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '../types';
import { disconnectSocket } from '../lib/socket';
import { getMe } from '../services/auth.service';

interface AuthCtx { user: AuthUser | null; loading: boolean; setUser: (u: AuthUser | null) => void; logout: () => void }
const AuthContext = createContext<AuthCtx>({ user: null, loading: false, setUser: () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthContext);

const AUTH_STORAGE_KEY = 'auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => !window.localStorage.getItem(AUTH_STORAGE_KEY));

  useEffect(() => {
    const boot = async () => {
      if (user) {
        setLoading(false);
        return;
      }

      try {
        const me = await getMe();
        setUserState(me);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(me));
      } catch {
        setUserState(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    void boot();
  }, []);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const logout = () => {
    setUser(null);
    disconnectSocket();
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, loading, setUser, logout }}>{children}</AuthContext.Provider>;
};
