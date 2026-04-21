import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './auth.jsx';
import { useData, toast } from './data.jsx';
import { api } from './api.js';
import { Icons, BrandMark, Avatar, Ladrilho } from './components.jsx';

export const NAV = [
  { group: 'PRINCIPAL', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'chat', label: 'Chat', icon: 'chat' },
    { id: 'forum', label: 'Fórum', icon: 'forum' },
    { id: 'vault', label: 'Cofre', icon: 'vault' },
  ]},
  { group: 'COMUNIDADE', items: [
    { id: 'ranking', label: 'Ranking', icon: 'trophy' },
    { id: 'profile', label: 'Meu perfil', icon: 'user' },
  ]},
  { group: 'GESTÃO', items: [
    { id: 'admin', label: 'Administração', icon: 'admin', adminOnly: true },
  ]},
];

export function Sidebar({ current, setCurrent, onOpenSearch, onLogout }) {
  const { user } = useAuth();
  const { users } = useData();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);
  const onlineUsers = users.filter(u => u.status === 'online');

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark size={36} />
        <div className="brand-text">
          <div className="name">STM Operações</div>
          <div className="sub">Portal interno</div>
        </div>
      </div>

      <div className="sidebar-search">
        <div className="sidebar-search-input" onClick={onOpenSearch}>
          {Icons.search}
          <span>Buscar no portal...</span>
          <kbd>⌘K</kbd>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(g => {
          const items = g.items.filter(it => !it.adminOnly || isAdmin);
          if (items.length === 0) return null;
          return (
            <div key={g.group}>
              <div className="nav-group-label">{g.group}</div>
              {items.map(it => (
                <div
                  key={it.id}
                  className={`nav-item ${current === it.id ? 'active' : ''}`}
                  onClick={() => setCurrent(it.id)}
                >
                  {Icons[it.icon]}
                  <span>{it.label}</span>
                </div>
              ))}
            </div>
          );
        })}

        <div style={{ marginTop: 'auto', padding: '16px 10px 8px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Online agora</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div className="dot dot-online" style={{ width: 6, height: 6 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{onlineUsers.length}</strong> membros conectados</span>
          </div>
          {onlineUsers.length > 0 && (
            <div style={{ display: 'flex', marginLeft: 4 }}>
              {onlineUsers.slice(0, 6).map((u, i) => (
                <div key={u.id} style={{ marginLeft: -6, zIndex: 10 - i, border: '2px solid var(--sidebar-bg, var(--bg-canvas))', borderRadius: '50%' }}>
                  <Avatar user={u} size={24} />
                </div>
              ))}
              {onlineUsers.length > 6 && (
                <div style={{ marginLeft: -6, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-elev-2)', color: 'var(--text-secondary)', fontSize: 10, display: 'grid', placeItems: 'center', border: '2px solid var(--sidebar-bg, var(--bg-canvas))', fontWeight: 700 }}>
                  +{onlineUsers.length - 6}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-foot">
        <Avatar user={user} size={34} showStatus />
        <div className="info">
          <div className="n">{user?.name}</div>
          <div className="r">{user?.roleDesc || user?.role}</div>
        </div>
        <button className="icon-btn tip" data-tip="Sair" onClick={() => { onLogout(); toast('Até logo!', 'info'); }}>
          {Icons.logout}
        </button>
      </div>
    </aside>
  );
}

export function Topbar({ crumbs, onThemeToggle, onOpenTweaks }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i}>
            <span className={i === crumbs.length - 1 ? 'cur' : ''}>{c}</span>
            {i < crumbs.length - 1 && <span className="sep"> / </span>}
          </span>
        ))}
      </div>
      <div className="topbar-actions">
        <button className="icon-btn tip" data-tip="Alternar tema" onClick={onThemeToggle}>{Icons.moon}</button>
        <button className="icon-btn tip" data-tip="Tweaks" onClick={onOpenTweaks}>{Icons.settings}</button>
        <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 6px' }} />
        <Avatar user={user} size={32} showStatus />
      </div>
    </header>
  );
}

