import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { api } from './api.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [forumCategories, setForumCategories] = useState([]);
  const [chatChannels, setChatChannels] = useState([]);
  const [vaultCategories, setVaultCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [u, fc, cc, vc] = await Promise.all([
        api.users.list().catch(() => ({ users: [] })),
        api.forum.categories().catch(() => ({ categories: [] })),
        api.chat.channels().catch(() => ({ channels: [] })),
        api.vault.categories().catch(() => ({ categories: [] })),
      ]);
      setUsers(u.users);
      setForumCategories(fc.categories);
      setChatChannels(cc.channels);
      setVaultCategories(vc.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return (
    <DataContext.Provider value={{
      users, forumCategories, chatChannels, vaultCategories,
      loading, reload, setUsers,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
export const userByIdIn = (users, id) => users.find(u => u.id === id);

export function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

let toastIdCounter = 0;
const toastListeners = new Set();

export function toast(msg, kind = 'ok') {
  const t = { id: ++toastIdCounter, msg, kind };
  toastListeners.forEach(fn => fn(t));
}

export function useToasts() {
  const [list, setList] = useState([]);
  useEffect(() => {
    const fn = t => {
      setList(prev => [...prev, t]);
      setTimeout(() => setList(prev => prev.filter(x => x.id !== t.id)), 3200);
    };
    toastListeners.add(fn);
    return () => toastListeners.delete(fn);
  }, []);
  return list;
}
