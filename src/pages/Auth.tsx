import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDB } from '../store';
import { roleHome } from '../store';
import { HERO_IMG } from '../data';

// After login/signup: if the user started a trip as a guest, continue straight to checkout.
function continueTrip(u: { role: string } | undefined, nav: (p: string) => void) {
  try {
    const raw = localStorage.getItem('fv_pending_trip');
    if (raw && u?.role === 'tourist') {
      const p = JSON.parse(raw);
      localStorage.removeItem('fv_pending_trip');
      if (p?.farmId) {
        nav(`/checkout/${p.farmId}?date=${p.date || ''}&slot=${encodeURIComponent(p.slot || '')}&adults=${p.adults || 1}&kids=${p.kids || 0}`);
        return;
      }
    } else if (raw) {
      localStorage.removeItem('fv_pending_trip');
    }
  } catch {}
  nav(u ? roleHome(u.role as any) : '/');
}

function Shell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="wrap">
      <div className="auth-split">
        <div className="auth-visual" style={{ backgroundImage: `url(${HERO_IMG})` }}>
          <div>
            <div className="brand">FARM VIBE</div>
            <p style={{ fontStyle: 'italic', color: '#e8c46a', margin: '6px 0' }}>“Every Season. A New Experience.”</p>
            <p style={{ color: '#e8f3ec', fontSize: 14 }}>Real farmers, scenic trails and certified guides — verified stays, secure payments, 1-hour confirmation.</p>
          </div>
        </div>
        <div className="auth-form">
          <h2 className="serif" style={{ margin: '0 0 4px', fontSize: 28 }}>{title}</h2>
          <p className="mut" style={{ marginTop: 0 }}>{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const { login, users } = useDB();
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const doLogin = (lid: string, lp: string) => {
    const e = login(lid.trim(), lp);
    if (e) { setErr(e); return; }
    const u = users.find(x => x.email === lid.trim() || x.phone === lid.trim());
    setTimeout(() => continueTrip(u, nav), 100);
  };
  return (
    <Shell title="Welcome back" sub="Login as a tourist, farmer or guide.">
      <label>Email or mobile number</label>
      <input className="input" value={id} onChange={e => setId(e.target.value)} placeholder="divya@demo.in / 9842000111" />
      <label>Password</label>
      <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin(id, pass)} />
      {err && <div className="alert alert-r">{err}</div>}
      <br />
      <button className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }} onClick={() => doLogin(id, pass)}>Login securely</button>
      <p className="mut">New tourist? <Link to="/signup">Create an account</Link></p>
    </Shell>
  );
}

export function Signup() {
  const { signupTourist } = useDB();
  const [f, setF] = useState({ name: '', email: '', phone: '', pass: '' });
  const [err, setErr] = useState('');
  const nav = useNavigate();
  return (
    <Shell title="Join Farm Vibe" sub="Tourist accounts only. Farmers and guides receive Admin-created logins.">
      <label>Full name</label><input className="input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Your name" />
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <div style={{ flex: 1 }}><label>Email</label><input className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="you@mail.com" /></div>
        <div style={{ flex: 1 }}><label>Mobile</label><input className="input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="98765 43210" /></div>
      </div>
      <label>Password</label><input className="input" type="password" value={f.pass} onChange={e => setF({ ...f, pass: e.target.value })} placeholder="Min 6 characters" />
      {err && <div className="alert alert-r">{err}</div>}
      <br />
      <button className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
        if (!f.name || f.pass.length < 6) { setErr('Name + 6-character password required.'); return; }
        const e = signupTourist(f.name, f.email, f.phone, f.pass);
        if (e) setErr(e); else setTimeout(() => continueTrip({ role: 'tourist' }, nav), 100);
      }}>Create my account</button>
      <p className="mut">Already registered? <Link to="/login">Login</Link></p>
    </Shell>
  );
}

export function AdminLogin() {
  const { login } = useDB();
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  return (
    <Shell title="Private Admin Login" sub="Restricted URL. Strong authentication with server-side role check.">
      <label>Admin email</label><input className="input" value={id} onChange={e => setId(e.target.value)} placeholder="admin@farmvibe.in" />
      <label>Password</label><input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && id && pass && null} />
      {err && <div className="alert alert-r">{err}</div>}
      <br />
      <button className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
        const e = login(id.trim(), pass);
        if (e) { setErr(e); return; }
        setTimeout(() => nav('/panel-verify'), 100);
      }}>Secure login</button>
      <p className="mut">Demo: admin@farmvibe.in / admin123</p>
    </Shell>
  );
}
