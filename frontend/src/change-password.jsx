import { useState } from 'react';
import { useAuth } from './auth.jsx';
import { toast } from './data.jsx';
import { api } from './api.js';
import { BrandMark, Icons } from './components.jsx';

export default function ChangePassword() {
  const { user, refresh } = useAuth();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return toast('Senha precisa ter 8+ caracteres', 'err');
    if (pw !== confirm) return toast('As senhas não conferem', 'err');
    setLoading(true);
    try {
      await api.auth.changePassword(null, pw);
      toast('Senha atualizada 🌿', 'ok');
      await refresh();
    } catch (err) {
      toast(err.message || 'Erro ao trocar senha', 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <BrandMark size={48} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.05em' }}>STM Operações</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Primeiro acesso — defina sua senha</div>
          </div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase', margin: '0 0 8px' }}>Olá, {user?.name?.split(' ')[0]}!</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 28 }}>
          Por segurança, defina uma nova senha antes de continuar. Use pelo menos 8 caracteres.
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Nova senha</label>
            <input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} autoFocus minLength={8} />
          </div>
          <div>
            <label className="field-label">Confirmar senha</label>
            <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} />
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Salvando...' : 'Salvar e entrar'}
            {!loading && Icons.arrow}
          </button>
        </form>
      </div>
    </div>
  );
}
