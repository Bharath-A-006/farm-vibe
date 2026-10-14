import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FARMS, PLANS, HERO_IMG, FARMERS_SHOW, GUIDES_SHOW, STR, tx } from '../data';
import { ALL_REGIONS } from '../enrich';
import { useDB } from '../store';
import { Logo } from '../components';
import { I } from '../icons';

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const { lang } = useDB();
  const [s, setS] = useState('');
  const [fRegion, setFRegion] = useState('All regions');
  const [fDate, setFDate] = useState('');
  const [fBudget, setFBudget] = useState('1500');
  const [fGuests, setFGuests] = useState('2');
  const nav = useNavigate();
  const go = () => nav(`/farms?q=${encodeURIComponent(s)}`);
  const goFilter = () => nav(`/farms?region=${encodeURIComponent(fRegion)}&date=${fDate}&budget=${fBudget}&adults=${fGuests}`);
  const t = (k: keyof typeof STR) => STR[k][lang];

  return (
    <>
      <div className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="hero-ol" />
        <div className="hero-in">
          <span className="pill"><span className="dot-live" />Agro-Tourism & Village Immersion</span>
          <div style={{ marginTop: 16 }}><Logo size={92} cls="hero-logo" /></div>
          <h1>FARM VIBE</h1>
          <div className="tag serif">“{t('tagline')}”</div>
          <p className="sub">{t('heroSub')}</p>
          <div className="search">
            <span style={{ paddingLeft: 12, color: 'var(--green)', display: 'inline-flex' }}>{I.search({ size: 20 })}</span>
            <input value={s} onChange={e => setS(e.target.value)} placeholder={t('searchPh')} onKeyDown={e => e.key === 'Enter' && go()} />
            <button className="btn btn-g" onClick={go}>{tx(lang, 'searchBtn')} <span style={{ display: 'inline-flex' }}>{I.chevR({ size: 16 })}</span></button>
          </div>
          <div className="hero-cta">
            <Link to="/farms"><button className="btn btn-g"><span style={{ display: 'inline-flex' }}>{I.leaf({ size: 17 })}</span>{tx(lang, 'exploreFarmsBtn')}</button></Link>
            <Link to="/plans"><button className="btn btn-d"><span style={{ display: 'inline-flex' }}>{I.cal({ size: 17 })}</span>{tx(lang, 'explorePlansBtn')}</button></Link>
          </div>
          <div className="stats">
            <div className="stat anim"><b style={{ color: '#ffd34d' }}>40+</b><span>Verified Heritage Farms</span></div>
            <div className="stat anim-1"><b style={{ color: '#5df0b0' }}>5,200+</b><span>Happy Nature Seekers</span></div>
            <div className="stat anim-2"><b style={{ color: '#7cc7ff' }}>28+</b><span>Certified Village Guides</span></div>
            <div className="stat anim-3"><b style={{ color: '#ff9db0' }}>99.4%</b><span>Satisfaction Rate</span></div>
          </div>
        </div>
      </div>

      <div className="home-filter anim-2">
        <div className="fld"><label>{tx(lang, 'location')}</label>
          <select className="input" value={fRegion} onChange={e => setFRegion(e.target.value)}>
            {ALL_REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="fld"><label>{tx(lang, 'visitDate')}</label><input type="date" className="input" min={todayISO()} value={fDate} onChange={e => setFDate(e.target.value)} /></div>
        <div className="fld"><label>{tx(lang, 'budget')}</label>
          <select className="input" value={fBudget} onChange={e => setFBudget(e.target.value)}>
            <option value="700">Up to Rs.700</option>
            <option value="900">Up to Rs.900</option>
            <option value="1200">Up to Rs.1200</option>
            <option value="1500">Up to Rs.1500</option>
          </select>
        </div>
        <div className="fld"><label>{tx(lang, 'guests')}</label>
          <select className="input" value={fGuests} onChange={e => setFGuests(e.target.value)}>
            {['1', '2', '3', '4', '5+'].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <button className="btn btn-g" onClick={goFilter}><span style={{ display: 'inline-flex' }}>{I.search({ size: 16 })}</span>{tx(lang, 'find')}</button>
      </div>

      <div className="wrap">
        <div className="sec-t"><div><h2>{tx(lang, 'featured')}</h2><p>Verified village experiences with free cancellation.</p></div><Link to="/farms">{tx(lang, 'viewAll')}</Link></div>
        <div className="grid3">
          {FARMS.slice(0, 3).map((f, i) => (
            <div className={`card hover ${i === 0 ? 'anim' : i === 1 ? 'anim-1' : 'anim-2'}`} key={f.id}>
              <img src={f.image} alt={f.name} className="cover" loading="lazy" />
              <div className="card-b">
                <b>{f.name}</b>
                <div className="mut">{f.region} • {f.crop} • <span className="stars">{I.star({ size: 13 })} {f.rating}</span></div>
                <div style={{ margin: '8px 0' }}>{f.activities.slice(0, 2).map(a => <span className="chip" key={a}>{a}</span>)}</div>
                <div className="row" style={{ justifyContent: 'space-between' }}><span><span className="mut">from </span><b>Rs.{f.pricePerDay}</b></span><Link to={`/farm/${f.id}`}><button className="btn btn-g btn-sm">View</button></Link></div>
              </div>
            </div>
          ))}
        </div>

        <div className="sec-t" style={{ marginTop: 30 }}><div><h2>{tx(lang, 'packages')}</h2><p>Curated agro-trails with stay, food & guide options.</p></div><Link to="/plans">{tx(lang, 'viewAll')}</Link></div>
        <div className="grid3">
          {PLANS.map((p, i) => (
            <div className={`card hover ${i === 0 ? 'anim' : i === 1 ? 'anim-1' : 'anim-2'}`} key={p.id}>
              <img src={p.image} alt={p.title} className="cover" loading="lazy" />
              <div className="card-b"><b>{p.title}</b><div className="mut">Rs.{p.price} • {p.includes.join(' • ')}</div>
                <div className="row" style={{ marginTop: 8 }}><Link to="/plans"><button className="btn btn-o btn-sm">Itinerary</button></Link></div></div>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 34 }}>{tx(lang, 'how')}</h2>
        <div className="how">
          {[
            { ic: I.search({ size: 22 }), t: 'Explore farms & plans with live filters' },
            { ic: I.bot({ size: 22 }), t: 'Gemini trip planner in English & Tamil' },
            { ic: I.card({ size: 22 }), t: 'Secure checkout with price breakup' },
            { ic: I.shield({ size: 22 }), t: 'Admin verifies in 1 hour — visit!' },
          ].map((x, i) => (
            <div className="card" key={i}><div className="card-b"><span style={{ color: 'var(--green)', display: 'inline-flex' }}>{x.ic}</span><p><b>Step {i + 1}.</b> {x.t}</p></div></div>
          ))}
        </div>

        <h2 style={{ marginTop: 30 }}>{tx(lang, 'meetFG')}</h2>
        <p className="mut">Real hosts with real photos — every farmer and guide sets their own profile picture.</p>
        <h3>{tx(lang, 'farmers')}</h3>
        <div className="people">{FARMERS_SHOW.map(p => <div className="person" key={p.name}><img src={p.img} alt={p.name} loading="lazy" /><br /><b>{p.name}</b><div className="mut">{p.place}</div></div>)}</div>
        <h3>{tx(lang, 'guides')}</h3>
        <div className="people">{GUIDES_SHOW.map(p => <div className="person" key={p.name}><img src={p.img} alt={p.name} loading="lazy" /><br /><b>{p.name}</b><div className="mut">{p.place}</div></div>)}</div>

        <h2 style={{ marginTop: 30 }}>{tx(lang, 'reviewsFaq')}</h2>
        <div className="grid3">
          {[['Meenakshi, Chennai', 'Pollachi farm lunch was superb. Guide explained everything clearly!'], ['Arun, Coimbatore', 'Payment verified in 30 mins. Paddy transplanting was unforgettable.'], ['Sara, Bengaluru', 'Ooty stay + vegetable picking — kids loved it.']].map(([a, b]) => (
            <div className="card" key={a}><div className="card-b"><span className="stars">{I.star({})}{I.star({})}{I.star({})}{I.star({})}{I.star({})}</span><b style={{ display: 'block', marginTop: 6 }}>{a}</b><p className="mut">{b}</p></div></div>
          ))}
        </div>
        {[['How is a booking confirmed?', 'Farm availability check, then payment, then Admin verification within 1 hour. A plan alone never books.'], ['Which payment methods?', 'UPI, debit/credit cards and net banking via secure gateway, verified server-side.'], ['How do farmers & guides join?', 'Only the Admin creates farmer and guide accounts. Tourists sign up publicly.'], ['Where is Admin login?', 'Private URL /panel-verify-login — never shown on the home page.']].map(([q, a]) => (
          <div className="faq" key={q}><b>{q}</b><p className="mut">{a}</p></div>
        ))}
      </div>
    </>
  );
}
