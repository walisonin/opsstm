import { useState } from 'react';
import { toast } from './data.jsx';
import { BrandMark, Ladrilho, Icons } from './components.jsx';

export default function Login({ onLogin }) {
  const [step, setStep] = useState('credentials');
  const [user, setUser] = useState('rafael.moura');
  const [pw, setPw] = useState('••••••••••');
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!user || !pw) { toast('Preencha usuário e senha', 'err'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('2fa'); }, 700);
  };

  const enterCode = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const nc = [...code]; nc[i] = v; setCode(nc);
    if (v && i < 5) document.getElementById(`code-${i + 1}`)?.focus();
    if (nc.every(x => x !== '')) {
      setLoading(true);
      setTimeout(() => { toast('Bem-vindo, Rafael 🌿', 'ok'); onLogin(); }, 700);
    }
  };

  const tiles = [
    { c: '#9fb42c', s: 82, x: '8%', y: '14%', d: 0, op: 0.85 },
    { c: '#7e3f62', s: 54, x: '18%', y: '72%', d: 2, op: 0.75 },
    { c: '#1f6fb8', s: 38, x: '30%', y: '28%', d: 4, op: 0.6 },
    { c: '#ea431b', s: 64, x: '78%', y: '18%', d: 1, op: 0.8 },
    { c: '#eeb23e', s: 44, x: '88%', y: '62%', d: 3, op: 0.75 },
    { c: '#1f8a8a', s: 30, x: '72%', y: '84%', d: 5, op: 0.65 },
    { c: '#f2801f', s: 26, x: '42%', y: '12%', d: 6, op: 0.6 },
    { c: '#b4c93d', s: 50, x: '58%', y: '72%', d: 2.5, op: 0.7 },
    { c: '#c72124', s: 22, x: '12%', y: '42%', d: 3.5, op: 0.55 },
    { c: '#947034', s: 36, x: '92%', y: '38%', d: 1.5, op: 0.6 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'grid', gridTemplateColumns: '1fr 1.1fr', position: 'relative', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(160deg, #0e2d1b 0%, #174628 55%, #102d1c 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px' }}>
        <div className="tile-bg">
          {tiles.map((t, i) => (
            <div key={i} className="t" style={{ left: t.x, top: t.y, animationDelay: `${t.d}s`, '--tile-op': t.op }}>
              <Ladrilho color={t.c} size={t.s} />
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <BrandMark size={48} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f2f5ea' }}>STM Operações</div>
            <div style={{ fontSize: 12, color: 'rgba(242,245,234,0.65)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Portal interno · St Marché</div>
          </div>
        </div>

        <div style={{ position: 'relative', color: '#f2f5ea', maxWidth: 480 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(242,245,234,0.5)', marginBottom: 18 }}>Bem-vindo de volta</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 0.95, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase' }}>
            Onde o time<br />se <span style={{ color: '#9fb42c' }}>encontra</span>.
          </h1>
          <p style={{ color: 'rgba(242,245,234,0.75)', fontSize: 16, marginTop: 20, maxWidth: 420 }}>
            Um único lugar pra o time de Operações conversar, organizar acessos, compartilhar rotinas e deixar a loja rodando redondo.
          </p>
          <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
            <LoginStat label="Membros ativos" value="54" />
            <LoginStat label="Canais" value="7" />
            <LoginStat label="Tópicos" value="641" />
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(242,245,234,0.4)' }}>
          © 2025 St Marché · v2.4.0
        </div>
      </div>

      <div style={{ display: 'grid', placeItems: 'center', padding: '48px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 32, right: 32, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Ajuda?</span>
          <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Falar com suporte</a>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>
          {step === 'credentials' ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 8px' }}>Entrar</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px' }}>Use sua conta corporativa do St Marché.</p>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="field-label">Usuário</label>
                  <input className="input" value={user} onChange={e => setUser(e.target.value)} placeholder="nome.sobrenome" autoFocus />
                </div>
                <div>
                  <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Senha</span>
                    <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12 }}>Esqueci a senha</a>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="icon-btn" style={{ position: 'absolute', right: 4, top: 4, width: 32, height: 32 }}>
                      {showPw ? Icons.eyeOff : Icons.eye}
                    </button>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" className="chk" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Manter-me conectado neste dispositivo
                </label>
                <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? 'Verificando...' : 'Continuar'}
                  {!loading && Icons.arrow}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 20px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>ou</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                <GoogleG /> Entrar com Google Workspace
              </button>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center' }}>
                Problemas pra entrar? Fale com TI no ramal <span className="mono" style={{ color: 'var(--text-secondary)' }}>4080</span>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep('credentials')} className="btn-ghost" style={{ padding: '6px 10px', marginBottom: 12, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                ← Voltar
              </button>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 8px' }}>Verificação em duas etapas</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 28px' }}>
                Enviamos um código para <strong style={{ color: 'var(--text-primary)' }}>+55 (11) ••••-8812</strong>.
              </p>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                {code.map((d, i) => (
                  <input
                    key={i} id={`code-${i}`}
                    className="input"
                    value={d} onChange={e => enterCode(i, e.target.value)}
                    maxLength={1}
                    style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, height: 60, padding: 0, fontFamily: 'var(--font-mono)' }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                <span>Não recebeu?</span>
                <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Reenviar em 0:23</a>
              </div>
              {loading && <div style={{ marginTop: 20, padding: 12, background: 'var(--bg-elev-1)', borderRadius: 10, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>Autenticando...</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginStat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#9fb42c', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(242,245,234,0.55)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.2-.4-4.7H24v9h11.8c-.5 2.7-2 5-4.3 6.5v5.4h6.9c4-3.7 6.3-9.2 6.3-16.2z"/>
      <path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.3l-6.9-5.4c-2 1.3-4.4 2-7.4 2-5.7 0-10.5-3.8-12.2-9H4.7v5.6C8.3 41.2 15.6 46 24 46z"/>
      <path fill="#FBBC05" d="M11.8 28.3A13.4 13.4 0 0 1 11 24c0-1.5.3-2.9.8-4.3v-5.6H4.7A22 22 0 0 0 2 24c0 3.5.9 6.9 2.7 9.9l7.1-5.6z"/>
      <path fill="#EA4335" d="M24 10.8c3.2 0 6 1.1 8.3 3.2l6.1-6.1C34.7 4 29.8 2 24 2 15.6 2 8.3 6.8 4.7 14.1l7.1 5.6C13.5 14.6 18.3 10.8 24 10.8z"/>
    </svg>
  );
}
