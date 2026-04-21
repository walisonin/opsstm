import { useState } from 'react';
import { USERS, RANKING, userById, toast, ME } from './data.jsx';
import { Icons, Avatar, Ladrilho } from './components.jsx';

export function Ranking({ setUserModal }) {
  const [period, setPeriod] = useState('month');
  const podium = RANKING.slice(0, 3);
  const rest = RANKING.slice(3);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>🏆 Contribuições</div>
          <h1 className="page-title">Ranking do time</h1>
          <p className="page-subtitle">Quem mais contribuiu com o portal — posts, respostas úteis, avisos e ideias.</p>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          {[['week','Semana'],['month','Mês'],['year','Ano'],['all','Geral']].map(([k,l]) => (
            <button key={k} onClick={() => setPeriod(k)} className="btn btn-sm"
              style={{ background: period === k ? 'var(--accent)' : 'transparent', color: period === k ? 'var(--accent-ink)' : 'var(--text-secondary)' }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 16, alignItems: 'end', marginBottom: 28 }}>
        <Podium u={podium[1]} place={2} h={200} onClick={() => setUserModal(podium[1])} />
        <Podium u={podium[0]} place={1} h={240} onClick={() => setUserModal(podium[0])} />
        <Podium u={podium[2]} place={3} h={170} onClick={() => setUserModal(podium[2])} />
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 140px 80px', padding: '12px 20px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)' }}>
          <div>#</div><div>Membro</div><div>Posts</div><div>Reputação</div><div>Nível</div><div>Tendência</div>
        </div>
        {rest.map((u, i) => (
          <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 140px 80px', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-muted)' }}>{i + 4}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar user={u} size={36} showStatus />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.role}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{u.posts}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{u.reputation.toLocaleString('pt-BR')}</div>
            <div><ProgressBar value={(u.reputation / 7000) * 100} /></div>
            <div style={{ color: i % 3 === 0 ? '#6fd36b' : i % 3 === 1 ? 'var(--text-muted)' : '#e66265', fontSize: 12, fontWeight: 600 }}>
              {i % 3 === 0 ? '↑' : i % 3 === 1 ? '—' : '↓'} {i % 3 === 0 ? '+' + (i + 2) : i % 3 === 1 ? '0' : '-1'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Podium({ u, place, h, onClick }) {
  const cl = ['#eeb23e','#c4c8cf','#b8733a'][place - 1];
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
        <Avatar user={u} size={place === 1 ? 88 : 72} />
        <div style={{ position: 'absolute', top: -10, right: -10, width: 32, height: 32, borderRadius: '50%', background: cl, color: '#102d1c', fontFamily: 'var(--font-display)', fontSize: 14, display: 'grid', placeItems: 'center', fontWeight: 900, border: '3px solid var(--bg-base)' }}>{place}</div>
      </div>
      <div style={{ fontSize: place === 1 ? 18 : 15, fontWeight: 700, marginBottom: 2 }}>{u.name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{u.role}</div>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 14, borderTop: `3px solid ${cl}`, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: place === 1 ? 48 : 34, fontWeight: 800, color: cl, lineHeight: 1 }}>{u.reputation.toLocaleString('pt-BR')}</div>
        <div className="eyebrow" style={{ marginTop: 8 }}>Reputação</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>{u.posts} posts</div>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return <div style={{ height: 6, background: 'var(--bg-elev-1)', borderRadius: 999 }}>
    <div style={{ width: `${Math.min(100, value)}%`, height: '100%', background: 'var(--accent)', borderRadius: 999 }} /></div>;
}

export function Profile({ setUserModal }) {
  const u = ME;
  const badges = [
    { icon: '🌿', name: 'Pioneiro', desc: 'Um dos primeiros 10 no portal' },
    { icon: '🔥', name: 'Em alta', desc: '3 tópicos virais em um mês' },
    { icon: '💬', name: 'Conversador', desc: '1000+ mensagens no chat' },
    { icon: '⭐', name: 'Referência', desc: '50+ respostas marcadas como solução' },
  ];
  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="card" style={{ position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 150, background: `linear-gradient(135deg, ${u.color}, #174628)`, position: 'relative' }}>
          <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.18 }}><Ladrilho color="#fff" size={200} /></div>
          <div style={{ position: 'absolute', left: 180, top: 70, opacity: 0.12 }}><Ladrilho color="#9fb42c" size={80} /></div>
          <button className="btn btn-secondary btn-sm" style={{ position: 'absolute', top: 16, right: 16 }}>Editar capa</button>
        </div>
        <div style={{ padding: '0 28px 24px', display: 'flex', gap: 22, alignItems: 'flex-end', marginTop: -40 }}>
          <div style={{ border: '4px solid var(--bg-surface)', borderRadius: '50%' }}>
            <Avatar user={u} size={120} showStatus />
          </div>
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', margin: 0 }}>{u.name}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{u.role} · @{u.handle}</div>
          </div>
          <button className="btn btn-secondary">Editar perfil</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 22 }}>
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Sobre mim</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{u.bio}</p>
          </div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Estatísticas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Posts no fórum', u.posts], ['Reputação', u.reputation.toLocaleString('pt-BR')], ['Tópicos criados', 18], ['Soluções marcadas', 42], ['Membro desde', u.joined]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Conquistas</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {badges.map(b => (
                <div key={b.name} style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{b.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Minha assinatura</div>
            <div style={{ background: 'var(--bg-elev-1)', borderRadius: 8, padding: 14, fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--accent)' }}>
              "Rafael Moura — Head de Operações · St Marché. Quando em dúvida, olhe a gôndola."
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>{Icons.edit} Editar assinatura</button>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Atividade recente</h3>
              <button className="btn btn-ghost btn-sm">Ver tudo</button>
            </div>
            <div>
              {[
                { t: 'Respondeu em', d: 'VPS caiu ontem à noite — post-mortem', when: 'há 8h', icon: 'forum' },
                { t: 'Postou em', d: '#geral', when: 'há 1 dia', icon: 'chat' },
                { t: 'Criou o tópico', d: 'Nova rotina de recebimento nas lojas da zona sul', when: 'há 2 dias', icon: 'forum' },
                { t: 'Adicionou credencial', d: 'SAP Fornecedor', when: 'há 4 dias', icon: 'vault' },
                { t: 'Ganhou a conquista', d: 'Pioneiro 🌿', when: 'há 1 semana', icon: 'trophy' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elev-1)', color: 'var(--text-secondary)', display: 'grid', placeItems: 'center' }}>{Icons[a.icon]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>{a.t}</span> <strong>{a.d}</strong></div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Admin({ setUserModal }) {
  const [tab, setTab] = useState('users');
  const tabs = [['users','Usuários'],['roles','Perfis & Permissões'],['content','Moderação'],['logs','Logs']];
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>⚙️ Administração</div>
          <h1 className="page-title">Painel admin</h1>
          <p className="page-subtitle">Gestão de usuários, permissões, moderação e auditoria do portal.</p>
        </div>
        <button className="btn btn-primary" onClick={() => toast('Convite enviado', 'ok')}>{Icons.plus} Convidar usuário</button>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[[USERS.length,'Usuários totais','#9fb42c'],[USERS.filter(u=>u.status==='online').length,'Online agora','#1f6fb8'],['4','Aguardando aprovação','#ea431b'],['12','Ações admin hoje','#eeb23e']].map(([v,l,c]) => (
          <div key={l} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>{l}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
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
        {tab === 'roles' && <AdminRoles />}
        {tab === 'content' && <AdminContent />}
        {tab === 'logs' && <AdminLogs />}
      </div>
    </div>
  );
}

const thStyleA = { padding: '12px 20px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 };
const tdStyleA = { padding: '12px 20px', verticalAlign: 'middle' };

function AdminUsers({ setUserModal }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
          <th style={thStyleA}>Usuário</th>
          <th style={thStyleA}>Cargo</th>
          <th style={thStyleA}>Status</th>
          <th style={thStyleA}>Perfil</th>
          <th style={thStyleA}>Último acesso</th>
          <th style={{...thStyleA, width: 80}}></th>
        </tr>
      </thead>
      <tbody>
        {USERS.map(u => (
          <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <td style={tdStyleA}>
              <div onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Avatar user={u} size={30} showStatus />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{u.handle}</div>
                </div>
              </div>
            </td>
            <td style={tdStyleA}><span style={{ fontSize: 13 }}>{u.role}</span></td>
            <td style={tdStyleA}>
              <span className={`badge ${u.status === 'online' ? 'badge-green' : u.status === 'dnd' ? 'badge-red' : u.status === 'away' ? 'badge-orange' : 'badge-muted'}`}>
                {u.status === 'online' ? 'Online' : u.status === 'away' ? 'Ausente' : u.status === 'dnd' ? 'Ocupado' : 'Offline'}
              </span>
            </td>
            <td style={tdStyleA}><span className="badge badge-accent">{u.title || 'Membro'}</span></td>
            <td style={tdStyleA}><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.status === 'online' ? 'Agora' : 'há 2 dias'}</span></td>
            <td style={tdStyleA}>
              <div style={{ display: 'flex', gap: 2 }}>
                <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.edit}</button>
                <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.dots}</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AdminRoles() {
  const roles = [
    { name: 'Super Admin', desc: 'Acesso total', users: 2, perms: 'Todas' },
    { name: 'Admin', desc: 'Gestão do portal', users: 4, perms: 'Usuários, Conteúdo, Vault' },
    { name: 'Moderador', desc: 'Modera fórum e chat', users: 6, perms: 'Conteúdo, Warns' },
    { name: 'Membro', desc: 'Usuário padrão', users: 42, perms: 'Leitura, Post' },
  ];
  return (
    <div style={{ padding: 20, display: 'grid', gap: 12 }}>
      {roles.map(r => (
        <div key={r.name} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>{Icons.admin}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc} · {r.perms}</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}><strong>{r.users}</strong> usuários</div>
          <button className="btn btn-ghost btn-sm">{Icons.edit}</button>
        </div>
      ))}
    </div>
  );
}

function AdminContent() {
  const reports = [
    { type: 'Tópico reportado', t: 'Discussão sobre fornecedor', by: 'u6', reason: 'Linguagem inadequada', when: 'há 2h' },
    { type: 'Mensagem reportada', t: '#random — @fnunes', by: 'u8', reason: 'Spam', when: 'há 5h' },
    { type: 'Aguarda aprovação', t: 'Sugestão de novo fornecedor', by: 'u11', reason: 'Moderação pré-publicação', when: 'há 1 dia' },
  ];
  return (
    <div style={{ padding: 20, display: 'grid', gap: 10 }}>
      {reports.map((r, i) => {
        const u = userById(r.by);
        return (
          <div key={i} style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="badge badge-orange">{r.type}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.t}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reportado por {u.name.split(' ')[0]} — {r.reason} · {r.when}</div>
            </div>
            <button className="btn btn-ghost btn-sm">Ignorar</button>
            <button className="btn btn-danger btn-sm">Ação</button>
          </div>
        );
      })}
    </div>
  );
}

function AdminLogs() {
  const logs = [
    { when: '15:42', who: 'u2', what: 'alterou permissão', of: 'Camila Tanaka → Moderador' },
    { when: '14:18', who: 'u1', what: 'convidou', of: 'gabriel.souza@stmarche.com.br' },
    { when: '12:05', who: 'u5', what: 'criou credencial', of: 'VPS Staging-2' },
    { when: '10:30', who: 'u2', what: 'fechou tópico', of: 'Política de uso do portal' },
    { when: '09:14', who: 'u1', what: 'atualizou direcionamento', of: 'Painel de Vendas' },
  ];
  return (
    <div style={{ padding: 20 }}>
      {logs.map((l, i) => {
        const u = userById(l.who);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < logs.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', width: 64 }}>{l.when}</span>
            <Avatar user={u} size={26} />
            <div style={{ fontSize: 13 }}><strong>{u.name.split(' ')[0]}</strong> <span style={{ color: 'var(--text-muted)' }}>{l.what}</span> <span>{l.of}</span></div>
          </div>
        );
      })}
    </div>
  );
}
