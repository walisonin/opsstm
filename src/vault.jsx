import { useState, useMemo, useEffect } from 'react';
import { VAULT_CATEGORIES, VAULT_ITEMS, userById, toast } from './data.jsx';
import { Icons, Avatar } from './components.jsx';

export default function Vault({ setUserModal }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stm_vault')) || VAULT_ITEMS; }
    catch { return VAULT_ITEMS; }
  });
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [reveal, setReveal] = useState({});
  const [editing, setEditing] = useState(null);

  useEffect(() => { localStorage.setItem('stm_vault', JSON.stringify(items)); }, [items]);

  const filtered = useMemo(() => items.filter(i =>
    (cat === 'all' || i.categoryId === cat) &&
    (!q || (i.name + ' ' + i.url + ' ' + i.tags.join(' ')).toLowerCase().includes(q.toLowerCase()))
  ), [items, cat, q]);

  const copy = (v, label) => { navigator.clipboard?.writeText(v); toast(`${label} copiado para a área de transferência`, 'ok'); };
  const save = (item) => {
    if (item.id) setItems(s => s.map(x => x.id === item.id ? item : x));
    else setItems(s => [{ ...item, id: 'v' + Date.now(), updatedBy: 'u1', updatedAt: 'agora' }, ...s]);
    toast(item.id ? 'Credencial atualizada' : 'Credencial adicionada', 'ok');
    setEditing(null);
  };
  const del = (id) => { setItems(s => s.filter(x => x.id !== id)); toast('Credencial removida', 'err'); };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>🔒 Acesso restrito</div>
          <h1 className="page-title">Cofre de acessos</h1>
          <p className="page-subtitle">Logins da VPS, bancos, SaaS e fornecedores. Tudo criptografado. Visível só para o time autorizado.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>{Icons.plus} Nova credencial</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        <aside>
          <div className="card" style={{ padding: 10 }}>
            <div onClick={() => setCat('all')} style={catBtn(cat === 'all')}>
              <span style={{ color: 'var(--text-muted)' }}>{Icons.vault}</span>
              <span style={{ flex: 1 }}>Todas</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{items.length}</span>
            </div>
            {VAULT_CATEGORIES.map(c => {
              const n = items.filter(i => i.categoryId === c.id).length;
              return (
                <div key={c.id} onClick={() => setCat(c.id)} style={catBtn(cat === c.id)}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: `${c.color}22`, color: c.color, display: 'grid', placeItems: 'center', fontSize: 10 }}>●</div>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n}</span>
                </div>
              );
            })}
          </div>
          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Segurança</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {['2FA ativo', 'Logs de auditoria', 'Cifra AES-256'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, background: 'var(--status-online)', borderRadius: '50%' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="card" style={{ marginBottom: 14, padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{Icons.search}</span>
            <input className="input" style={{ border: 0, padding: 6, background: 'transparent' }} value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome, url, tag..." />
            <button className="btn btn-ghost btn-sm">{Icons.filter} Filtros</button>
          </div>

          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>Usuário</th>
                  <th style={thStyle}>Senha</th>
                  <th style={thStyle}>Tags</th>
                  <th style={thStyle}>Atualizado</th>
                  <th style={{ ...thStyle, width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const c = VAULT_CATEGORIES.find(x => x.id === item.categoryId);
                  const by = userById(item.updatedBy);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${c.color}22`, color: c.color, display: 'grid', placeItems: 'center', fontSize: 11 }}>●</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.url}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{item.user}</span>
                          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => copy(item.user, 'Usuário')}>{Icons.copy}</button>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{reveal[item.id] ? 'S3nh4!mLh0r@d4' : '••••••••••••'}</span>
                          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setReveal(r => ({ ...r, [item.id]: !r[item.id] }))}>{reveal[item.id] ? Icons.eyeOff : Icons.eye}</button>
                          <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => copy('hidden', 'Senha')}>{Icons.copy}</button>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {item.tags.map(t => <span key={t} className="badge badge-muted">#{t}</span>)}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                          <Avatar user={by} size={22} />
                          <div>
                            <div style={{ color: 'var(--text-secondary)' }}>{by.name.split(' ')[0]}</div>
                            <div style={{ fontSize: 11 }}>{item.updatedAt}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setEditing(item)}>{Icons.edit}</button>
                          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => del(item.id)}>{Icons.trash}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editing !== null && <VaultModal item={editing.id ? editing : null} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

const catBtn = (active) => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
  color: active ? 'var(--accent)' : 'var(--text-secondary)', background: active ? 'var(--bg-active)' : 'transparent',
  fontWeight: active ? 600 : 400, fontSize: 14, marginBottom: 2,
});
const thStyle = { padding: '12px 16px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 };
const tdStyle = { padding: '12px 16px', verticalAlign: 'middle' };

function VaultModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item || { name: '', url: '', user: '', password: '', tags: [], categoryId: VAULT_CATEGORIES[0].id });
  const [tagInput, setTagInput] = useState('');
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{item ? 'Editar credencial' : 'Nova credencial'}</h3>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label">Nome</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="field-label">URL / Host</label>
              <input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Categoria</label>
              <select className="select" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                {VAULT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="field-label">Usuário</label>
              <input className="input" value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Senha</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {form.tags.map(t => (
                <span key={t} className="badge badge-muted" style={{ cursor: 'pointer' }} onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })}>
                  #{t} {Icons.close}
                </span>
              ))}
            </div>
            <input className="input" placeholder="Pressione Enter para adicionar" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setForm({ ...form, tags: [...form.tags, tagInput.trim()] }); setTagInput(''); e.preventDefault(); } }} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, id: item?.id, password: form.password || '••••••••••••' })} disabled={!form.name || !form.url}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
