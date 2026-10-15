import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDB } from '../store';
import { FARM_EXTRA, extraFor } from '../enrich';
import { tx } from '../data';
import { usdt } from '../enrich';
import { farmReviews, ratingBreakdown, monogram, monoColor } from '../reviews';
import { geminiReviewSummary } from '../ai';
import { I } from '../icons';

export default function FarmDetail() {
  const { id } = useParams();
  const { farms, lang, user } = useDB();
  const nav = useNavigate();
  const farm = farms.find(f => f.id === id);
  const [tabIdx, setTabIdx] = useState(0);
  const TABS = [tx(lang, 'overview'), tx(lang, 'included'), tx(lang, 'meeting'), tx(lang, 'itinerary'), tx(lang, 'info'), `${tx(lang, 'reviews')}`];
  const tab = TABS[tabIdx];
  const [gi, setGi] = useState(0);
  const [light, setLight] = useState(false);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const [sumLoading, setSumLoading] = useState(false);

  const ex = farm ? (FARM_EXTRA[farm.id] || extraFor(farm)) : undefined;
  const revs = useMemo(() => (farm ? farmReviews(farm.id) : []), [farm]);
  const bd = useMemo(() => (farm ? ratingBreakdown(farm.id) : null), [farm]);
  const imgs = ex?.gallery || (farm ? [farm.image] : []);

  if (!farm) return <div className="wrap"><div className="alert alert-r">Experience not found. <Link to="/farms">Back to Explore</Link></div></div>;

  const total = farm.pricePerDay * adults + Math.round(farm.pricePerDay * 0.5) * kids;
  const today = new Date().toISOString().slice(0, 10);
  const ready = date && slot && date >= today;

  const goCheckout = () => {
    if (!date || !slot) { alert('Please pick a date and time slot.'); return; }
    if (date < today) { alert('That date has passed. Please pick today or a future date.'); return; }
    // Guest flow: save the trip, login, and continue straight to checkout.
    if (!user || user.role !== 'tourist') {
      try { localStorage.setItem('fv_pending_trip', JSON.stringify({ farmId: farm.id, date, slot, adults, kids })); } catch {}
      nav('/login?next=trip');
      return;
    }
    nav(`/checkout/${farm.id}?date=${date}&slot=${encodeURIComponent(slot)}&adults=${adults}&kids=${kids}`);
  };

  return (
    <div className="wrap">
      <p className="mut"><Link to="/farms">Explore</Link> / {farm.region} / <b style={{ color: 'var(--ink)' }}>{farm.name}</b></p>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '4px 0', fontSize: 34 }}>{farm.name}</h1>
          <div className="row">
            <span className="stars">{I.star({})} {farm.rating} <span className="mut">({revs.length} verified reviews)</span></span>
            <span className="mut">{farm.region}</span>
            <span className="chip">Verified host</span>
            {ex?.sellout && <span className="chip red">Likely to Sell Out</span>}
          </div>
        </div>
      </div>

      <div className="pdp" style={{ marginTop: 16 }}>
        <div>
          <div className="gal-main anim">
            <img src={imgs[gi]} alt={farm.name} />
            <div className="bdg">{ex?.mrp && <span className="deal">Special Offer</span>}</div>
            <button className="btn btn-d btn-sm" style={{ position: 'absolute', bottom: 12, right: 12 }} onClick={() => setLight(true)}>
              <span style={{ display: 'inline-flex' }}>{I.cam({ size: 15 })}</span>See all {imgs.length} photos
            </button>
          </div>
          <div className="gal-thumbs">
            {imgs.map((s, i) => <img key={i} src={s} alt="" loading="lazy" className={i === gi ? 'on' : ''} onClick={() => setGi(i)} />)}
          </div>

          <div className="tabs">
            {TABS.map((t, i) => <button key={t} className={tabIdx === i ? 'on' : ''} onClick={() => setTabIdx(i)}>{t}{i === 5 ? ` (${revs.length})` : ''}</button>)}
          </div>

          {tabIdx === 0 && <>
            <p style={{ lineHeight: 1.7 }}>{farm.description}</p>
            <div className="hl">
              <span><span style={{ display: 'inline-flex' }}>{I.clock({ size: 15 })}</span>{ex?.durationHrs} hours</span>
              <span><span style={{ display: 'inline-flex' }}>{I.users({ size: 15 })}</span>Up to {farm.capacity} guests</span>
              <span><span style={{ display: 'inline-flex' }}>{I.globe({ size: 15 })}</span>{ex?.languages.join(' • ')}</span>
              <span><span style={{ display: 'inline-flex' }}>{I.pin({ size: 15 })}</span>{farm.season}</span>
            </div>
            <h3>Highlights</h3>
            <div className="grid3">{farm.activities.map(a => <div className="card" key={a}><div className="card-b" style={{ display: 'flex', gap: 9, alignItems: 'center' }}><span style={{ color: 'var(--green)', display: 'inline-flex' }}>{I.leaf({ size: 17 })}</span><b>{a}</b></div></div>)}</div>
            <h3>Facilities</h3>
            <div className="row">{farm.facilities.map(f2 => <span className="chip blue" key={f2}>{f2}</span>)}</div>
            {farm.shop?.available && <div className="card" style={{ marginTop: 12, border: '1.5px solid var(--gold)' }}><div className="card-b">
              <b>{farm.shop.name}</b> <span className="chip gold">Farm shop on site</span>
              <div className="row" style={{ marginTop: 6 }}>{farm.shop.items.map(it => <span className="chip" key={it}>{it}</span>)}</div>
              <p className="mut">Buy directly from the farmer during your visit. Pay at the shop counter.</p>
            </div></div>}
          </>}

          {tabIdx === 1 && <div className="card"><div className="card-b">
            {ex?.included.map((x, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: x.ok ? 'var(--green)' : '#a93226', display: 'inline-flex' }}>{x.ok ? I.check({ size: 17 }) : I.cross({ size: 17 })}</span>
                <span style={{ textDecoration: x.ok ? 'none' : 'line-through', color: x.ok ? 'var(--ink)' : 'var(--mut)' }}>{x.text}</span>
              </div>
            ))}
          </div></div>}

          {tabIdx === 2 && <>
            <div className="map-ph">
              <span style={{ display: 'inline-flex', color: 'var(--green)' }}>{I.pin({ size: 30 })}</span>
              <p><b>Pickup point</b><br />{ex?.pickup}</p>
              <p className="mut">{ex?.mapNote}</p>
              <p className="mut">Exact Google Maps pin is shared on WhatsApp after Admin payment verification.</p>
            </div>
          </>}

          {tabIdx === 3 && <div className="tl">
            {ex?.itinerary.map((s, i) => <div key={i}><b>{s.t}</b><p className="mut" style={{ margin: '2px 0' }}>{s.d}</p></div>)}
          </div>}

          {tabIdx === 4 && <div className="card"><div className="card-b">
            {ex?.info.map((x, i) => <div key={i} style={{ display: 'flex', gap: 9, padding: '7px 0' }}><span style={{ color: 'var(--gold-d)', display: 'inline-flex' }}>{I.tag({ size: 15 })}</span>{x}</div>)}
            <div className="trust"><span style={{ display: 'inline-flex' }}>{I.shield({ size: 17 })}</span>Free cancellation within 18 hours of booking. Full refund via original payment method.</div>
          </div></div>}

          {tabIdx === 5 && <>
            <div className="card"><div className="card-b">
              <div className="row" style={{ gap: 20 }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 44, fontWeight: 800 }}>{bd?.avg.toFixed(1)}</div>
                  <div className="stars">{I.star({})}{I.star({})}{I.star({})}{I.star({})}{I.star({})}</div>
                  <div className="mut">{bd?.count} verified reviews</div></div>
                <div style={{ flex: 1 }}>
                  {bd?.bars.map(b => <div className="bar-row" key={b.star}><span>{b.star} star</span><div className="bar"><i style={{ width: `${b.pct}%` }} /></div><span>{b.pct}%</span></div>)}
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn btn-o btn-sm" disabled={sumLoading} onClick={async () => {
                  setSumLoading(true);
                  const s = await geminiReviewSummary(revs.map(r => `${r.rating}/5 ${r.title}: ${r.text}`));
                  setSummary(s || 'Most guests praise the food, the hands-on activities and quick payment verification. A few note sun/road conditions — morning slots are recommended.');
                  setSumLoading(false);
                }}><span style={{ display: 'inline-flex' }}>{I.bolt({ size: 15 })}</span>{sumLoading ? 'Summarising…' : 'Summarise reviews with AI'}</button>
              </div>
              {summary && <div className="alert alert-g" style={{ whiteSpace: 'pre-line' }}>{summary}</div>}
            </div></div>
            {revs.map(r => (
              <div className="rev" key={r.id}>
                <div className="row">
                  <span className="mono" style={{ background: monoColor(r.name) }}>{monogram(r.name)}</span>
                  <div><b>{r.name}</b> <span className="chip" style={{ fontSize: 11 }}>Verified visit</span><div className="mut">{r.date} • <span className="stars">{I.star({ size: 13 })} {r.rating}</span></div></div>
                </div>
                <b style={{ display: 'block', marginTop: 8 }}>{r.title}</b>
                <p className="mut">{r.text}</p>
                <div>{r.tags.map(t => <span className="chip gold" key={t}>{t}</span>)}</div>
                {r.hostReply && <div className="host-reply"><b>Host reply:</b> {r.hostReply}</div>}
              </div>
            ))}
          </>}
        </div>

        <div className="book-widget anim-1">
          <div>{ex?.mrp && <span className="price-old">Rs.{ex.mrp} </span>}<span className="price-now">Rs.{farm.pricePerDay}</span><span className="mut">{tx(lang, 'perAdult')} • ≈ {usdt(farm.pricePerDay)} USDT</span></div>
          <div className="mut">Kids (5–12): Rs.{Math.round(farm.pricePerDay * 0.5)} • Under 5 free</div>
          {ex?.dealEndsInDays && <div className="deal-tag"><span style={{ display: 'inline-flex', verticalAlign: -3 }}>{I.bolt({ size: 15 })}</span> Special Offer ends in {ex.dealEndsInDays} days</div>}
          <label>{tx(lang, 'visitDateLbl')}</label>
          <input type="date" className="input" min={today} value={date} onChange={e => setDate(e.target.value)} />
          <label>{tx(lang, 'timeSlot')}</label>
          <div>{ex?.slots.map(s => <span key={s} className={`pill-sel ${slot === s ? 'on' : ''}`} onClick={() => setSlot(s)}>{s}</span>)}</div>
          <div className="row" style={{ marginTop: 8 }}>
            <div style={{ flex: 1 }}><label>{tx(lang, 'adults')}</label><div className="stepper" style={{ color: 'var(--ink)' }}><button style={{ borderColor: 'var(--line)', background: '#f2f5f3', color: 'var(--ink)' }} onClick={() => setAdults(Math.max(1, adults - 1))}>−</button>{adults}<button style={{ borderColor: 'var(--line)', background: '#f2f5f3', color: 'var(--ink)' }} onClick={() => setAdults(Math.min(farm.capacity, adults + 1))}>+</button></div></div>
            <div style={{ flex: 1 }}><label>{tx(lang, 'kids')}</label><div className="stepper" style={{ color: 'var(--ink)' }}><button style={{ borderColor: 'var(--line)', background: '#f2f5f3', color: 'var(--ink)' }} onClick={() => setKids(Math.max(0, kids - 1))}>−</button>{kids}<button style={{ borderColor: 'var(--line)', background: '#f2f5f3', color: 'var(--ink)' }} onClick={() => setKids(Math.min(10, kids + 1))}>+</button></div></div>
          </div>
          <div className="alert alert-g" style={{ marginBottom: 8 }}><b>{tx(lang, 'total')}: Rs.{total} (≈ {usdt(total)} USDT)</b><br /><span className="mut">{adults} adults{kids ? ` + ${kids} kids` : ''} • availability {adults + kids <= farm.capacity ? 'available' : 'exceeds capacity'}</span></div>
          <button className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }} onClick={goCheckout}>{tx(lang, 'checkAvail')}</button>
          <div className="trust"><span style={{ display: 'inline-flex' }}>{I.shield({ size: 17 })}</span>{tx(lang, 'freeCancel')}</div>
          <p className="mut" style={{ textAlign: 'center' }}>Hosted by {farm.farmerName} • Admin verifies payment within 1 hour</p>
        </div>
      </div>

      <div className="bottom-bar">
        <div><span className="price-old">Rs.{ex?.mrp}</span> <b>Rs.{farm.pricePerDay}</b><span className="mut">{tx(lang, 'perAdult')}</span></div>
        <button className="btn btn-g btn-sm" onClick={goCheckout}>{tx(lang, 'bookNow')}</button>
      </div>

      {light && <><div className="drawer-veil" onClick={() => setLight(false)} />
        <div className="drawer" style={{ width: 'min(720px,94vw)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}><h2 style={{ margin: 0 }}>Photos</h2><button className="btn btn-o btn-sm" onClick={() => setLight(false)}>Close</button></div>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>{imgs.map((s, i) => <img key={i} src={s} alt="" style={{ width: '100%', borderRadius: 14 }} loading="lazy" />)}</div>
        </div>
      </>}
    </div>
  );
}
