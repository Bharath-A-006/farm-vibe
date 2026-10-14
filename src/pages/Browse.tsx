import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDB } from '../store';
import { FARM_EXTRA, ALL_REGIONS, usdt, extraFor } from '../enrich';
import { farmReviews } from '../reviews';
import { tx, FARMS as SEED_FARMS } from '../data';
import { I } from '../icons';
import type { Farm } from '../types';

interface Filters {
  maxPrice: number;
  minRating: number;
  durations: string[];
  times: string[];
  langs: string[];
  tags: string[];
}

const DEF: Filters = { maxPrice: 1500, minRating: 0, durations: [], times: [], langs: [], tags: [] };
const TAG_OPTS = ['Free cancellation', 'Deals', 'Likely to Sell Out', 'Seasonal'];
const DUR_OPTS = ['Up to 5 hrs', '6–7 hrs', 'Full day (8+ hrs)'];
const TIME_OPTS = ['Morning', 'Afternoon', 'Full Day'];

function durBucket(h: number) {
  return h <= 5 ? 'Up to 5 hrs' : h <= 7 ? '6–7 hrs' : 'Full day (8+ hrs)';
}

function Card({ f, idx }: { f: Farm; idx: number }) {
  const { lang } = useDB();
  const ex = FARM_EXTRA[f.id] || extraFor(f);
  const isNew = !SEED_FARMS.some(s => s.id === f.id);
  const [gi, setGi] = useState(0);
  const imgs = ex ? ex.gallery : [f.image];
  const revs = farmReviews(f.id);
  const cls = idx % 3 === 0 ? 'anim' : idx % 3 === 1 ? 'anim-1' : 'anim-2';
  return (
    <div className={`card hover listing ${cls}`}>
      <div className="gal">
        <img src={imgs[gi]} alt={f.name} loading="lazy" />
        <div className="bdg">
          {isNew && <span className="deal">New from farmer</span>}
          {ex?.sellout && <span className="sell">Likely to Sell Out</span>}
          {ex?.mrp && <span className="deal">Special Offer</span>}
          {ex?.tags.includes('Free cancellation') && <span className="free">Free cancellation</span>}
        </div>
        {imgs.length > 1 && <>
          <button className="nav-arrow" style={{ left: 8 }} onClick={() => setGi((gi + imgs.length - 1) % imgs.length)}>‹</button>
          <button className="nav-arrow" style={{ right: 8 }} onClick={() => setGi((gi + 1) % imgs.length)}>›</button>
          <div className="dots">{imgs.map((_, i) => <i key={i} className={i === gi ? 'on' : ''} />)}</div>
        </>}
      </div>
      <div className="card-b">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <b style={{ fontSize: 18 }}>{f.name}</b>
          <span className="chip">Verified</span>
        </div>
        <div className="mut"><span style={{ display: 'inline-flex', verticalAlign: -3 }}>{I.pin({ size: 14 })}</span> {f.region} • {f.crop}</div>
        <div className="hl">
          <span><span style={{ display: 'inline-flex' }}>{I.clock({ size: 14 })}</span>{ex?.durationHrs || 6} hrs</span>
          <span><span style={{ display: 'inline-flex' }}>{I.shield({ size: 14 })}</span>Free cancellation 24h</span>
          <span className="stars">{I.star({})} {f.rating} <span className="mut">({revs.length} reviews)</span></span>
        </div>
        <div className="mut" style={{ marginBottom: 6 }}>{f.activities.slice(0, 3).join(' • ')}</div>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
          <div>
            {ex?.mrp && <span className="price-old">Rs.{ex.mrp} </span>}
            <span className="mut">{tx(lang, 'from')} </span><span className="price-now">Rs.{f.pricePerDay}</span>
            <span className="mut">{tx(lang, 'perPerson')} • ≈ {usdt(f.pricePerDay)} USDT</span>
          </div>
          <Link to={`/farm/${f.id}`}><button className="btn btn-g btn-sm">{tx(lang, 'viewDetails')} <span style={{ display: 'inline-flex' }}>{I.chevR({ size: 14 })}</span></button></Link>
        </div>
      </div>
    </div>
  );
}

