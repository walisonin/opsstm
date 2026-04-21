const BASE = import.meta.env.VITE_API_URL || '/api';

let authToken = localStorage.getItem('stm_jwt') || null;

export function setToken(t) {
  authToken = t;
  if (t) localStorage.setItem('stm_jwt', t);
  else localStorage.removeItem('stm_jwt');
}
export function getToken() { return authToken; }

async function request(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
    body: opts.body && typeof opts.body !== 'string' && !(opts.body instanceof FormData)
      ? JSON.stringify(opts.body)
      : opts.body,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const methods = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  delete: (p) => request(p, { method: 'DELETE' }),
};

export const api = {
  ...methods,

  auth: {
    login: (email, password) => methods.post('/auth/login', { email, password }),
    logout: () => methods.post('/auth/logout'),
    me: () => methods.get('/auth/me'),
    updateMe: (data) => methods.patch('/auth/me', data),
    changePassword: (currentPassword, newPassword) => methods.post('/auth/change-password', { currentPassword, newPassword }),
    uploadAvatar: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const headers = {};
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch(`${BASE}/auth/me/avatar`, { method: 'POST', body: form, credentials: 'include', headers });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload falhou');
      return res.json();
    },
    uploadCover: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const headers = {};
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch(`${BASE}/auth/me/cover`, { method: 'POST', body: form, credentials: 'include', headers });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload falhou');
      return res.json();
    },
    removeAvatar: () => methods.delete('/auth/me/avatar'),
    removeCover: () => methods.delete('/auth/me/cover'),
  },

  users: {
    list: () => methods.get('/users'),
    online: () => methods.get('/users/online'),
    get: (id) => methods.get(`/users/${id}`),
  },

  shortcuts: {
    list: () => methods.get('/shortcuts'),
    create: (data) => methods.post('/shortcuts', data),
    update: (id, data) => methods.patch(`/shortcuts/${id}`, data),
    delete: (id) => methods.delete(`/shortcuts/${id}`),
    click: (id) => methods.post(`/shortcuts/${id}/click`),
    reorder: (ids) => methods.post('/shortcuts/reorder', { ids }),
  },

  vault: {
    categories: () => methods.get('/vault/categories'),
    createCategory: (data) => methods.post('/vault/categories', data),
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return methods.get(`/vault${qs ? '?' + qs : ''}`);
    },
    create: (data) => methods.post('/vault', data),
    update: (id, data) => methods.patch(`/vault/${id}`, data),
    reveal: (id) => methods.get(`/vault/${id}/reveal`),
    delete: (id) => methods.delete(`/vault/${id}`),
  },

  forum: {
    categories: () => methods.get('/forum/categories'),
    topics: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return methods.get(`/forum/topics${qs ? '?' + qs : ''}`);
    },
    topic: (id) => methods.get(`/forum/topics/${id}`),
    createTopic: (data) => methods.post('/forum/topics', data),
    createPost: (topicId, body) => methods.post(`/forum/topics/${topicId}/posts`, { body }),
    moderateTopic: (id, data) => methods.patch(`/forum/topics/${id}`, data),
    reactPost: (id, emoji) => methods.post(`/forum/posts/${id}/react`, { emoji }),
    deletePost: (id) => methods.delete(`/forum/posts/${id}`),
    deleteTopic: (id) => methods.delete(`/forum/topics/${id}`),
  },

  chat: {
    channels: () => methods.get('/chat/channels'),
    createChannel: (data) => methods.post('/chat/channels', data),
    messages: (channelId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return methods.get(`/chat/channels/${channelId}/messages${qs ? '?' + qs : ''}`);
    },
    send: (channelId, data) => methods.post(`/chat/channels/${channelId}/messages`, data),
    react: (id, emoji) => methods.post(`/chat/messages/${id}/react`, { emoji }),
    deleteMessage: (id) => methods.delete(`/chat/messages/${id}`),
  },

  announcements: {
    list: () => methods.get('/announcements'),
    create: (data) => methods.post('/announcements', data),
    delete: (id) => methods.delete(`/announcements/${id}`),
  },

  admin: {
    users: () => methods.get('/admin/users'),
    createUser: (data) => methods.post('/admin/users', data),
    updateUser: (id, data) => methods.patch(`/admin/users/${id}`, data),
    resetPassword: (id) => methods.post(`/admin/users/${id}/reset-password`),
    deleteUser: (id) => methods.delete(`/admin/users/${id}`),
    auditLogs: () => methods.get('/admin/audit-logs'),
    stats: () => methods.get('/admin/stats'),
  },

  uploads: {
    upload: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const headers = {};
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch(`${BASE}/uploads`, {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers,
      });
      if (!res.ok) throw new Error('Upload falhou');
      return res.json();
    },
  },
};
