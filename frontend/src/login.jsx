import { useState } from 'react';
import { useAuth } from './auth.jsx';
import { toast } from './data.jsx';
import { BrandMark, Ladrilho, Icons } from './components.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !pw) { toast('Preencha e-mail e senha', 'err'); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), pw);
      toast('Bem-vindo 🌿', 'ok');
    } catch (err) {
      toast(err.message || 'Erro ao entrar', 'err');
      setLoading(false);
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
            Um único lugar pra o time conversar, organizar acessos, compartilhar rotinas e deixar a operação rodando redonda.
          </p>
        </div>

        <div style={{ position: 'relative', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(242,245,234,0.4)' }}>
          © 2026 St Marché · v1.0
        </div>
      </div>

      <div style={{ display: 'grid', placeItems: 'center', padding: '48px', position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: '0 0 8px' }}>Entrar</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px' }}>Use sua conta corporativa do St Marché.</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="field-label">E-mail</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@marche.com.br" autoFocus autoComplete="email" />
            </div>
            <div>
              <label className="field-label">Senha</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} style={{ paddingRight: 40 }} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(s => !s)} className="icon-btn" style={{ position: 'absolute', right: 4, top: 4, width: 32, height: 32 }}>
                  {showPw ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Verificando...' : 'Entrar'}
              {!loading && Icons.arrow}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center' }}>
            Problemas pra entrar? Fale com um admin.
          </p>
        </div>
      </div>
    </div>
  );
}
