import { useState, useEffect } from 'react';
import { useAuth } from './auth.jsx';
import { useData, toast } from './data.jsx';
import { api } from './api.js';
import { Icons, Avatar } from './components.jsx';

export default function Vault() {
  const { vaultCategories } = useData();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [revealed, setRevealed] = useState({});
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { items } = await api.vault.list({ ...(cat !== 'all' ? { categoryId: cat } : {}), ...(q ? { q } : {}) });
    setItems(items);
  };
  useEffect(() => { load(); }, [cat, q]);

  const copy = async (v, label) => {
    try { await navigator.clipboard.writeText(v); toast(`${label} copiado`, 'ok'); } catch { toast('Erro ao copiar', 'err'); }
  };

  const reveal = async (id) => {
    if (revealed[id]) { setRevealed(r => ({ ...r, [id]: null })); return; }
    try {
      const { password } = await api.vault.reveal(id);
      setRevealed(r => ({ ...r, [id]: password }));
    } catch (e) { toast(e.message, 'err'); }
  };

  const save = async (data) => {
    try {
      if (data.id) await api.vault.update(data.id, data);
      else await api.vault.create(data);
      toast(data.id ? 'Credencial atualizada' : 'Credencial adicionada', 'ok');
      setEditing(null);
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const del = async (id) => {
    if (!confirm('Remover essa credencial?')) return;
    try { await api.vault.delete(id); toast('Removida', 'err'); load(); }
    catch (e) { toast(e.message, 'err'); }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>🔒 Acesso restrito</div>
          <h1 className="page-title">Cofre de acessos</h1>
          <p className="page-subtitle">Logins criptografados com AES-256. Visível só para membros autorizados.</p>
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
            {vaultCategories.map(c => (
              <div key={c.id} onClick={() => setCat(c.id)} style={catBtn(cat === c.id)}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `${c.color}22`, color: c.color, display: 'grid', placeItems: 'center', fontSize: 10 }}>●</div>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c._count?.items ?? 0}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Segurança</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {['Cifra AES-256-GCM', 'Logs de auditoria', 'Acesso por JWT'].map(item => (
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
          </div>

          <div className="card">
            {items.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma credencial ainda. Clique em "Nova credencial".</div>}
            {items.length > 0 && (
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
                  {items.map(item => {
                    const pw = revealed[item.id];
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${item.category?.color}22`, color: item.category?.color, display: 'grid', placeItems: 'center' }}>●</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.url}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{item.username || '—'}</span>
                            {item.username && <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => copy(item.username, 'Usuário')}>{Icons.copy}</button>}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{pw || (item.hasPassword ? '••••••••••••' : '—')}</span>
                            {item.hasPassword && (
                              <>
                                <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => reveal(item.id)}>{pw ? Icons.eyeOff : Icons.eye}</button>
                                <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={async () => {
                                  try { const { password } = await api.vault.reveal(item.id); copy(password, 'Senha'); } catch (e) { toast(e.message, 'err'); }
                                }}>{Icons.copy}</button>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(item.tags || []).map(t => <span key={t} className="badge badge-muted">#{t}</span>)}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                            <Avatar user={item.updatedBy} size={22} />
                            <div>
                              <div style={{ color: 'var(--text-secondary)' }}>{item.updatedBy?.name?.split(' ')[0]}</div>
                              <div style={{ fontSize: 11 }}>{timeAgo(item.updatedAt)}</div>
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
            )}
          </div>
        </div>
      </div>

      {editing !== null && <VaultModal item={editing.id ? editing : null} categories={vaultCategories} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff/3600)} h`;
  if (diff < 604800) return `há ${Math.floor(diff/86400)} d`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

const catBtn = (active) => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
  color: active ? 'var(--accent)' : 'var(--text-secondary)',
  background: active ? 'var(--bg-active)' : 'transparent',
  fontWeight: active ? 600 : 400, fontSize: 14, marginBottom: 2,
});
const thStyle = { padding: '12px 16px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 };
const tdStyle = { padding: '12px 16px', verticalAlign: 'middle' };

function VaultModal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item || { name: '', url: '', username: '', password: '', tags: [], categoryId: categories[0]?.id || '' });
  const [tagInput, setTagInput] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>{item ? 'Editar credencial' : 'Nova credencial'}</h3><button className="icon-btn" onClick={onClose}>{Icons.close}</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="field-label">Nome</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="field-label">URL / Host</label>
              <input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /></div>
            <div><label className="field-label">Categoria</label>
              <select className="input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="field-label">Usuário</label>
              <input className="input" value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
            <div><label className="field-label">Senha {item && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(deixe vazio pra manter)</span>}</label>
              <input className="input" type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          </div>
          <div><label className="field-label">Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {(form.tags || []).map(t => (
                <span key={t} className="badge badge-muted" style={{ cursor: 'pointer' }} onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })}>
                  #{t} {Icons.close}
                </span>
              ))}
            </div>
            <input className="input" placeholder="Pressione Enter pra adicionar" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] }); setTagInput(''); e.preventDefault(); } }} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, id: item?.id })} disabled={!form.name || !form.url}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