export function Farms() {
  const { farms, lang } = useDB();
  const [sp] = useSearchParams();
  const [region, setRegion] = useState(sp.get('region') || sp.get('q') || 'All regions');
  const [from, setFrom] = useState(sp.get('date') || '');
  const [to, setTo] = useState('');
  const [adults, setAdults] = useState(+(sp.get('adults') || 2));
  const [kids, setKids] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [fl, setFl] = useState<Filters>({ ...DEF, maxPrice: sp.get('budget') ? +sp.get('budget')! : DEF.maxPrice });
  const [quick, setQuick] = useState<string[]>([]);

  const toggle = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const list = useMemo(() => {
    return farms.filter(f => {
      if (!f.verified) return false;
      const ex = FARM_EXTRA[f.id] || extraFor(f);
      if (region !== 'All regions' && !f.region.toLowerCase().includes(region.toLowerCase().split(',')[0])) return false;
      if (f.pricePerDay > fl.maxPrice) return false;
      if (f.rating < fl.minRating) return false;
      if (fl.durations.length && !fl.durations.includes(durBucket(ex.durationHrs))) return false;
      if (fl.times.length && !ex.timeOfDay.some(t => fl.times.includes(t))) return false;
      if (fl.langs.length && !ex.languages.some(l => fl.langs.includes(l))) return false;
      if (fl.tags.length && !fl.tags.every(t =>
        t === 'Deals' ? ex.mrp : t === 'Likely to Sell Out' ? ex.sellout : ex.tags.includes(t))) return false;
      if (quick.length && !quick.every(t =>
        t === 'Deals' ? ex.mrp : t === 'Likely to Sell Out' ? ex.sellout : ex.tags.includes(t))) return false;
      return true;
    });
  }, [farms, region, fl, quick]);

  const activeN = fl.durations.length + fl.times.length + fl.langs.length + fl.tags.length + (fl.minRating > 0 ? 1 : 0) + (fl.maxPrice < 1500 ? 1 : 0);

  return (
    <div className="wrap">
      <div className="browse-bar anim">
        <h2 style={{ margin: '0 0 4px' }}>{tx(lang, 'findExp')}</h2>
        <p style={{ margin: '0 0 14px', color: '#cfe6d8' }}>Live availability • verified hosts • free cancellation</p>
        <div className="browse-grid">
          <div className="field"><label>{tx(lang, 'location')}</label>
            <select value={region} onChange={e => setRegion(e.target.value)}>
              {ALL_REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="field"><label>{tx(lang, 'dateRange')}</label>
            <div className="row" style={{ gap: 4 }}>
              <input type="date" min={new Date().toISOString().slice(0, 10)} value={from} onChange={e => setFrom(e.target.value)} style={{ width: '48%' }} />
              <input type="date" min={from || new Date().toISOString().slice(0, 10)} value={to} onChange={e => setTo(e.target.value)} style={{ width: '48%' }} />
            </div>
          </div>
          <div className="field"><label>{tx(lang, 'adults')}</label>
            <div className="stepper"><button onClick={() => setAdults(Math.max(1, adults - 1))}>−</button>{adults}<button onClick={() => setAdults(Math.min(30, adults + 1))}>+</button></div>
          </div>
          <div className="field"><label>{tx(lang, 'kids')}</label>
            <div className="stepper"><button onClick={() => setKids(Math.max(0, kids - 1))}>−</button>{kids}<button onClick={() => setKids(Math.min(15, kids + 1))}>+</button></div>
          </div>
          <button className="btn" style={{ background: 'var(--gold)', color: '#3d2f05' }} onClick={() => setDrawer(true)}>
            <span style={{ display: 'inline-flex' }}>{I.sliders({ size: 16 })}</span>{tx(lang, 'filters')}{activeN > 0 ? ` (${activeN})` : ''}
          </button>
        </div>
        <div className="chip-row">
          {TAG_OPTS.map(t => (
            <button key={t} className={`fchip ${quick.includes(t) ? 'on' : ''}`} onClick={() => setQuick(toggle(quick, t))}>{t}</button>
          ))}
        </div>
      </div>

      <div className="sec-t" style={{ marginTop: 20 }}>
        <div><h2>{list.length} {tx(lang, 'expFound')}</h2><p>{region} • {from || 'any date'}{to ? ` → ${to}` : ''} • {adults} {tx(lang, 'adults').toLowerCase()}{kids ? `, ${kids} ${tx(lang, 'kids').toLowerCase()}` : ''}</p></div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {list.map((f, i) => <Card key={f.id} f={f} idx={i} />)}
      </div>
      {list.length === 0 && (
        <div className="card"><div className="card-b" style={{ textAlign: 'center', padding: 40 }}>
          <b>No experiences match these filters.</b>
          <p className="mut">Try widening the price range or clearing tags.</p>
          <button className="btn btn-g btn-sm" onClick={() => { setFl(DEF); setQuick([]); setRegion('All regions'); }}>Clear all filters</button>
        </div></div>
      )}

      {drawer && <><div className="drawer-veil" onClick={() => setDrawer(false)} />
        <div className="drawer">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>{tx(lang, 'filters')}</h2>
            <button className="btn btn-o btn-sm" onClick={() => setDrawer(false)}>{tx(lang, 'close')}</button>
          </div>
          <h3>{tx(lang, 'maxPrice')}: Rs.{fl.maxPrice}</h3>
          <input type="range" min={500} max={1500} step={50} value={fl.maxPrice} onChange={e => setFl({ ...fl, maxPrice: +e.target.value })} />
          <h3>{tx(lang, 'rating')}</h3>
          <div>{[0, 4, 4.5, 4.8].map(r => (
            <span key={r} className={`pill-sel ${fl.minRating === r ? 'on' : ''}`} onClick={() => setFl({ ...fl, minRating: r })}>{r === 0 ? tx(lang, 'any') : `${r}★ & up`}</span>
          ))}</div>
          <h3>{tx(lang, 'duration')}</h3>
          <div>{DUR_OPTS.map(d => <span key={d} className={`pill-sel ${fl.durations.includes(d) ? 'on' : ''}`} onClick={() => setFl({ ...fl, durations: toggle(fl.durations, d) })}>{d}</span>)}</div>
          <h3>{tx(lang, 'timeOfDay')}</h3>
          <div>{TIME_OPTS.map(t => <span key={t} className={`pill-sel ${fl.times.includes(t) ? 'on' : ''}`} onClick={() => setFl({ ...fl, times: toggle(fl.times, t) })}>{t}</span>)}</div>
          <h3>{tx(lang, 'languages')}</h3>
          <div>{['Tamil', 'English'].map(l => <span key={l} className={`pill-sel ${fl.langs.includes(l) ? 'on' : ''}`} onClick={() => setFl({ ...fl, langs: toggle(fl.langs, l) })}>{l}</span>)}</div>
          <h3>{tx(lang, 'specialTags')}</h3>
          <div>{TAG_OPTS.map(t => <span key={t} className={`pill-sel ${fl.tags.includes(t) ? 'on' : ''}`} onClick={() => setFl({ ...fl, tags: toggle(fl.tags, t) })}>{t}</span>)}</div>
          <br />
          <div className="row">
            <button className="btn btn-g" style={{ flex: 1 }} onClick={() => setDrawer(false)}>{tx(lang, 'seeResults')} ({list.length})</button>
            <button className="btn btn-o btn-sm" onClick={() => setFl(DEF)}>{tx(lang, 'reset')}</button>
          </div>
        </div>
      </>}
    </div>
  );
}

export function Plans() {
  const { farms } = useDB();
  return (
    <div className="wrap">
      <h2 className="anim">Curated Plans — 1 / 2 / 3 Days</h2>
      <p className="mut">AI Trip Planner in the tourist dashboard personalises these. A plan is not a booking.</p>
      <div className="grid3">
        {[
          { d: '1-Day • Rs.999', t: 'Farm Fresh Escape', pts: ['Farm walk + 2 activities', 'Banana-leaf lunch', 'Guide included'] },
          { d: '2-Day • Rs.2499', t: 'Agro Trail + Farm Stay', pts: ['2 farms + 1 night stay', 'All meals + campfire', 'Transport optional'] },
          { d: '3-Day • Rs.3999', t: 'Village Immersion', pts: ['3 farms + 2 nights stay', 'Folk evening', 'Certified guide'] },
        ].map((p, i) => (
          <div className={`card hover ${i === 0 ? 'anim' : i === 1 ? 'anim-1' : 'anim-2'}`} key={p.t}><div className="card-b"><span className="chip gold">{p.d}</span><h3>{p.t}</h3>{p.pts.map(x => <div key={x} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0' }}><span style={{ color: 'var(--green)', display: 'inline-flex' }}>{I.check({ size: 15 })}</span>{x}</div>)}<br /><Link to="/signup"><button className="btn btn-g btn-sm">Start Planning</button></Link></div></div>
        ))}
      </div>
      <h3 style={{ marginTop: 20 }}>Live farm capacity</h3>
      <div className="row">{farms.filter(f => f.verified).map(f => <span className="chip" key={f.id}>{f.name}: {f.capacity} seats</span>)}</div>
    </div>
  );
}
