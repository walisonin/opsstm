import { useState, useEffect, useRef } from 'react';
import { useAuth } from './auth.jsx';
import { useData, toast } from './data.jsx';
import { api } from './api.js';
import { Icons, Avatar, Ladrilho } from './components.jsx';

export function Ranking({ setUserModal }) {
  const { users } = useData();
  const ranking = [...users].sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>🏆 Contribuições</div>
          <h1 className="page-title">Ranking do time</h1>
          <p className="page-subtitle">Posts e respostas geram reputação.</p>
        </div>
      </div>

      {podium.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 16, alignItems: 'end', marginBottom: 28 }}>
          <Podium u={podium[1]} place={2} h={200} onClick={() => setUserModal(podium[1])} />
          <Podium u={podium[0]} place={1} h={240} onClick={() => setUserModal(podium[0])} />
          <Podium u={podium[2]} place={3} h={170} onClick={() => setUserModal(podium[2])} />
        </div>
      )}

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px', padding: '12px 20px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)' }}>
          <div>#</div><div>Membro</div><div>Posts</div><div>Reputação</div>
        </div>
        {rest.map((u, i) => (
          <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-muted)' }}>{i + 4}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar user={u} size={36} showStatus />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.roleDesc || u.role}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.postCount || 0}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{(u.reputation || 0).toLocaleString('pt-BR')}</div>
          </div>
        ))}
        {rest.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Apenas {podium.length} membros no ranking.</div>}
      </div>
    </div>
  );
}

