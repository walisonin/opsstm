import { useState, useEffect } from 'react';
import { useAuth } from './auth.jsx';
import { useData, toast } from './data.jsx';
import { api } from './api.js';
import { Icons, Avatar, Ladrilho } from './components.jsx';

export default function Dashboard({ setUserModal }) {
  const { user } = useAuth();
  const { users } = useData();
  const [shortcuts, setShortcuts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const isMod = ['super_admin', 'admin', 'moderator'].includes(user?.role);
  const isAdmin = ['super_admin', 'admin'].includes(user?.role);

  const load = async () => {
    const [{ shortcuts }, { announcements }] = await Promise.all([
      api.shortcuts.list(),
      api.announcements.list(),
    ]);
    setShortcuts(shortcuts);
    setAnnouncements(announcements);
    if (isAdmin) { try { const { stats } = await api.admin.stats(); setStats(stats); } catch {} }
  };
  useEffect(() => { load(); }, []);

  const online = users.filter(u => u.status === 'online');

  const saveShortcut = async (sc) => {
    try {
      if (sc.id) await api.shortcuts.update(sc.id, sc);
      else await api.shortcuts.create(sc);
      toast(sc.id ? 'Direcionamento atualizado' : 'Direcionamento criado', 'ok');
      setEditing(null);
      load();
    } catch (e) { toast(e.message, 'err'); }
  };
  const delShortcut = async (id) => {
    if (!confirm('Remover esse direcionamento?')) return;
    try { await api.shortcuts.delete(id); toast('Removido', 'err'); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const openShortcut = async (sc) => {
    try { await api.shortcuts.click(sc.id); } catch {}
    const url = /^https?:\/\//i.test(sc.url) ? sc.url : `https://${sc.url}`;
    window.open(url, '_blank', 'noopener');
  };

  const onDrop = async (e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;
    const next = [...shortcuts];
    const from = next.findIndex(x => x.id === sourceId);
    const to = next.findIndex(x => x.id === targetId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setShortcuts(next);
    setDragOver(null);
    try { await api.shortcuts.reorder(next.map(s => s.id)); } catch (e) { toast(e.message, 'err'); }
  };

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Bom dia' : hours < 18 ? 'Boa tarde' : 'Boa noite';
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{today}</div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}.</h1>
          <p className="page-subtitle">{online.length} {online.length === 1 ? 'membro conectado' : 'membros conectados'}. Bom trabalho!</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setEditing({})}>{Icons.plus} Novo direcionamento</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        <KPI label="Usuários online" value={online.length} color="#9fb42c" icon="user" />
        <KPI label="Mensagens 24h" value={stats?.messagesToday ?? '—'} color="#1f6fb8" icon="chat" />
        <KPI label="Tópicos no fórum" value={stats?.topics ?? '—'} color="#ea431b" icon="forum" />
        <KPI label="Itens no cofre" value={stats?.vaultItems ?? '—'} color="#eeb23e" icon="vault" />
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-head">
          <div>
            <h3>Direcionamentos rápidos</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Atalhos para os sistemas que o time usa. Arraste para reordenar.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing({})}>{Icons.plus} Adicionar</button>
        </div>
        <div className="card-body">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {shortcuts.map(sc => (
              <ShortcutCard
                key={sc.id} sc={sc} dragOver={dragOver === sc.id}
                onDragStart={e => e.dataTransfer.setData('text/plain', sc.id)}
                onDragOver={e => { e.preventDefault(); setDragOver(sc.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(e, sc.id)}
                onEdit={() => setEditing(sc)}
                onDelete={() => delShortcut(sc.id)}
                onOpen={() => openShortcut(sc)}
              />
            ))}
            <button onClick={() => setEditing({})}
              style={{ border: '1.5px dashed var(--border-default)', borderRadius: 12, padding: '18px 14px', background: 'transparent', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 104, cursor: 'pointer' }}>
              {Icons.plus}
              <span style={{ fontSize: 12, fontWeight: 600 }}>Novo direcionamento</span>
            </button>
          </div>
          {shortcuts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Ainda sem direcionamentos. Clique em "Adicionar" pra criar o primeiro.
            </div>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 28 }}>
        <div className="card">
          <div className="card-head">
            <h3>Avisos recentes</h3>
            {isMod && <NewAnnouncement onCreated={load} />}
          </div>
          <div>
            {announcements.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Nenhum aviso ainda.</div>}
            {announcements.map(a => {
              const pc = a.priority === 'high' ? '#c72124' : a.priority === 'medium' ? '#eeb23e' : '#9fb42c';
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 4, alignSelf: 'stretch', background: pc, borderRadius: 2, margin: '2px 0' }} />
                  <Avatar user={a.author} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }} className="truncate">{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.author.name} · {timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Online agora</h3>
            <span className="badge badge-green"><span className="dot dot-online" style={{ width: 6, height: 6 }} /> {online.length}</span>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 340, overflow: 'auto' }}>
            {online.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Ninguém online agora.</div>}
            {online.slice(0, 12).map(u => (
              <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar user={u} size={32} showStatus />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{u.roleDesc || u.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editing !== null && <ShortcutModal sc={editing.id ? editing : null} onSave={saveShortcut} onClose={() => setEditing(null)} />}
    </div>
  );
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff/3600)} h`;
  if (diff < 604800) return `há ${Math.floor(diff/86400)} d`;
  return d.toLocaleDateString('pt-BR');
}

function KPI({ label, value, color, icon }) {
  return (
    <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}22`, color, display: 'grid', placeItems: 'center' }}>{Icons[icon]}</div>
      </div>
      <div style={{ position: 'absolute', right: -24, bottom: -24, opacity: 0.05 }}>
        <Ladrilho color={color} size={84} />
      </div>
    </div>
  );
}

