import { useState, useEffect, useRef } from 'react';
import { USERS, CHAT_CHANNELS, CHAT_MESSAGES, ME, userById, toast } from './data.jsx';
import { Icons, Avatar } from './components.jsx';

export default function Chat({ setUserModal }) {
  const [activeCh, setActiveCh] = useState('ch1');
  const [messages, setMessages] = useState(() => CHAT_MESSAGES.ch1 || []);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef(null);
  const channel = CHAT_CHANNELS.find(c => c.id === activeCh);

  useEffect(() => {
    setMessages(CHAT_MESSAGES[activeCh] || []);
  }, [activeCh]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const t = setInterval(() => {
      const random = USERS.filter(u => u.status === 'online' && u.id !== ME.id);
      const who = random[Math.floor(Math.random() * random.length)];
      setTyping([who]);
      setTimeout(() => setTyping([]), 2600);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const send = () => {
    if (!input.trim()) return;
    const newMsg = { id: 'm' + Date.now(), author: ME.id, when: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), body: input };
    setMessages(m => [...m, newMsg]);
    setInput('');
    setTimeout(() => {
      const replyUser = USERS.find(u => u.id === 'u10');
      setTyping([replyUser]);
      setTimeout(() => {
        setTyping([]);
        setMessages(m => [...m, { id: 'm' + Date.now(), author: 'u10', when: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), body: 'Boa! 👍' }]);
      }, 1800);
    }, 1200);
  };

  const handleFile = (files) => {
    if (!files || !files.length) return;
    const f = files[0];
    setMessages(m => [...m, {
      id: 'm' + Date.now(), author: ME.id, when: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      body: '', attachment: { type: f.type.startsWith('image') ? 'image' : 'file', name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + ' MB' }
    }]);
    toast('Arquivo enviado: ' + f.name, 'ok');
  };

  const emojis = ['👍', '❤️', '🔥', '🙌', '😂', '🎉', '🤔', '👀', '💪', '🌿', '🥖', '☕'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', height: 'calc(100vh - 56px)' }}>
      <div style={{ background: 'var(--bg-canvas)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="eyebrow">Canais</div>
          <h3 style={{ margin: '6px 0 0', fontSize: 16, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Conversas</h3>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {CHAT_CHANNELS.map(c => (
            <div key={c.id} onClick={() => setActiveCh(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', color: activeCh === c.id ? 'var(--accent)' : 'var(--text-secondary)', background: activeCh === c.id ? 'var(--bg-active)' : 'transparent', fontWeight: activeCh === c.id ? 600 : 400, marginBottom: 2 }}
              onMouseEnter={e => { if (activeCh !== c.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (activeCh !== c.id) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ color: c.type === 'announce' ? '#ea431b' : 'var(--text-muted)' }}>
                {c.type === 'announce' ? Icons.megaphone : Icons.hash}
              </span>
              <span style={{ flex: 1, fontSize: 14 }} className="truncate">{c.name}</span>
              {c.unread > 0 && <span style={{ fontSize: 10, background: 'var(--tile-red)', color: 'white', borderRadius: 10, padding: '2px 6px', fontWeight: 700 }}>{c.unread}</span>}
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <div className="eyebrow" style={{ padding: '6px 10px' }}>Direct Messages</div>
            {USERS.filter(u => u.id !== ME.id).slice(0, 5).map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar user={u} size={22} showStatus />
                <span className="truncate">{u.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}>

        {dragOver && (
          <div style={{ position: 'absolute', inset: 12, background: 'var(--accent-soft)', border: '2px dashed var(--accent)', borderRadius: 16, display: 'grid', placeItems: 'center', zIndex: 20, pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', color: 'var(--accent)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{Icons.upload}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase' }}>Solte para enviar</div>
            </div>
          </div>
        )}

        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>{Icons.hash}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{channel.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{channel.topic}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-muted">{channel.members} membros</span>
            <button className="icon-btn">{Icons.search}</button>
            <button className="icon-btn">{Icons.dots}</button>
          </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '20px 22px' }}>
          <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-grid', placeItems: 'center', marginBottom: 12 }}>{Icons.hash}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, textTransform: 'uppercase' }}>#{channel.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Este é o início da conversa no canal #{channel.name}.</div>
          </div>

          {messages.map((m, i) => {
            const u = userById(m.author);
            const prev = i > 0 ? messages[i - 1] : null;
            const groupWithPrev = prev && prev.author === m.author;
            return (
              <Message key={m.id} m={m} user={u} grouped={groupWithPrev} reply={m.reply && messages.find(x => x.id === m.reply)} onUserClick={setUserModal} />
            );
          })}

          {typing.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              <Avatar user={typing[0]} size={22} />
              <span><strong style={{ color: 'var(--text-secondary)' }}>{typing[0].name.split(' ')[0]}</strong> está digitando</span>
              <span style={{ display: 'inline-flex', gap: 3 }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', animation: `pulse 1s infinite ${i * 0.15}s` }} />)}
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 22px 20px' }}>
          {showEmoji && (
            <div style={{ background: 'var(--bg-elev-2)', border: '1px solid var(--border-default)', borderRadius: 10, padding: 10, marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {emojis.map(e => (
                <button key={e} onClick={() => { setInput(i => i + e); setShowEmoji(false); }}
                  style={{ width: 32, height: 32, fontSize: 18, borderRadius: 6 }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>{e}</button>
              ))}
            </div>
          )}
          <div style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '4px 4px 4px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={`Mensagem em #${channel.name}`}
              style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 14 }} />
            <button className="icon-btn" onClick={() => setShowEmoji(s => !s)}>{Icons.emoji}</button>
            <label className="icon-btn" style={{ cursor: 'pointer' }}>
              {Icons.attach}
              <input type="file" style={{ display: 'none' }} onChange={e => handleFile(e.target.files)} />
            </label>
            <button className={`btn ${input.trim() ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={send} style={{ padding: '8px 12px' }}>
              {Icons.send}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, paddingLeft: 4 }}>
            <strong>Enter</strong> envia · <strong>Shift+Enter</strong> quebra linha · arraste arquivos pra anexar
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-canvas)', borderLeft: '1px solid var(--border-subtle)', overflow: 'auto' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="eyebrow">Membros do canal · {channel.members}</div>
        </div>
        <div style={{ padding: 8 }}>
          <div className="eyebrow" style={{ padding: '8px 10px' }}>Online · {USERS.filter(u => u.status === 'online').length}</div>
          {USERS.filter(u => u.status === 'online').map(u => (
            <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Avatar user={u} size={28} showStatus />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{u.role}</div>
              </div>
            </div>
          ))}
          <div className="eyebrow" style={{ padding: '16px 10px 8px' }}>Ausente · {USERS.filter(u => u.status === 'away' || u.status === 'dnd').length}</div>
          {USERS.filter(u => u.status === 'away' || u.status === 'dnd').map(u => (
            <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', opacity: 0.7 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Avatar user={u} size={28} showStatus />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{u.name}</div>
              </div>
            </div>
          ))}
          <div className="eyebrow" style={{ padding: '16px 10px 8px' }}>Offline</div>
          {USERS.filter(u => u.status === 'offline').map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', opacity: 0.45 }}>
              <Avatar user={u} size={28} />
              <div style={{ fontSize: 13 }} className="truncate">{u.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ m, user, grouped, reply, onUserClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', gap: 12, padding: grouped ? '2px 0 2px 0' : '10px 0 2px', position: 'relative', borderRadius: 6 }}>
      <div style={{ width: 40, flexShrink: 0 }}>
        {!grouped ? <div onClick={() => onUserClick(user)} style={{ cursor: 'pointer' }}><Avatar user={user} size={40} /></div> : (
          hover && <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 4 }}>{m.when}</div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {!grouped && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span onClick={() => onUserClick(user)} style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', color: user.color }}>{user.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.when}</span>
          </div>
        )}
        {reply && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, borderLeft: '2px solid var(--border-strong)', paddingLeft: 8 }}>
            <span style={{ color: userById(reply.author).color, fontWeight: 600 }}>{userById(reply.author).name}</span>: {reply.body.slice(0, 80)}
          </div>
        )}
        {m.body && <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{m.body}</div>}
        {m.attachment && (
          <div style={{ marginTop: 4, background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10, display: 'inline-flex', alignItems: 'center', gap: 10, maxWidth: 360 }}>
            <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>{Icons.upload}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{m.attachment.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.attachment.size}</div>
            </div>
          </div>
        )}
        {m.reactions && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {Object.entries(m.reactions).map(([e, n]) => (
              <button key={e} style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '2px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span>{e}</span><span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{n}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {hover && (
        <div style={{ position: 'absolute', right: 0, top: grouped ? -14 : 6, background: 'var(--bg-elev-2)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 2, display: 'flex', gap: 2, boxShadow: 'var(--shadow-sm)' }}>
          <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.emoji}</button>
          <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.chat}</button>
          <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.dots}</button>
        </div>
      )}
    </div>
  );
}
