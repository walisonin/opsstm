import { useState, useEffect } from 'react';
import { useAuth } from './auth.jsx';
import { useData, toast } from './data.jsx';
import { api } from './api.js';
import { Icons, Avatar, Ladrilho } from './components.jsx';

export default function Forum({ style, setUserModal }) {
  const { forumCategories } = useData();
  const [view, setView] = useState('index');
  const [catId, setCatId] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [showNewTopic, setShowNewTopic] = useState(false);

  const openCategory = (id) => { setCatId(id); setView('category'); };
  const openTopic = (id) => { setTopicId(id); setView('topic'); };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setView('index')}>Fórum</span>
            {view === 'category' && <><span>/</span><span>{forumCategories.find(c => c.id === catId)?.name}</span></>}
            {view === 'topic' && <><span>/</span><span>Tópico</span></>}
          </div>
          <h1 className="page-title">{view === 'index' ? 'Fórum' : view === 'category' ? forumCategories.find(c => c.id === catId)?.name : 'Discussão'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowNewTopic(true)}>{Icons.plus} Novo tópico</button>
        </div>
      </div>

      {view === 'index' && <ForumIndex style={style} categories={forumCategories} onOpenCategory={openCategory} onOpenTopic={openTopic} />}
      {view === 'category' && <CategoryView catId={catId} onOpenTopic={openTopic} setUserModal={setUserModal} />}
      {view === 'topic' && <TopicView topicId={topicId} setUserModal={setUserModal} onBack={() => setView(catId ? 'category' : 'index')} />}

      {showNewTopic && <NewTopicModal categories={forumCategories} defaultCategoryId={catId}
        onClose={() => setShowNewTopic(false)}
        onCreated={(t) => { setShowNewTopic(false); setCatId(t.categoryId); setTopicId(t.id); setView('topic'); }} />}
    </div>
  );
}

