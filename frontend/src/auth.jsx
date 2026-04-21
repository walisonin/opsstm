import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, getToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const { user } = await api.auth.me();
      setUser(user);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const { token, user } = await api.auth.login(email, password);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch {}
    setToken(null);
    setUser(null);
  };

  const updateMe = async (data) => {
    const { user } = await api.auth.updateMe(data);
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateMe, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
