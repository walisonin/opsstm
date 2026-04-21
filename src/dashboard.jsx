import { useState, useEffect } from 'react';
import { USERS, ACTIVITY_DATA, ANNOUNCEMENTS, DEFAULT_SHORTCUTS, RANKING, toast, userById } from './data.jsx';
import { Icons, Avatar, Ladrilho } from './components.jsx';

export default function Dashboard({ density, layout, setUserModal }) {
  const [shortcuts, setShortcuts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stm_shortcuts') || 'null') || DEFAULT_SHORTCUTS; }
    catch { return DEFAULT_SHORTCUTS; }
  });
  const [editing, setEditing] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => { localStorage.setItem('stm_shortcuts', JSON.stringify(shortcuts)); }, [shortcuts]);

  const saveShortcut = (sc) => {
    if (sc.id) setShortcuts(s => s.map(x => x.id === sc.id ? sc : x));
    else setShortcuts(s => [...s, { ...sc, id: 's' + Date.now(), clicks: 0 }]);
    toast(sc.id ? 'Direcionamento atualizado' : 'Direcionamento criado', 'ok');
    setEditing(null);
  };
  const delShortcut = (id) => { setShortcuts(s => s.filter(x => x.id !== id)); toast('Direcionamento removido', 'err'); };

  const onDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;
    setShortcuts(s => {
      const a = [...s];
      const from = a.findIndex(x => x.id === sourceId);
      const to = a.findIndex(x => x.id === targetId);
      const [moved] = a.splice(from, 1);
      a.splice(to, 0, moved);
      return a;
    });
    setDragOver(null);
  };

  const online = USERS.filter(u => u.status === 'online');
  const topRanking = RANKING.slice(0, 5);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Terça, 15 de abril</div>
          <h1 className="page-title">Bom dia, Rafael.</h1>
          <p className="page-subtitle">O time está em ritmo forte hoje — 3 novos tópicos, 47 mensagens, VPS estável.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary">Meu dia</button>
          <button className="btn btn-primary" onClick={() => setEditing({})}>{Icons.plus} Novo direcionamento</button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
        <KPI label="Usuários online" value={online.length} delta="+4" color="#9fb42c" icon="user" />
        <KPI label="Mensagens hoje" value="247" delta="+18%" color="#1f6fb8" icon="chat" />
        <KPI label="Tópicos ativos" value="14" delta="+3" color="#ea431b" icon="forum" />
        <KPI label="Acessos ao vault" value="89" delta="—" color="#eeb23e" icon="vault" />
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-head">
          <div>
            <h3>Direcionamentos rápidos</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Atalhos para os sistemas que o time mais usa. Arraste para reordenar.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing({})}>{Icons.plus} Adicionar</button>
        </div>
        <div className="card-body">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {shortcuts.map(sc => (
              <ShortcutCard
                key={sc.id}
                sc={sc}
                dragOver={dragOver === sc.id}
                onDragStart={e => { e.dataTransfer.setData('text/plain', sc.id); }}
                onDragOver={e => { e.preventDefault(); setDragOver(sc.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(e, sc.id)}
                onEdit={() => setEditing(sc)}
                onDelete={() => delShortcut(sc.id)}
                onOpen={() => { toast('Abrindo ' + sc.label + '...', 'info'); setShortcuts(s => s.map(x => x.id === sc.id ? { ...x, clicks: x.clicks + 1 } : x)); }}
              />
            ))}
            <button
              onClick={() => setEditing({})}
              style={{ border: '1.5px dashed var(--border-default)', borderRadius: 12, padding: '18px 14px', background: 'transparent', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 104, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              {Icons.plus}
              <span style={{ fontSize: 12, fontWeight: 600 }}>Novo direcionamento</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 28 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Engajamento do time</h3>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Mensagens + posts nos últimos 14 dias</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['14d', '30d', '90d'].map((p, i) => (
                <button key={p} className="btn btn-sm" style={{ background: i === 0 ? 'var(--accent-soft)' : 'transparent', color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>{p}</button>
              ))}
            </div>
          </div>
          <div className="card-body">
            <ActivityChart data={ACTIVITY_DATA} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Online agora</h3>
            <span className="badge badge-green"><span className="dot dot-online" style={{ width: 6, height: 6 }} /> {online.length}</span>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 340, overflow: 'auto' }}>
            {online.slice(0, 9).map(u => (
              <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar user={u} size={32} showStatus />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{u.role}</div>
                </div>
                <button className="icon-btn tip" data-tip="Mensagem" onClick={e => { e.stopPropagation(); toast('DM com ' + u.name.split(' ')[0], 'info'); }} style={{ width: 28, height: 28 }}>
                  {Icons.chat}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-head">
            <h3>Avisos recentes</h3>
            <button className="btn btn-ghost btn-sm">Ver todos</button>
          </div>
          <div>
            {ANNOUNCEMENTS.map(a => {
              const u = userById(a.author);
              const pc = a.priority === 'high' ? '#c72124' : a.priority === 'medium' ? '#eeb23e' : '#9fb42c';
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 4, alignSelf: 'stretch', background: pc, borderRadius: 2, margin: '2px 0' }} />
                  <Avatar user={u} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }} className="truncate">{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.name} · {a.when}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">Ler</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Top contribuidores</h3>
            <span className="badge badge-accent">mês</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {topRanking.map((u, i) => (
              <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: i === 0 ? '#eeb23e' : i === 1 ? '#b9bdc6' : i === 2 ? '#d88a4e' : 'var(--text-muted)', width: 24, textAlign: 'center' }}>{i + 1}</div>
                <Avatar user={u} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.reputation.toLocaleString('pt-BR')} pts</div>
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

function KPI({ label, value, delta, color, icon }) {
  return (
    <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
          <div style={{ fontSize: 12, marginTop: 8, color: delta.startsWith('+') ? '#6fd36b' : 'var(--text-muted)' }}>{delta} vs. semana passada</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}22`, color: color, display: 'grid', placeItems: 'center' }}>{Icons[icon]}</div>
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
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', background: 'var(--bg-elev-1)', border: `1px solid ${dragOver ? 'var(--accent)' : 'var(--border-subtle)'}`,
        borderRadius: 12, padding: 16, cursor: 'grab', transition: 'all 140ms',
        transform: dragOver ? 'scale(1.02)' : 'scale(1)',
      }}
      onClick={onOpen}
    >
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
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span className="mono">{sc.clicks.toLocaleString('pt-BR')}</span> acessos
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
          <div>
            <label className="field-label">Nome</label>
            <input className="input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Ex: Painel de Vendas" autoFocus />
          </div>
          <div>
            <label className="field-label">URL ou caminho</label>
            <input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="vendas.stm.internal" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Ícone</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {icons.map(ic => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                    style={{ width: 36, height: 36, borderRadius: 8, background: form.icon === ic ? 'var(--accent-soft)' : 'var(--bg-base)', color: form.icon === ic ? 'var(--accent)' : 'var(--text-secondary)', border: `1px solid ${form.icon === ic ? 'var(--accent)' : 'var(--border-subtle)'}` }}>
                    {Icons[ic]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label">Cor</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {colors.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '2px solid var(--text-primary)' : '2px solid transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}44` : 'none' }} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="field-label">Preview</label>
            <div style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 16, maxWidth: 240 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${form.color}22`, color: form.color, display: 'grid', placeItems: 'center', marginBottom: 12 }}>{Icons[form.icon]}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{form.label || 'Nome do atalho'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{form.url || 'url.interno'}</div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, id: sc?.id, clicks: sc?.clicks ?? 0 })} disabled={!form.label || !form.url}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function ActivityChart({ data }) {
  const max = Math.max(...data);
  const W = 600, H = 180, padX = 20, padY = 20;
  const step = (W - padX * 2) / (data.length - 1);
  const pts = data.map((v, i) => [padX + i * step, H - padY - ((v / max) * (H - padY * 2))]);
  const path = pts.reduce((acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`), '');
  const area = path + ` L${pts[pts.length - 1][0]},${H - padY} L${pts[0][0]},${H - padY} Z`;
  const days = ['Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg', 'Ter'];
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(p => <line key={p} x1={padX} x2={W - padX} y1={padY + (H - padY * 2) * p} y2={padY + (H - padY * 2) * p} stroke="var(--border-subtle)" strokeDasharray="3 4" />)}
      <path d={area} fill="url(#areaG)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="var(--bg-surface)" stroke="var(--accent)" strokeWidth="2" />
          <text x={x} y={H + 14} fontSize="10" textAnchor="middle" fill="var(--text-muted)">{days[i]}</text>
        </g>
      ))}
    </svg>
  );
}
