import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './auth.jsx';
import { useData, toast } from './data.jsx';
import { api } from './api.js';
import { getSocket, connectSocket } from './socket.js';
import { Icons, Avatar } from './components.jsx';

export default function Chat({ setUserModal }) {
  const { user } = useAuth();
  const { chatChannels, users } = useData();
  const [activeCh, setActiveCh] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!activeCh && chatChannels.length) setActiveCh(chatChannels[0].id);
  }, [chatChannels, activeCh]);

  const channel = chatChannels.find(c => c.id === activeCh);

  const loadMessages = useCallback(async (chId) => {
    if (!chId) return;
    try {
      const { messages } = await api.chat.messages(chId, { limit: 80 });
      setMessages(messages);
    } catch (e) { toast(e.message, 'err'); }
  }, []);

  useEffect(() => {
    if (!activeCh) return;
    loadMessages(activeCh);
    const s = getSocket() || connectSocket();
    s.emit('channel:join', activeCh);

    const onMsg = (msg) => {
      if (msg.channelId === activeCh) setMessages(m => [...m, msg]);
    };
    const onDel = ({ id }) => setMessages(m => m.filter(x => x.id !== id));
    const onUpd = (msg) => setMessages(m => m.map(x => x.id === msg.id ? { ...x, ...msg } : x));
    const onTypingStart = ({ channelId, user: tu }) => {
      if (channelId !== activeCh || tu.id === user.id) return;
      setTyping(t => t.find(x => x.id === tu.id) ? t : [...t, tu]);
    };
    const onTypingStop = ({ channelId, user: tu }) => {
      if (channelId !== activeCh) return;
      setTyping(t => t.filter(x => x.id !== tu.id));
    };

    s.on('message:new', onMsg);
    s.on('message:deleted', onDel);
    s.on('message:updated', onUpd);
    s.on('typing:start', onTypingStart);
    s.on('typing:stop', onTypingStop);

    return () => {
      s.emit('channel:leave', activeCh);
      s.off('message:new', onMsg);
      s.off('message:deleted', onDel);
      s.off('message:updated', onUpd);
      s.off('typing:start', onTypingStart);
      s.off('typing:stop', onTypingStop);
      setTyping([]);
    };
  }, [activeCh, loadMessages, user.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = async () => {
    if (!input.trim() || !channel) return;
    const body = input;
    setInput('');
    try { await api.chat.send(channel.id, { body }); }
    catch (e) { toast(e.message, 'err'); setInput(body); }
  };

  const onTyping = () => {
    const s = getSocket();
    if (!s) return;
    s.emit('typing:start', { channelId: activeCh });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      s.emit('typing:stop', { channelId: activeCh });
    }, 2500);
  };

  const handleFile = async (files) => {
    if (!files?.length || !channel) return;
    const f = files[0];
    try {
      const { file } = await api.uploads.upload(f);
      await api.chat.send(channel.id, {
        attachment: {
          id: file.id, name: file.originalName, size: file.size,
          mime: file.mime, url: file.url, type: file.mime?.startsWith('image') ? 'image' : 'file',
        },
      });
      toast('Arquivo enviado: ' + f.name, 'ok');
    } catch (e) { toast(e.message || 'Erro ao enviar', 'err'); }
  };

  const emojis = ['👍', '❤️', '🔥', '🙌', '😂', '🎉', '🤔', '👀', '💪', '🌿', '🥖', '☕'];

  if (!channel) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Sem canais ainda. Peça para um admin criar.</div>;
  }

  const online = users.filter(u => u.status === 'online');
  const offline = users.filter(u => u.status === 'offline');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', height: 'calc(100vh - 56px)' }}>
      <div style={{ background: 'var(--bg-canvas)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="eyebrow">Canais</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {chatChannels.map(c => (
            <div key={c.id} onClick={() => setActiveCh(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                color: activeCh === c.id ? 'var(--accent)' : 'var(--text-secondary)',
                background: activeCh === c.id ? 'var(--bg-active)' : 'transparent',
                fontWeight: activeCh === c.id ? 600 : 400, marginBottom: 2 }}>
              <span style={{ color: c.type === 'announce' ? '#ea431b' : 'var(--text-muted)' }}>
                {c.type === 'announce' ? Icons.megaphone : Icons.hash}
              </span>
              <span style={{ flex: 1, fontSize: 14 }} className="truncate">{c.name}</span>
            </div>
          ))}
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
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '20px 22px' }}>
          <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-grid', placeItems: 'center', marginBottom: 12 }}>{Icons.hash}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, textTransform: 'uppercase' }}>#{channel.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Início da conversa no canal #{channel.name}.</div>
          </div>

          {messages.map((m, i) => {
            const prev = i > 0 ? messages[i - 1] : null;
            const grouped = prev && prev.authorId === m.authorId && (new Date(m.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000);
            return <Message key={m.id} m={m} grouped={grouped} onUserClick={setUserModal} />;
          })}

          {typing.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              <Avatar user={typing[0]} size={22} />
              <span><strong style={{ color: 'var(--text-secondary)' }}>{typing[0].name.split(' ')[0]}</strong> {typing.length > 1 ? `e ${typing.length - 1} outros estão` : 'está'} digitando</span>
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
                  style={{ width: 32, height: 32, fontSize: 18, borderRadius: 6 }}>{e}</button>
              ))}
            </div>
          )}
          <div style={{ background: 'var(--bg-elev-1)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '4px 4px 4px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input value={input} onChange={e => { setInput(e.target.value); onTyping(); }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={`Mensagem em #${channel.name}`}
              style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', padding: '10px 0', fontSize: 14 }} />
            <button className="icon-btn" onClick={() => setShowEmoji(s => !s)}>{Icons.emoji}</button>
            <label className="icon-btn" style={{ cursor: 'pointer' }}>
              {Icons.attach}
              <input type="file" style={{ display: 'none' }} onChange={e => handleFile(e.target.files)} />
            </label>
            <button className={`btn ${input.trim() ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={send} style={{ padding: '8px 12px' }}>{Icons.send}</button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, paddingLeft: 4 }}>
            <strong>Enter</strong> envia · arraste arquivos pra anexar
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-canvas)', borderLeft: '1px solid var(--border-subtle)', overflow: 'auto' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="eyebrow">Membros · {users.length}</div>
        </div>
        <div style={{ padding: 8 }}>
          <div className="eyebrow" style={{ padding: '8px 10px' }}>Online · {online.length}</div>
          {online.map(u => (
            <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
              <Avatar user={u} size={28} showStatus />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }} className="truncate">{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{u.roleDesc || u.role}</div>
              </div>
            </div>
          ))}
          {offline.length > 0 && <div className="eyebrow" style={{ padding: '16px 10px 8px' }}>Offline · {offline.length}</div>}
          {offline.slice(0, 20).map(u => (
            <div key={u.id} onClick={() => setUserModal(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', opacity: 0.5, cursor: 'pointer' }}>
              <Avatar user={u} size={28} />
              <div style={{ fontSize: 13 }} className="truncate">{u.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ m, grouped, onUserClick }) {
  const author = m.author;
  const when = new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return (
    <div style={{ display: 'flex', gap: 12, padding: grouped ? '2px 0 2px 0' : '10px 0 2px' }}>
      <div style={{ width: 40, flexShrink: 0 }}>
        {!grouped && <div onClick={() => onUserClick(author)} style={{ cursor: 'pointer' }}><Avatar user={author} size={40} /></div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {!grouped && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span onClick={() => onUserClick(author)} style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', color: author.color }}>{author.name}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{when}</span>
          </div>
        )}
        {m.body && <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.body}</div>}
        {m.attachment && (
          <div style={{ marginTop: 4, background: 'var(--bg-elev-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10, display: 'inline-flex', alignItems: 'center', gap: 10, maxWidth: 360 }}>
            {m.attachment.type === 'image' ? (
              <a href={m.attachment.url} target="_blank" rel="noopener" style={{ display: 'block' }}>
                <img src={m.attachment.url} alt={m.attachment.name} style={{ maxWidth: 340, maxHeight: 240, borderRadius: 6, display: 'block' }} />
              </a>
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>{Icons.upload}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a href={m.attachment.url} target="_blank" rel="noopener" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>{m.attachment.name}</a>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(m.attachment.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