function Podium({ u, place, h, onClick }) {
  if (!u) return <div />;
  const cl = ['#eeb23e', '#c4c8cf', '#b8733a'][place - 1];
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
        <Avatar user={u} size={place === 1 ? 88 : 72} />
        <div style={{ position: 'absolute', top: -10, right: -10, width: 32, height: 32, borderRadius: '50%', background: cl, color: '#102d1c', fontFamily: 'var(--font-display)', fontSize: 14, display: 'grid', placeItems: 'center', fontWeight: 900, border: '3px solid var(--bg-base)' }}>{place}</div>
      </div>
      <div style={{ fontSize: place === 1 ? 18 : 15, fontWeight: 700, marginBottom: 2 }}>{u.name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{u.roleDesc || u.role}</div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, borderTop: `3px solid ${cl}`, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 18 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: place === 1 ? 48 : 34, fontWeight: 800, color: cl, lineHeight: 1 }}>{(u.reputation || 0).toLocaleString('pt-BR')}</div>
        <div className="eyebrow" style={{ marginTop: 8 }}>Reputação</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>{u.postCount || 0} posts</div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, updateMe, setUser } = useAuth();
  const [form, setForm] = useState({ bio: user.bio || '', signature: user.signature || '', color: user.color, title: user.title || '', status: user.status });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState({ avatar: false, cover: false });
  const avatarInput = useRef(null);
  const coverInput = useRef(null);

  const save = async () => {
    try { await updateMe(form); toast('Perfil atualizado', 'ok'); }
    catch (e) { toast(e.message, 'err'); }
  };

  const changePw = async () => {
    if (pw.next !== pw.confirm) return toast('Senhas não conferem', 'err');
    if (pw.next.length < 8) return toast('Senha precisa ter 8+ caracteres', 'err');
    try {
      await api.auth.changePassword(pw.current, pw.next);
      toast('Senha atualizada', 'ok');
      setPw({ current: '', next: '', confirm: '' });
    } catch (e) { toast(e.message, 'err'); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast('Imagem maior que 5MB', 'err');
    setBusy(b => ({ ...b, avatar: true }));
    try {
      const { user: updated } = await api.auth.uploadAvatar(file);
      setUser(updated);
      toast('Avatar atualizado 🌿', 'ok');
    } catch (err) { toast(err.message || 'Erro no upload', 'err'); }
    finally { setBusy(b => ({ ...b, avatar: false })); }
  };

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast('Imagem maior que 5MB', 'err');
    setBusy(b => ({ ...b, cover: true }));
    try {
      const { user: updated } = await api.auth.uploadCover(file);
      setUser(updated);
      toast('Capa atualizada', 'ok');
    } catch (err) { toast(err.message || 'Erro no upload', 'err'); }
    finally { setBusy(b => ({ ...b, cover: false })); }
  };

  const removeAvatar = async () => {
    if (!confirm('Remover avatar?')) return;
    try { const { user: u } = await api.auth.removeAvatar(); setUser(u); toast('Avatar removido', 'ok'); }
    catch (e) { toast(e.message, 'err'); }
  };

  const removeCover = async () => {
    if (!confirm('Remover capa?')) return;
    try { const { user: u } = await api.auth.removeCover(); setUser(u); toast('Capa removida', 'ok'); }
    catch (e) { toast(e.message, 'err'); }
  };

  const colors = ['#9fb42c', '#7e3f62', '#1f6fb8', '#ea431b', '#eeb23e', '#1f8a8a', '#f2801f', '#c72124', '#947034', '#b4c93d'];

  const coverBg = user.coverImage
    ? `url("${user.coverImage}") center/cover no-repeat`
    : `linear-gradient(135deg, ${form.color}, #174628)`;

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadAvatar} style={{ display: 'none' }} />
      <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={uploadCover} style={{ display: 'none' }} />

      <div className="card" style={{ position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 220, background: coverBg, position: 'relative' }}>
          {!user.coverImage && <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.18 }}><Ladrilho color="#fff" size={200} /></div>}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
            {user.coverImage && (
              <button className="btn btn-sm" style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(6px)' }} onClick={removeCover}>
                {Icons.trash} Remover
              </button>
            )}
            <button className="btn btn-sm" disabled={busy.cover}
              style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--brand-green-800)' }}
              onClick={() => coverInput.current?.click()}>
              {Icons.upload} {busy.cover ? 'Enviando...' : (user.coverImage ? 'Trocar capa' : 'Adicionar capa')}
            </button>
          </div>
        </div>

        <div style={{ padding: '0 28px 24px', display: 'flex', gap: 22 }}>
          <div style={{ marginTop: -60, position: 'relative', border: '4px solid var(--bg-surface)', borderRadius: '50%', cursor: 'pointer', flexShrink: 0, background: 'var(--bg-surface)' }}
            onClick={() => avatarInput.current?.click()} title="Clique para trocar">
            <Avatar user={{ ...user, ...form }} size={120} showStatus />
            <div className="avatar-overlay" style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4,
              opacity: busy.avatar ? 1 : 0, transition: 'opacity 160ms', pointerEvents: 'none',
            }}>
              {busy.avatar ? (
                <span style={{ fontSize: 11, fontWeight: 600 }}>Enviando...</span>
              ) : (
                <>{Icons.upload}<span style={{ fontSize: 11, fontWeight: 600 }}>Trocar</span></>
              )}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 18 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', margin: 0 }}>{user.name}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{user.email} · @{user.handle}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => avatarInput.current?.click()} disabled={busy.avatar}>
                {Icons.upload} Trocar foto
              </button>
              {user.avatar && <button className="btn btn-ghost btn-sm" onClick={removeAvatar}>{Icons.trash} Remover</button>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>Perfil</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="field-label">Status</label>
              <div className="seg">
                {[['online','🟢 Online'],['away','🟡 Ausente'],['dnd','🔴 Ocupado'],['offline','⚫ Offline']].map(([k,l]) => (
                  <button key={k} className={form.status === k ? 'on' : ''} onClick={() => setForm({ ...form, status: k })}>{l}</button>
                ))}
              </div></div>
            <div><label className="field-label">Cor</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {colors.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '2px solid var(--text-primary)' : '2px solid transparent' }} />
                ))}
              </div></div>
            <div><label className="field-label">Título</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Líder, Admin" /></div>
            <div><label className="field-label">Bio</label>
              <textarea className="input" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} maxLength={500} /></div>
            <div><label className="field-label">Assinatura do fórum</label>
              <textarea className="input" rows={2} value={form.signature} onChange={e => setForm({ ...form, signature: e.target.value })} maxLength={200} /></div>
            <button className="btn btn-primary" onClick={save}>Salvar perfil</button>
          </div>
        </div>

        <div className="card" style={{ padding: 24, height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 16px' }}>Trocar senha</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="field-label">Senha atual</label>
              <input className="input" type="password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} /></div>
            <div><label className="field-label">Nova senha</label>
              <input className="input" type="password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></div>
            <div><label className="field-label">Confirmar</label>
              <input className="input" type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></div>
            <button className="btn btn-primary" onClick={changePw} disabled={!pw.current || !pw.next}>Atualizar senha</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Admin({ setUserModal }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('users');
  const [showInvite, setShowInvite] = useState(false);

  if (!['super_admin', 'admin'].includes(user.role)) {
    return <div className="page"><div className="card" style={{ padding: 40, textAlign: 'center' }}>Sem permissão.</div></div>;
  }

  const tabs = [['users','Usuários'], ['logs','Logs']];
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>⚙️ Administração</div>
          <h1 className="page-title">Painel admin</h1>
          <p className="page-subtitle">Gestão de usuários e auditoria.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>{Icons.plus} Novo usuário</button>
      </div>

      <div className="card">
        <div style={{ padding: '4px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex' }}>
          {tabs.map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '14px 18px', fontSize: 13, fontWeight: tab === k ? 700 : 500,
              color: tab === k ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: tab === k ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
            }}>{l}</button>
          ))}
        </div>
        {tab === 'users' && <AdminUsers setUserModal={setUserModal} />}
        {tab === 'logs' && <AdminLogs />}
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function AdminUsers({ setUserModal }) {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const { user: me } = useAuth();

  const load = () => api.admin.users().then(d => setUsers(d.users)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);

  const resetPw = async (u) => {
    if (!confirm(`Gerar nova senha para ${u.name}?`)) return;
    try {
      const { tempPassword } = await api.admin.resetPassword(u.id);
      alert(`Nova senha de ${u.name}:\n\n${tempPassword}\n\nCompartilhe com segurança. Ele/ela vai trocar no próximo login.`);
    } catch (e) { toast(e.message, 'err'); }
  };

  const disable = async (u) => {
    if (!confirm(`Desativar ${u.name}? Ele(a) não conseguirá mais logar.`)) return;
    try { await api.admin.deleteUser(u.id); toast('Usuário desativado', 'err'); load(); }
    catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
            <th style={thA}>Usuário</th><th style={thA}>Cargo</th><th style={thA}>Perfil</th>
            <th style={thA}>Status</th><th style={thA}>Último acesso</th><th style={thA}></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: u.active ? 1 : 0.5 }}>
              <td style={tdA}>
                <div onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <Avatar user={u} size={30} showStatus />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>
              </td>
              <td style={tdA}><span style={{ fontSize: 13 }}>{u.roleDesc || '—'}</span></td>
              <td style={tdA}><RoleBadge role={u.role} /></td>
              <td style={tdA}><StatusBadge status={u.status} active={u.active} /></td>
              <td style={tdA}><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.lastSeen ? new Date(u.lastSeen).toLocaleString('pt-BR') : '—'}</span></td>
              <td style={tdA}>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(u)}>Editar</button>
                  {u.id !== me.id && u.active && <button className="btn btn-ghost btn-sm" onClick={() => resetPw(u)}>Reset senha</button>}
                  {u.id !== me.id && u.active && u.role !== 'super_admin' && <button className="btn btn-ghost btn-sm" onClick={() => disable(u)}>Desativar</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <EditUserModal u={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </>
  );
}