export function CmdK({ open, onClose, setCurrent }) {
  const { users, chatChannels, forumCategories } = useData();
  const { user } = useAuth();
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);
  const [q, setQ] = useState('');
  const [topicResults, setTopicResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    if (!q.trim()) { setTopicResults([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const { topics } = await api.forum.topics({ limit: 10 });
        if (!alive) return;
        const qL = q.toLowerCase();
        setTopicResults(topics.filter(t => t.title.toLowerCase().includes(qL)));
      } catch {}
    }, 200);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  const results = useMemo(() => {
    const Q = q.toLowerCase().trim();
    const out = [];
    NAV.flatMap(g => g.items).forEach(it => {
      if (it.adminOnly && !isAdmin) return;
      if (!Q || it.label.toLowerCase().includes(Q))
        out.push({ type: 'Página', label: it.label, icon: it.icon, action: () => { setCurrent(it.id); onClose(); } });
    });
    if (Q) {
      users.forEach(u => {
        if (u.name.toLowerCase().includes(Q) || u.handle.toLowerCase().includes(Q) || (u.roleDesc || '').toLowerCase().includes(Q))
          out.push({ type: 'Pessoa', label: u.name, sub: u.roleDesc || u.role, user: u, action: () => { setCurrent('profile'); onClose(); } });
      });
      chatChannels.forEach(c => {
        if (c.name.includes(Q) || (c.topic || '').toLowerCase().includes(Q))
          out.push({ type: 'Canal', label: '#' + c.name, sub: c.topic, icon: 'hash', action: () => { setCurrent('chat'); onClose(); } });
      });
      topicResults.forEach(t => {
        out.push({ type: 'Tópico', label: t.title, sub: 'Fórum', icon: 'forum', action: () => { setCurrent('forum'); onClose(); } });
      });
    }
    return out.slice(0, 14);
  }, [q, users, chatChannels, topicResults, isAdmin, setCurrent, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 620, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)' }}>{Icons.search}</span>
          <input ref={inputRef} className="input" style={{ border: 0, padding: 0, background: 'transparent', fontSize: 16 }}
            placeholder="Buscar pessoas, canais, tópicos, páginas..." value={q} onChange={e => setQ(e.target.value)} />
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 6px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 4, color: 'var(--text-muted)' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 380, overflow: 'auto', padding: 6 }}>
          {q && results.length === 0 && <div style={{ padding: '24px 18px', color: 'var(--text-muted)', fontSize: 13 }}>Nada encontrado para "{q}"</div>}
          {results.map((r, i) => (
            <div key={i} onClick={r.action} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {r.user ? <Avatar user={r.user} size={28} /> : <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elev-1)', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>{Icons[r.icon] || Icons.arrow}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{r.label}</div>
                {r.sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }} className="truncate">{r.sub}</div>}
              </div>
              <span className="badge badge-muted">{r.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UserModal({ user, onClose }) {
  if (!user) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ height: 110, background: `linear-gradient(135deg, ${user.color || '#9fb42c'}, ${user.color || '#9fb42c'}99)`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.2 }}>
            <Ladrilho color="#fff" size={160} />
          </div>
          <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, color: 'white', background: 'rgba(0,0,0,0.2)' }}>{Icons.close}</button>
        </div>
        <div style={{ padding: '0 var(--s-6) var(--s-6)', marginTop: -40 }}>
          <Avatar user={user} size={80} showStatus />
          <div style={{ marginTop: 14 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{user.name}</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{user.roleDesc || user.title || user.role} · @{user.handle}</div>
          </div>
          {user.bio && <p style={{ color: 'var(--text-secondary)', marginTop: 14, marginBottom: 20 }}>{user.bio}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '16px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
            <ModalStat label="Posts" value={user.postCount ?? 0} />
            <ModalStat label="Reputação" value={user.reputation ?? 0} />
            <ModalStat label="Status" value={user.status === 'online' ? '🟢 Online' : user.status === 'away' ? '🟡 Ausente' : user.status === 'dnd' ? '🔴 Ocupado' : '⚫ Offline'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalStat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