function ForumIndex({ style, categories, onOpenCategory, onOpenTopic }) {
  const [hot, setHot] = useState([]);
  useEffect(() => { api.forum.topics({ hot: true, limit: 4 }).then(d => setHot(d.topics)).catch(() => {}); }, []);

  if (style === 'classic') return (
    <div className="card">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: 'var(--bg-elev-1)', textAlign: 'left' }}>
            <th style={{ padding: '12px 20px' }}>Categoria</th>
            <th style={{ padding: '12px', textAlign: 'center', width: 90 }}>Tópicos</th>
            <th style={{ padding: '12px', textAlign: 'center', width: 90 }}>Posts</th>
            <th style={{ padding: '12px 20px', width: 260 }}>Último post</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => {
            const last = c.lastTopic;
            const lastPost = last?.posts?.[0];
            return (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '14px 20px', cursor: 'pointer' }} onClick={() => onOpenCategory(c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.color}22`, color: c.color, display: 'grid', placeItems: 'center' }}>{Icons[c.icon] || Icons.forum}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.description}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>{c.topics ?? 0}</td>
                <td style={{ textAlign: 'center' }}>{c.posts ?? 0}</td>
                <td style={{ padding: '12px 20px' }}>
                  {last && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={lastPost?.author || last.author} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => onOpenTopic(last.id)} className="truncate">{last.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(lastPost?.author || last.author).name.split(' ')[0]}</div>
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
      {hot.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>🔥 Em alta agora</div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            {hot.map(t => (
              <div key={t.id} onClick={() => onOpenTopic(t.id)} className="card" style={{ padding: 16, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="badge badge-orange">{Icons.fire} Quente</span>
                  <span className="badge badge-muted">{t.category?.name}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Avatar user={t.author} size={20} />
                  <span>{t.author.name.split(' ')[0]}</span>
                  <span>·</span>
                  <span>{t.replies} respostas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="eyebrow" style={{ marginBottom: 12 }}>Todas as categorias</div>
      <div className="grid grid-2" style={{ gap: 14 }}>
        {categories.map(c => (
          <div key={c.id} className="card" onClick={() => onOpenCategory(c.id)} style={{ padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${c.color}22`, color: c.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{Icons[c.icon] || Icons.forum}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{c.description}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span><strong>{c.topics ?? 0}</strong> tópicos</span>
                  <span><strong>{c.posts ?? 0}</strong> posts</span>
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

function CategoryView({ catId, onOpenTopic, setUserModal }) {
  const { forumCategories } = useData();
  const [topics, setTopics] = useState([]);
  const cat = forumCategories.find(c => c.id === catId);
  useEffect(() => { api.forum.topics({ categoryId: catId, limit: 80 }).then(d => setTopics(d.topics)).catch(() => {}); }, [catId]);

  if (!cat) return null;

  return (
    <>
      <div className="card" style={{ padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: `${cat.color}22`, color: cat.color, display: 'grid', placeItems: 'center' }}>{Icons[cat.icon] || Icons.forum}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{cat.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.description}</div>
        </div>
      </div>

      <div className="card">
        {topics.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum tópico ainda. Seja o primeiro!</div>}
        {topics.map((t, i) => (
          <div key={t.id} onClick={() => onOpenTopic(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < topics.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}>
            <div onClick={e => { e.stopPropagation(); setUserModal(t.author); }}>
              <Avatar user={t.author} size={40} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {t.pinned && <span style={{ color: 'var(--accent)' }}>{Icons.pin}</span>}
                {t.locked && <span style={{ color: 'var(--text-muted)' }}>{Icons.lock}</span>}
                {t.hot && <span className="badge badge-orange">{Icons.fire} quente</span>}
                <span style={{ fontSize: 15, fontWeight: 600 }}>{t.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>por <strong style={{ color: 'var(--text-secondary)' }}>{t.author.name.split(' ')[0]}</strong></span>
                {(t.tags || []).map(tag => <span key={tag} style={{ padding: '1px 7px', borderRadius: 4, background: 'var(--bg-elev-1)', fontSize: 11 }}>#{tag}</span>)}
              </div>
            </div>
            <div style={{ textAlign: 'center', width: 70 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{t.replies}</div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Respostas</div>
            </div>
            <div style={{ textAlign: 'center', width: 70 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{t.views}</div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Views</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TopicView({ topicId, setUserModal, onBack }) {
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reply, setReply] = useState('');
  const isMod = ['super_admin', 'admin', 'moderator'].includes(user.role);

  const load = async () => {
    const { topic, posts } = await api.forum.topic(topicId);
    setTopic(topic); setPosts(posts);
  };
  useEffect(() => { load().catch(e => toast(e.message, 'err')); }, [topicId]);

  if (!topic) return <div style={{ padding: 40 }}>Carregando...</div>;

  const submitReply = async () => {
    if (!reply.trim()) return;
    try {
      await api.forum.createPost(topic.id, reply);
      setReply('');
      await load();
      toast('Resposta publicada', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  };

  const react = async (postId, emoji) => {
    try {
      await api.forum.reactPost(postId, emoji);
      await load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const toggleLock = async () => {
    try { await api.forum.moderateTopic(topic.id, { locked: !topic.locked }); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const togglePin = async () => {
    try { await api.forum.moderateTopic(topic.id, { pinned: !topic.pinned }); load(); }
    catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 10 }}>
          {topic.pinned && <span className="badge badge-accent">{Icons.pin} Fixado</span>}
          {topic.locked && <span className="badge badge-muted">{Icons.lock} Fechado</span>}
          {(topic.tags || []).map(t => <span key={t} className="badge badge-muted">#{t}</span>)}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 10px' }}>{topic.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          <div onClick={() => setUserModal(topic.author)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Avatar user={topic.author} size={24} />
            <span>{topic.author.name}</span>
          </div>
          <span>·</span>
          <span>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
          <span>·</span>
          <span>{topic.views} views</span>
          {isMod && (
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={togglePin}>{topic.pinned ? 'Desafixar' : 'Fixar'}</button>
              <button className="btn btn-ghost btn-sm" onClick={toggleLock}>{topic.locked ? 'Reabrir' : 'Fechar'}</button>
            </span>
          )}
        </div>
      </div>

      {posts.map((p, i) => <Post key={p.id} post={p} idx={i + 1} setUserModal={setUserModal} onReact={(e) => react(p.id, e)} />)}

      {!topic.locked && (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar user={user} size={40} />
            <div style={{ flex: 1 }}>
              <textarea rows={4} placeholder="Escreva uma resposta..." value={reply} onChange={e => setReply(e.target.value)}
                style={{ width: '100%', resize: 'vertical', padding: 12, background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'inherit', fontSize: 14, color: 'var(--text-primary)' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={submitReply} disabled={!reply.trim()}>Responder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Post({ post, idx, setUserModal, onReact }) {
  const u = post.author;
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojis = ['👍', '❤️', '🔥', '🙌', '😂', '🎉', '💪'];
  const when = new Date(post.createdAt).toLocaleString('pt-BR');

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '180px 1fr', marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ background: 'var(--bg-elev-1)', padding: 18, textAlign: 'center', borderRight: '1px solid var(--border-subtle)' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => setUserModal(u)}>
          <Avatar user={u} size={64} />
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8, color: u.color }}>{u.name}</div>
        </div>
        {u.title && <div style={{ marginTop: 10 }}><span className="badge badge-accent">{u.title}</span></div>}
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 14 }}>
          <div>{when}</div>
          <div>#{idx}</div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: (post.body || '').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/@(\w+)/g, '<span style="color: var(--accent); font-weight: 600;">@$1</span>') }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, position: 'relative' }}>
          {Object.entries(post.reactions || {}).map(([e, n]) => (
            <button key={e} onClick={() => onReact(e)} style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '3px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span>{e}</span><span style={{ fontWeight: 600 }}>{n}</span>
            </button>
          ))}
          <button onClick={() => setEmojiOpen(o => !o)} style={{ background: 'transparent', border: '1px dashed var(--border-default)', borderRadius: 999, padding: '3px 10px', fontSize: 12, color: 'var(--text-muted)' }}>+</button>
          {emojiOpen && (
            <div style={{ position: 'absolute', bottom: 28, left: 0, background: 'var(--bg-elev-2)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 6, display: 'flex', gap: 4 }}>
              {emojis.map(e => (
                <button key={e} onClick={() => { onReact(e); setEmojiOpen(false); }} style={{ fontSize: 18, width: 28, height: 28 }}>{e}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTopicModal({ categories, defaultCategoryId, onClose, onCreated }) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId || categories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!title.trim() || !body.trim() || !categoryId) return;
    setLoading(true);
    try {
      const { topic } = await api.forum.createTopic({
        categoryId, title, body,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      toast('Tópico publicado 🌿', 'ok');
      onCreated(topic);
    } catch (e) { toast(e.message, 'err'); setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h3>Novo tópico</h3><button className="icon-btn" onClick={onClose}>{Icons.close}</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="field-label">Categoria</label>
            <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><label className="field-label">Título</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Sobre o que você quer falar?" autoFocus /></div>
          <div><label className="field-label">Mensagem</label>
            <textarea className="input" rows={8} value={body} onChange={e => setBody(e.target.value)} placeholder="Escreva seu post..." style={{ fontFamily: 'inherit' }} /></div>
          <div><label className="field-label">Tags (separadas por vírgula)</label>
            <input className="input" value={tags} onChange={e => setTags(e.target.value)} placeholder="rotina, loja" /></div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={loading || !title.trim() || !body.trim()}>Publicar</button>
        </div>
      </div>
    </div>
  );
}
