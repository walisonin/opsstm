import { useState } from 'react';
import { USERS, FORUM_CATEGORIES, TOPICS, POSTS_BY_TOPIC, userById, toast } from './data.jsx';
import { Icons, Avatar, Ladrilho } from './components.jsx';

export default function Forum({ style, setUserModal }) {
  const [view, setView] = useState('index');
  const [catId, setCatId] = useState(null);
  const [topicId, setTopicId] = useState(null);

  const openCategory = (id) => { setCatId(id); setView('category'); };
  const openTopic = (id) => { setTopicId(id); setView('topic'); };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setView('index')}>Fórum</span>
            {view === 'category' && <><span>/</span><span>{FORUM_CATEGORIES.find(c => c.id === catId)?.name}</span></>}
            {view === 'topic' && <><span>/</span><span>{FORUM_CATEGORIES.find(c => c.id === TOPICS.find(t => t.id === topicId)?.categoryId)?.name}</span></>}
          </div>
          <h1 className="page-title">
            {view === 'index' ? 'Fórum' : view === 'category' ? FORUM_CATEGORIES.find(c => c.id === catId)?.name : 'Discussão'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary">{Icons.filter} Filtrar</button>
          <button className="btn btn-primary" onClick={() => toast('Novo tópico — em breve', 'info')}>{Icons.plus} Novo tópico</button>
        </div>
      </div>

      {view === 'index' && <ForumIndex style={style} onOpenCategory={openCategory} onOpenTopic={openTopic} />}
      {view === 'category' && <CategoryView catId={catId} style={style} onOpenTopic={openTopic} onBack={() => setView('index')} setUserModal={setUserModal} />}
      {view === 'topic' && <TopicView topicId={topicId} onBack={() => setView(catId ? 'category' : 'index')} setUserModal={setUserModal} />}
    </div>
  );
}

