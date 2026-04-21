import { useState, useEffect } from 'react';
import { toast } from './data.jsx';
import { Toasts, Icons } from './components.jsx';
import Login from './login.jsx';
import { Sidebar, Topbar, CmdK, UserModal } from './shell.jsx';
import Dashboard from './dashboard.jsx';
import Chat from './chat.jsx';
import Forum from './forum.jsx';
import Vault from './vault.jsx';
import { Ranking, Profile, Admin } from './other.jsx';
import './styles/tokens.css';
import './styles/app.css';

const TWEAK_DEFAULTS = {
  theme: 'dark',
  accent: 'lime',
  density: 'comfortable',
  dashboardLayout: 'cards',
  forumStyle: 'modern',
};

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('stm_authed') === '1');
  const [route, setRoute] = useState(() => localStorage.getItem('stm_route') || 'dashboard');
  const [userModal, setUserModal] = useState(null);
  const [cmdk, setCmdk] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaks, setTweaks] = useState(() => {
    try { return { ...TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem('stm_tweaks') || '{}') }; }
    catch { return TWEAK_DEFAULTS; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-accent', tweaks.accent);
    document.documentElement.setAttribute('data-density', tweaks.density);
    localStorage.setItem('stm_tweaks', JSON.stringify(tweaks));
  }, [tweaks]);

  useEffect(() => { localStorage.setItem('stm_route', route); }, [route]);
  useEffect(() => { localStorage.setItem('stm_authed', authed ? '1' : '0'); }, [authed]);

  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdk(c => !c); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const updateTweak = (k, v) => setTweaks(t => ({ ...t, [k]: v }));

  if (!authed) {
    return <>
      <Login onLogin={() => setAuthed(true)} />
      <Toasts />
    </>;
  }

  const crumbsFor = (r) => {
    const map = {
      dashboard: ['STM', 'Dashboard'],
      chat: ['STM', 'Chat'],
      forum: ['STM', 'Fórum'],
      vault: ['STM', 'Cofre'],
      ranking: ['STM', 'Ranking'],
      profile: ['STM', 'Meu perfil'],
      admin: ['STM', 'Administração'],
    };
    return map[r] || ['STM'];
  };

  const toggleTheme = () => {
    const order = ['dark', 'verde', 'claro'];
    const next = order[(order.indexOf(tweaks.theme) + 1) % order.length];
    updateTweak('theme', next);
    toast(`Tema alterado: ${next}`, 'info');
  };

  return (
    <div className="app-shell">
      <Sidebar current={route} setCurrent={setRoute} onOpenSearch={() => setCmdk(true)} />
      <Topbar crumbs={crumbsFor(route)} onThemeToggle={toggleTheme} theme={tweaks.theme} />
      <main className="main">
        {route === 'dashboard' && <Dashboard density={tweaks.density} layout={tweaks.dashboardLayout} setUserModal={setUserModal} />}
        {route === 'chat' && <Chat setUserModal={setUserModal} />}
        {route === 'forum' && <Forum style={tweaks.forumStyle} setUserModal={setUserModal} />}
        {route === 'vault' && <Vault setUserModal={setUserModal} />}
        {route === 'ranking' && <Ranking setUserModal={setUserModal} />}
        {route === 'profile' && <Profile setUserModal={setUserModal} />}
        {route === 'admin' && <Admin setUserModal={setUserModal} />}
      </main>
      <CmdK open={cmdk} onClose={() => setCmdk(false)} setCurrent={setRoute} />
      <UserModal user={userModal} onClose={() => setUserModal(null)} />
      {tweaksOpen && <TweaksPanel tweaks={tweaks} updateTweak={updateTweak} onClose={() => setTweaksOpen(false)} />}
      <Toasts />
    </div>
  );
}

function TweaksPanel({ tweaks, updateTweak, onClose }) {
  return (
    <div className="tweaks-panel">
      <div className="tweaks-head">
        <h4>Tweaks</h4>
        <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={onClose}>{Icons.close}</button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-row">
          <label>Tema</label>
          <div className="seg">
            {[['dark','Dark'],['verde','Verde'],['claro','Claro']].map(([k,l]) => (
              <button key={k} className={tweaks.theme === k ? 'on' : ''} onClick={() => updateTweak('theme', k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="tweak-row">
          <label>Cor de destaque</label>
          <div className="swatches">
            {[['lime','#9fb42c'],['verde','#225633'],['purple','#7e3f62'],['orange','#ea431b'],['blue','#1f6fb8']].map(([k,c]) => (
              <button key={k} className={tweaks.accent === k ? 'on' : ''} style={{ background: c }} onClick={() => updateTweak('accent', k)} title={k} />
            ))}
          </div>
        </div>
        <div className="tweak-row">
          <label>Densidade</label>
          <div className="seg">
            {[['comfortable','Confortável'],['compact','Compacta']].map(([k,l]) => (
              <button key={k} className={tweaks.density === k ? 'on' : ''} onClick={() => updateTweak('density', k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="tweak-row">
          <label>Estilo do fórum</label>
          <div className="seg">
            {[['modern','Moderno'],['classic','vBulletin']].map(([k,l]) => (
              <button key={k} className={tweaks.forumStyle === k ? 'on' : ''} onClick={() => updateTweak('forumStyle', k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="tweak-row">
          <label>Layout do Dashboard</label>
          <div className="seg">
            {[['cards','Cards grandes'],['dense','Lista densa']].map(([k,l]) => (
              <button key={k} className={tweaks.dashboardLayout === k ? 'on' : ''} onClick={() => updateTweak('dashboardLayout', k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