function ShortcutCard({ sc, onEdit, onDelete, onOpen, onDragStart, onDragOver, onDragLeave, onDrop, dragOver }) {
  const [hover, setHover] = useState(false);
  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', background: 'var(--bg-elev-1)', border: `1px solid ${dragOver ? 'var(--accent)' : 'var(--border-subtle)'}`,
        borderRadius: 12, padding: 16, cursor: 'grab', transition: 'all 140ms',
        transform: dragOver ? 'scale(1.02)' : 'scale(1)',
      }} onClick={onOpen}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${sc.color}22`, color: sc.color, display: 'grid', placeItems: 'center' }}>
          {Icons[sc.icon] || Icons.link}
        </div>
        {hover && (
          <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
            <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={onEdit}>{Icons.edit}</button>
            <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={onDelete}>{Icons.trash}</button>
          </div>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{sc.label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{sc.url}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
        <span className="mono">{(sc.clicks || 0).toLocaleString('pt-BR')}</span> acessos
      </div>
    </div>
  );
}

function ShortcutModal({ sc, onSave, onClose }) {
  const [form, setForm] = useState(sc || { label: '', url: '', icon: 'link', color: '#9fb42c' });
  const colors = ['#9fb42c', '#7e3f62', '#1f6fb8', '#ea431b', '#eeb23e', '#1f8a8a', '#f2801f', '#c72124'];
  const icons = ['link', 'chart', 'forum', 'chat', 'vault', 'user', 'trophy', 'admin'];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{sc ? 'Editar direcionamento' : 'Novo direcionamento'}</h3>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label className="field-label">Nome</label>
            <input className="input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Ex: Painel de Vendas" autoFocus /></div>
          <div><label className="field-label">URL</label>
            <input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="vendas.stm.internal ou https://..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className="field-label">Ícone</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {icons.map(ic => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                    style={{ width: 36, height: 36, borderRadius: 8, background: form.icon === ic ? 'var(--accent-soft)' : 'var(--bg-base)', color: form.icon === ic ? 'var(--accent)' : 'var(--text-secondary)', border: `1px solid ${form.icon === ic ? 'var(--accent)' : 'var(--border-subtle)'}` }}>{Icons[ic]}</button>
                ))}
              </div></div>
            <div><label className="field-label">Cor</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {colors.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '2px solid var(--text-primary)' : '2px solid transparent' }} />
                ))}
              </div></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, id: sc?.id })} disabled={!form.label || !form.url}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function NewAnnouncement({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('medium');

  const save = async () => {
    if (!title.trim()) return;
    try {
      await api.announcements.create({ title, body, priority });
      toast('Aviso publicado', 'ok');
      setTitle(''); setBody(''); setOpen(false);
      onCreated?.();
    } catch (e) { toast(e.message, 'err'); }
  };

  if (!open) return <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>{Icons.plus} Novo aviso</button>;
  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>Novo aviso</h3><button className="icon-btn" onClick={() => setOpen(false)}>{Icons.close}</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="field-label">Título</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} autoFocus /></div>
          <div><label className="field-label">Descrição (opcional)</label>
            <textarea className="input" rows={3} value={body} onChange={e => setBody(e.target.value)} /></div>
          <div><label className="field-label">Prioridade</label>
            <div className="seg">
              {[['high','Alta'],['medium','Média'],['low','Baixa']].map(([k,l]) => (
                <button key={k} className={priority === k ? 'on' : ''} onClick={() => setPriority(k)}>{l}</button>
              ))}
            </div></div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={!title.trim()}>Publicar</button>
        </div>
      </div>
    </div>
  );
}