function ForumIndex({ style, onOpenCategory, onOpenTopic }) {
  const hotTopics = TOPICS.filter(t => t.hot).slice(0, 4);
  if (style === 'classic') return (
    <div className="card">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: 'var(--bg-elev-1)', textAlign: 'left' }}>
            <th style={{ padding: '12px 20px', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Categoria</th>
            <th style={{ padding: '12px', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', width: 90 }}>Tópicos</th>
            <th style={{ padding: '12px', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', width: 90 }}>Posts</th>
            <th style={{ padding: '12px 20px', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, width: 260 }}>Último post</th>
          </tr>
        </thead>
        <tbody>
          {FORUM_CATEGORIES.map(c => {
            const last = TOPICS.find(t => t.id === c.lastTopicId);
            const lastUser = last && userById(last.last.by);
            return (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 20px', cursor: 'pointer' }} onClick={() => onOpenCategory(c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.color}22`, color: c.color, display: 'grid', placeItems: 'center' }}>{Icons[c.icon] || Icons.forum}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.desc}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{c.topics}</td>
                <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{c.posts.toLocaleString('pt-BR')}</td>
                <td style={{ padding: '12px 20px' }}>
                  {last && lastUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={lastUser} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => onOpenTopic(last.id)} className="truncate">{last.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lastUser.name.split(' ')[0]} · {last.last.when}</div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>🔥 Em alta agora</div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          {hotTopics.map(t => {
            const author = userById(t.author);
            return (
              <div key={t.id} onClick={() => onOpenTopic(t.id)} className="card" style={{ padding: 16, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="badge badge-orange">{Icons.fire} Quente</span>
                  <span className="badge badge-muted">{FORUM_CATEGORIES.find(c => c.id === t.categoryId)?.name}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Avatar user={author} size={20} />
                  <span>{author.name.split(' ')[0]}</span>
                  <span>·</span>
                  <span>{t.replies} respostas</span>
                  <span>·</span>
                  <span>{t.views} views</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 12 }}>Todas as categorias</div>
      <div className="grid grid-2" style={{ gap: 14 }}>
        {FORUM_CATEGORIES.map(c => (
          <div key={c.id} className="card" onClick={() => onOpenCategory(c.id)} style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}22`, color: c.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{Icons[c.icon] || Icons.forum}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{c.desc}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>{c.topics}</strong> tópicos</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>{c.posts.toLocaleString('pt-BR')}</strong> posts</span>
                </div>
              </div>
            </div>
            <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.06 }}>
              <Ladrilho color={c.color} size={100} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function CategoryView({ catId, style, onOpenTopic, onBack, setUserModal }) {
  const cat = FORUM_CATEGORIES.find(c => c.id === catId);
  const topics = TOPICS.filter(t => t.categoryId === catId);
  const [sort, setSort] = useState('recent');

  return (
    <>
      <div className="card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: `${cat.color}22`, color: cat.color, display: 'grid', placeItems: 'center' }}>{Icons[cat.icon] || Icons.forum}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{cat.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.desc} · {cat.topics} tópicos · {cat.posts.toLocaleString('pt-BR')} posts</div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          {['recent', 'hot', 'views'].map(s => (
            <button key={s} onClick={() => setSort(s)} className="btn btn-sm"
              style={{ background: sort === s ? 'var(--accent)' : 'transparent', color: sort === s ? 'var(--accent-ink)' : 'var(--text-secondary)' }}>
              {s === 'recent' ? 'Recentes' : s === 'hot' ? 'Populares' : 'Mais vistos'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {topics.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum tópico ainda. Seja o primeiro!</div>}
        {topics.map((t, i) => {
          const a = userById(t.author);
          const l = userById(t.last.by);
          return (
            <div key={t.id} onClick={() => onOpenTopic(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < topics.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div onClick={e => { e.stopPropagation(); setUserModal(a); }}>
                <Avatar user={a} size={40} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {t.pinned && <span style={{ color: 'var(--accent)' }}>{Icons.pin}</span>}
                  {t.locked && <span style={{ color: 'var(--text-muted)' }}>{Icons.lock}</span>}
                  {t.hot && <span className="badge badge-orange">{Icons.fire} quente</span>}
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{t.title}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>por <strong style={{ color: 'var(--text-secondary)' }}>{a.name.split(' ')[0]}</strong></span>
                  {t.tags.map(tag => <span key={tag} style={{ padding: '1px 7px', borderRadius: 4, background: 'var(--bg-elev-1)', fontSize: 11 }}>#{tag}</span>)}
                </div>
              </div>
              <div style={{ textAlign: 'center', width: 70 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{t.replies}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Respostas</div>
              </div>
              <div style={{ textAlign: 'center', width: 70 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{t.views}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Views</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180, minWidth: 0 }}>
                <Avatar user={l} size={30} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{l.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.last.when}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TopicView({ topicId, onBack, setUserModal }) {
  const topic = TOPICS.find(t => t.id === topicId);
  const author = userById(topic.author);
  let posts = POSTS_BY_TOPIC[topicId];
  if (!posts) {
    posts = [
      { id: 'gp1', author: topic.author, when: '2 dias atrás', body: 'Abrindo o tópico pra discutirmos **' + topic.title + '**. O que vocês acham?', reactions: { '👍': 4 } },
      { id: 'gp2', author: 'u2', when: '1 dia atrás', body: 'Acho importante, sim. Vou puxar a discussão com o pessoal da área e trago dados concretos.', reactions: { '👍': 2 } },
      { id: 'gp3', author: 'u3', when: 'há 5h', body: 'Concordo em gênero, número e grau. Só acrescento que precisamos olhar o impacto nas lojas menores também.' },
    ];
  }
  const [reply, setReply] = useState('');

  return (
    <>
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 10 }}>
          {topic.pinned && <span className="badge badge-accent">{Icons.pin} Fixado</span>}
          {topic.locked && <span className="badge badge-muted">{Icons.lock} Fechado</span>}
          {topic.hot && <span className="badge badge-orange">{Icons.fire} Quente</span>}
          {topic.tags.map(t => <span key={t} className="badge badge-muted">#{t}</span>)}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 10px' }}>{topic.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          <div onClick={() => setUserModal(author)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Avatar user={author} size={24} />
            <span style={{ color: 'var(--text-secondary)' }}>{author.name}</span>
          </div>
          <span>·</span>
          <span>{topic.replies} respostas</span>
          <span>·</span>
          <span>{topic.views} visualizações</span>
        </div>
      </div>

      {posts.map((p, i) => <Post key={p.id} post={p} idx={i + 1} setUserModal={setUserModal} />)}

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Avatar user={USERS[0]} size={40} />
          <div style={{ flex: 1 }}>
            <textarea className="textarea" rows={4} placeholder="Escreva uma resposta..." value={reply} onChange={e => setReply(e.target.value)} style={{ width: '100%', resize: 'vertical', padding: 12, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6, color: 'var(--text-muted)' }}>
                <button className="icon-btn">B</button>
                <button className="icon-btn" style={{ fontStyle: 'italic' }}>I</button>
                <button className="icon-btn">{Icons.attach}</button>
                <button className="icon-btn">{Icons.emoji}</button>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm">Preview</button>
                <button className="btn btn-primary btn-sm" onClick={() => { if (reply.trim()) { toast('Resposta publicada', 'ok'); setReply(''); } }}>Responder</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Post({ post, idx, setUserModal }) {
  const u = userById(post.author);
  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ background: 'var(--bg-elev-1)', padding: 18, textAlign: 'center', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => setUserModal(u)}>
          <Avatar user={u} size={64} />
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, color: u.color }}>{u.name}</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{u.role}</div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
          <span className="badge badge-accent">{u.title || 'Membro'}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
          <div>{u.posts} posts</div>
          <div>{u.reputation.toLocaleString('pt-BR')} pts</div>
          <div>desde {u.joined}</div>
        </div>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 14 }}>
          <div>{post.when}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>#{idx}</span>
            <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.link}</button>
            <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.dots}</button>
          </div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{
          __html: post.body.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/@(\w+)/g, '<span style="color: var(--accent); font-weight: 600;">@$1</span>')
        }} />
        {post.signature && (
          <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px dashed var(--border-subtle)', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>— {post.signature}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
          {post.reactions && Object.entries(post.reactions).map(([e, n]) => (
            <button key={e} style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '3px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span>{e}</span><span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{n}</span>
            </button>
          ))}
          <button style={{ background: 'transparent', border: '1px dashed var(--border-default)', borderRadius: 999, padding: '3px 10px', fontSize: 12, color: 'var(--text-muted)' }}>+</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm">Citar</button>
            <button className="btn btn-ghost btn-sm">Responder</button>
          </div>
        </div>
      </div>
    </div>
  );
}