function RoleBadge({ role }) {
  const map = {
    super_admin: ['Super Admin', 'badge-accent'],
    admin: ['Admin', 'badge-blue'],
    moderator: ['Moderador', 'badge-orange'],
    member: ['Membro', 'badge-muted'],
  };
  const [label, cls] = map[role] || map.member;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function StatusBadge({ status, active }) {
  if (!active) return <span className="badge badge-muted">Desativado</span>;
  const map = { online: ['Online', 'badge-green'], away: ['Ausente', 'badge-orange'], dnd: ['Ocupado', 'badge-red'], offline: ['Offline', 'badge-muted'] };
  const [label, cls] = map[status] || map.offline;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function InviteModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', roleDesc: '', role: 'member', title: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const r = await api.admin.createUser(form);
      setResult(r);
    } catch (e) { toast(e.message, 'err'); setLoading(false); }
  };

  if (result) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-head"><h3>✅ Usuário criado</h3><button className="icon-btn" onClick={onClose}>{Icons.close}</button></div>
          <div className="modal-body">
            <p><strong>{result.user.name}</strong> ({result.user.email}) foi criado.</p>
            <p>Compartilhe a senha abaixo com ele(a) de forma segura:</p>
            <div style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 16, fontFamily: 'var(--font-mono)', fontSize: 18, textAlign: 'center', margin: '16px 0', letterSpacing: 1 }}>
              {result.tempPassword}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>⚠ Essa senha só aparece aqui uma vez. O usuário será obrigado a trocá-la no primeiro login.</p>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(result.tempPassword); toast('Senha copiada', 'ok'); }}>Copiar senha</button>
            <button className="btn btn-primary" onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>Novo usuário</h3><button className="icon-btn" onClick={onClose}>{Icons.close}</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="field-label">Nome completo</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus /></div>
          <div><label className="field-label">E-mail</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="field-label">Cargo/Área</label>
              <input className="input" value={form.roleDesc} onChange={e => setForm({ ...form, roleDesc: e.target.value })} placeholder="Ex: Gerente de Loja" /></div>
            <div><label className="field-label">Perfil</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="member">Membro</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Admin</option>
              </select></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={loading || !form.name || !form.email}>
            {loading ? 'Criando...' : 'Criar usuário'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ u, onClose, onSaved }) {
  const { user: me } = useAuth();
  const [form, setForm] = useState({ name: u.name, email: u.email, role: u.role, roleDesc: u.roleDesc || '', title: u.title || '', active: u.active });

  const save = async () => {
    try { await api.admin.updateUser(u.id, form); toast('Usuário atualizado', 'ok'); onSaved(); }
    catch (e) { toast(e.message, 'err'); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>Editar {u.name}</h3><button className="icon-btn" onClick={onClose}>{Icons.close}</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="field-label">Nome</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="field-label">E-mail</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="field-label">Cargo/Área</label>
              <input className="input" value={form.roleDesc} onChange={e => setForm({ ...form, roleDesc: e.target.value })} /></div>
            <div><label className="field-label">Perfil</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="member">Membro</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Admin</option>
                {me.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
              </select></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" className="chk" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            <span>Ativo (pode logar)</span>
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.admin.auditLogs().then(d => setLogs(d.logs)).catch(e => toast(e.message, 'err')); }, []);
  return (
    <div style={{ padding: 20 }}>
      {logs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>Nenhum log ainda.</div>}
      {logs.map((l, i) => (
        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < logs.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', width: 140 }}>{new Date(l.createdAt).toLocaleString('pt-BR')}</span>
          <Avatar user={l.user} size={26} />
          <div style={{ fontSize: 13, flex: 1 }}>
            <strong>{l.user.name.split(' ')[0]}</strong>
            <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>{l.action}</span>
            {l.meta && <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{JSON.stringify(l.meta).slice(0, 100)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

const thA = { padding: '12px 20px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 };
const tdA = { padding: '12px 20px', verticalAlign: 'middle' };
