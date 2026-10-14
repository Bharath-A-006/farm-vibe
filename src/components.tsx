import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDB } from './store';
import { aiAnswer, speak, listenOnce, detectLang, AILang } from './ai';
import { I } from './icons';
import { tx } from './data';

/** Brand logo: uses logo.png next to the built app (drop the supplied logo file at
    farm-vibe/public/logo.png). BASE_URL-aware so it works on localhost AND file://.
    Falls back to the leaf mark if the file is missing. */
const LOGO_SRC = `${(import.meta as any).env.BASE_URL}logo.png`;

/** In-app anchor scroll that never leaves the app route (no 404 on hosted subpaths). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
export function Logo({ size = 48, cls = '' }: { size?: number; cls?: string }) {
  const [ok, setOk] = useState(true);
  if (ok) return <img src={LOGO_SRC} alt="Farm Vibe logo" className={cls} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} onError={() => setOk(false)} />;
  return <>{I.leaf({ size: Math.round(size * 0.55) })}</>;
}

export function Navbar() {
  const { user, logout, lang, setLang, notifs } = useDB();
  const nav = useNavigate();
  const unread = notifs.filter(n => user && n.userId === user.id && !n.read).length;
  return (
    <div className="nav">
      <div className="nav-in">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="logo">
            <div className="logo-mark"><Logo size={48} /></div>
            <div><span className="brand" style={{ fontSize: 21 }}>FARM VIBE</span> <span className="badge">AGRO-TOURISM</span>
              <small>“Every Season. A New Experience.”</small>
            </div>
          </div>
        </Link>
        <div className="links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'on' : ''}>{tx(lang, 'home')}</NavLink>
          {(!user || user.role === 'tourist' || user.role === 'admin') && <>
            <NavLink to="/farms" className={({ isActive }) => isActive ? 'on' : ''}>{tx(lang, 'explore')}</NavLink>
            <NavLink to="/plans" className={({ isActive }) => isActive ? 'on' : ''}>{tx(lang, 'plans')}</NavLink>
          </>}
          <a href="#/" onClick={e => { e.preventDefault(); nav('/'); setTimeout(() => scrollToId('about'), 80); }}>{tx(lang, 'about')}</a>
          <a href="#/" onClick={e => { e.preventDefault(); nav('/'); setTimeout(() => scrollToId('contact'), 80); }}>{tx(lang, 'contact')}</a>
          <button className="btn btn-o btn-sm" onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}><span style={{ display: 'inline-flex' }}>{I.globe({ size: 15 })}</span>{lang === 'en' ? 'தமிழ்' : 'English'}</button>
          {user && <button className="btn btn-o btn-sm" onClick={() => nav(user.role === 'tourist' ? '/tourist' : user.role === 'farmer' ? '/farmer' : user.role === 'guide' ? '/guide' : '/panel-verify')}><span style={{ display: 'inline-flex' }}>{I.bell({ size: 15 })}</span>{unread > 0 ? `(${unread})` : ''} {tx(lang, 'dashboard')}</button>}
          {!user && <><Link to="/login">{tx(lang, 'login')}</Link><Link to="/signup" style={{ background: '#0d6b4f', color: '#fff' }}>{tx(lang, 'signup')}</Link></>}
          {user && <button className="btn btn-o btn-sm" onClick={() => { logout(); nav('/'); }}><span style={{ display: 'inline-flex' }}>{I.logout({ size: 15 })}</span>{tx(lang, 'logout')}</button>}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <div className="footer" id="contact">
      <div className="footer-in">
        <div>
          <h3 className="brand" style={{ color: '#fff', background: 'none', fontSize: 22 }}>FARM VIBE</h3>
          <p className="mut" style={{ color: '#a9c8b8' }}>Every Season. A New Experience.<br />Real farmers, scenic trails, certified guides.<br />Support: care@farmvibe.in • 1800-FARM-VIBE</p>
        </div>
        <div><b>Explore</b><p>Farms<br />1/2/3-day plans<br />Farmers & Guides</p></div>
        <div><b>Help</b><p>How booking works<br />Payment verification (1 hr)<br />Complaints & refunds</p></div>
        <div id="about"><b>About</b><p>Farm tourism for Tamil Nadu villages. Experiences only — no marketplace.</p></div>
      </div>
    </div>
  );
}

export function AIAssistant({ role = 'home' }: { role?: 'home' | 'tourist' | 'farmer' | 'guide' }) {
  const { farms } = useDB();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ me: boolean; t: string; thoughts?: string[]; live?: boolean }[]>([{ me: false, t: 'Hello! I am the Farm Vibe assistant, powered by Gemini. I think through your question before answering — ask about farms, plans, pricing or booking, in English or Tamil.' }]);
  const [q, setQ] = useState('');
  const [al, setAl] = useState<AILang>('en');
  const [listening, setListening] = useState(false);
  const [thinkStep, setThinkStep] = useState<string | null>(null);

  const ask = async (text: string) => {
    if (!text.trim() || thinkStep) return;
    setMsgs(m => [...m, { me: true, t: text }]);
    setQ('');
    setThinkStep('Thinking…');
    const ans = await aiAnswer(text, role, farms);
    setThinkStep(null);
    setMsgs(m => [...m, { me: false, t: ans.text, thoughts: ans.thoughts, live: ans.live }]);
  };

  return (
    <>
      <button className="ai-fab" onClick={() => setOpen(o => !o)} title="Farm Vibe AI assistant">{I.bot({})}</button>
      {open && (
        <div className="ai-panel">
          <div className="ai-head">
            <div className="row">Farm Vibe AI <span className="chip" style={{ background: '#ffffff22', color: '#fff' }}>Gemini</span></div>
            <div className="row" style={{ marginTop: 8 }}>
              {(['en', 'ta'] as AILang[]).map(l => (
                <button key={l} className="btn btn-sm" style={{ background: al === l ? '#12a46b' : '#ffffff2a', color: '#fff' }} onClick={() => setAl(l)}>{l === 'en' ? 'English' : 'தமிழ்'}</button>
              ))}
            </div>
          </div>
          <div className="ai-body">
            {msgs.map((m, i) => (
              <div key={i} className={m.me ? 'msg me' : 'msg ai'}>
                {!m.me && m.live !== undefined && (
                  <span className="chip" style={{ fontSize: 10, marginBottom: 6, background: m.live ? '#e6f6ec' : '#fdf3d8', color: m.live ? '#0b5c43' : '#7a5a14' }}>
                    {m.live ? 'Gemini live' : 'Instant reply'}
                  </span>
                )}
                <div>{m.t}</div>
                {!m.me && !!m.thoughts?.length && (
                  <details className="thought-box">
                    <summary>Thought process</summary>
                    <ol>{m.thoughts.map((t2, j) => <li key={j}>{t2}</li>)}</ol>
                  </details>
                )}
                {!m.me && <div><button className="btn btn-o btn-sm" style={{ marginTop: 6 }} onClick={() => speak(m.t, detectLang(m.t))}><span style={{ display: 'inline-flex' }}>{I.vol({ size: 14 })}</span> Listen</button></div>}
              </div>
            ))}
            {thinkStep && <div className="msg ai"><b>{thinkStep}</b> <span className="typing"><span /><span /><span /></span></div>}
          </div>
          <div className="ai-in">
            <button className="btn btn-o btn-sm" onClick={() => {
              setListening(true);
              listenOnce(al, (t) => { setListening(false); ask(t); }, () => { setListening(false); alert('Microphone unavailable — please type.'); });
            }} title="Voice input"><span style={{ display: 'inline-flex' }}>{I.mic({ size: 16 })}</span>{listening ? '…' : ''}</button>
            <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Type in English or Tamil…" onKeyDown={e => e.key === 'Enter' && ask(q)} />
            <button className="btn btn-g btn-sm" onClick={() => ask(q)} title="Send"><span style={{ display: 'inline-flex' }}>{I.send({ size: 15 })}</span></button>
          </div>
        </div>
      )}
    </>
  );
}
