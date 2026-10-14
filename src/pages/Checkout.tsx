import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDB } from '../store';
import { FARM_EXTRA, PROMOS } from '../enrich';
import { STR, tx } from '../data';
import { I } from '../icons';

export default function Checkout() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const db = useDB();
  const nav = useNavigate();
  const farm = db.farms.find(f => f.id === id);
  const ex = farm ? FARM_EXTRA[farm.id] : undefined;

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ name: db.user?.name || '', email: db.user?.email || '', code: '+91', phone: db.user?.phone || '' });
  const [date, setDate] = useState(sp.get('date') || '');
  const [slot, setSlot] = useState(sp.get('slot') || '');
  const [adults, setAdults] = useState(+(sp.get('adults') || 2));
  const [kids, setKids] = useState(+(sp.get('kids') || 0));
  const [acts, setActs] = useState<string[]>([]);
  const [transport, setTransport] = useState(false);
  const [food, setFood] = useState(true);
  const [stay, setStay] = useState(false);
  const [method, setMethod] = useState('UPI');
  const [promo, setPromo] = useState('');
  const [promoOk, setPromoOk] = useState<number>(0);
  const [done, setDone] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const calc = useMemo(() => {
    if (!farm) return null;
    const a = farm.pricePerDay * adults;
    const k = Math.round(farm.pricePerDay * 0.5) * kids;
    const t = transport ? 1500 : 0;
    const fd = food ? 450 * (adults + kids) : 0;
    const s = stay ? 3500 : 0;
    const sub = a + k + t + fd + s;
    const disc = Math.round(sub * promoOk);
    return { a, k, t, fd, s, sub, disc, total: sub - disc };
  }, [farm, adults, kids, transport, food, stay, promoOk]);

  if (!farm || !calc) return <div className="wrap"><div className="alert alert-r">Farm not found. <Link to="/farms">Back</Link></div></div>;
  if (!db.user || db.user.role !== 'tourist') {
    const savePending = () => {
      try { localStorage.setItem('fv_pending_trip', JSON.stringify({ farmId: farm.id, date, slot, adults, kids })); } catch {}
      nav('/login?next=trip');
    };
    return (
    <div className="wrap"><div className="auth" style={{ textAlign: 'center' }}>
      <h2>Login to continue</h2><p className="mut">Your trip ({farm.name}{date ? ` • ${date}` : ''}{slot ? ` • ${slot}` : ''}) is saved — login and checkout continues automatically.</p>
      <div className="row" style={{ justifyContent: 'center' }}><button className="btn btn-g" onClick={savePending}>Login & continue</button><button className="btn btn-o" onClick={savePending}>Sign Up & continue</button></div>
    </div></div>
  );
  }

  if (done) {
    const b = db.bookings.find(x => x.id === done);
    return (
      <div className="wrap" style={{ maxWidth: 640 }}>
        <div className="card anim"><div className="card-b" style={{ textAlign: 'center', padding: 34 }}>
          <span style={{ display: 'inline-grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%', background: 'var(--green-l)', color: 'var(--green)' }}>{I.check({ size: 30 })}</span>
          <h2>Booking received</h2>
          <p><b>{b?.id}</b> • {farm.name} • {date}{slot ? ` • ${slot}` : ''} • Rs.{b?.total}</p>
          <div className="alert alert-y" style={{ textAlign: 'left' }}>{STR.payPending[db.lang]}</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn btn-g" onClick={() => nav('/tourist')}>Track in My Bookings</button>
            <Link to="/farms"><button className="btn btn-o">Explore more</button></Link>
          </div>
        </div></div>
      </div>
    );
  }

  const steps = [tx(db.lang, 'contact'), tx(db.lang, 'activity'), tx(db.lang, 'payment'), tx(db.lang, 'review')];

  return (
    <div className="wrap" style={{ maxWidth: 1080 }}>
      <p className="mut"><Link to={`/farm/${farm.id}`}>Back to {farm.name}</Link></p>
      <h2 style={{ margin: '4px 0' }}>Secure checkout</h2>
      <div className="steps">
        {steps.map((s, i) => <div key={s} className={`step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} data-n={i + 1}>{s}</div>)}
      </div>
      <div className="co">
        <div>
          {step === 0 && <div className="card anim"><div className="card-b">
            <h3>Contact details</h3>
            <label>Full name</label><input className="input" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
            <label>Email</label><input className="input" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
            <label>Phone</label>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <select className="input" style={{ maxWidth: 110 }} value={contact.code} onChange={e => setContact({ ...contact, code: e.target.value })}><option>+91</option><option>+1</option><option>+44</option><option>+61</option><option>+65</option></select>
              <input className="input" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="98765 43210" />
            </div>
          </div></div>}

          {step === 1 && <div className="card anim"><div className="card-b">
            <h3>Activity details</h3>
            <div className="row">
              <div style={{ flex: 1 }}><label>Date</label><input type="date" className="input" min={today} value={date} onChange={e => setDate(e.target.value)} /></div>
              <div style={{ flex: 1 }}><label>Adults</label><input type="number" min={1} max={farm.capacity} className="input" value={adults} onChange={e => setAdults(+e.target.value)} /></div>
              <div style={{ flex: 1 }}><label>Kids</label><input type="number" min={0} max={10} className="input" value={kids} onChange={e => setKids(+e.target.value)} /></div>
            </div>
            <label>Time slot</label>
            <div>{ex?.slots.map(s => <span key={s} className={`pill-sel ${slot === s ? 'on' : ''}`} onClick={() => setSlot(s)}>{s}</span>)}</div>
            <label>Activities</label>
            <div className="row">{farm.activities.map(a => <label key={a} style={{ fontWeight: 400 }}><input type="checkbox" checked={acts.includes(a)} onChange={e => setActs(e.target.checked ? [...acts, a] : acts.filter(x => x !== a))} /> {a}</label>)}</div>
            <label>Optional extras</label>
            <div className="row">
              <label style={{ fontWeight: 400 }}><input type="checkbox" checked={transport} onChange={e => setTransport(e.target.checked)} /> Transport (+Rs.1500)</label>
              <label style={{ fontWeight: 400 }}><input type="checkbox" checked={food} onChange={e => setFood(e.target.checked)} /> Food (+Rs.450/person)</label>
              <label style={{ fontWeight: 400 }}><input type="checkbox" checked={stay} onChange={e => setStay(e.target.checked)} /> Stay (+Rs.3500)</label>
            </div>
          </div></div>}

          {step === 2 && <div className="card anim"><div className="card-b">
            <h3>Payment details</h3>
            <label>Method</label>
            <div>{['UPI', 'Debit Card', 'Credit Card', 'Net Banking'].map(m => <span key={m} className={`pill-sel ${method === m ? 'on' : ''}`} onClick={() => setMethod(m)}>{m}</span>)}</div>
            {method === 'UPI' && <><label>UPI ID</label><input className="input" placeholder="name@upi" /></>}
            {method !== 'UPI' && method !== 'Net Banking' && <><label>Card number</label><input className="input" placeholder="1234 5678 9012 3456" /><div className="row"><div style={{ flex: 1 }}><label>Expiry</label><input className="input" placeholder="MM/YY" /></div><div style={{ flex: 1 }}><label>CVV</label><input className="input" placeholder="•••" type="password" /></div></div></>}
            {method === 'Net Banking' && <><label>Bank</label><select className="input"><option>HDFC</option><option>SBI</option><option>ICICI</option><option>Axis</option></select></>}
            <div className="trust"><span style={{ display: 'inline-flex' }}>{I.shield({ size: 17 })}</span>256-bit encrypted • verified server-side via gateway</div>
          </div></div>}

          {step === 3 && <div className="card anim"><div className="card-b">
            <h3>Review & pay</h3>
            <p><b>{contact.name}</b> • {contact.email} • {contact.code} {contact.phone}</p>
            <p className="mut">{date} • {slot} • {adults} adults{kids ? `, ${kids} kids` : ''} • {acts.join(', ') || 'All highlights'}</p>
            <div className="alert alert-g">Paying Rs.{calc.total} via {method}. Admin verifies within 1 hour of payment.</div>
          </div></div>}

          <div className="row" style={{ marginTop: 12 }}>
            {step > 0 && <button className="btn btn-o" onClick={() => setStep(step - 1)}>{tx(db.lang, 'back')}</button>}
            {step < 3 && <button className="btn btn-g" onClick={() => {
              if (step === 0 && (!contact.name || !contact.phone)) { alert('Name and phone are required.'); return; }
              if (step === 1 && (!date || !slot)) { alert('Pick a date and slot.'); return; }
              if (step === 1 && date < today) { alert('That date has passed. Please pick today or a future date.'); return; }
              setStep(step + 1);
            }}>{tx(db.lang, 'continue')}</button>}
            {step === 3 && <button className="btn btn-g" onClick={() => {
              if (!date || date < today) { alert('Please pick today or a future date.'); setStep(1); return; }
              const nb = db.makeBooking({
                touristId: db.user!.id, touristName: contact.name, touristPhone: `${contact.code} ${contact.phone}`, farmId: farm.id, farmName: farm.name,
                date, slot, visitors: adults + kids, activities: acts, transport, food, stay,
                total: calc.total, payMethod: method,
              });
              setDone(nb.id);
            }}>{tx(db.lang, 'paySecure')} Rs.{calc.total}</button>}
          </div>
        </div>

        <div className="book-widget" style={{ position: 'static' }}>
          <img src={farm.image} alt="" className="sum-thumb" />
          <b style={{ display: 'block', marginTop: 8 }}>{farm.name}</b>
          <div className="mut">{date || 'Select date'} • {slot || 'Select slot'}</div>
          <div className="trust"><span style={{ display: 'inline-flex' }}>{I.shield({ size: 16 })}</span>Free cancellation up to 24h</div>
          <h3>Price breakup</h3>
          <div className="table-scroll"><table className="table">
            <tbody>
              <tr><td>Adults × {adults}</td><td>Rs.{calc.a}</td></tr>
              {kids > 0 && <tr><td>Kids × {kids}</td><td>Rs.{calc.k}</td></tr>}
              {calc.t > 0 && <tr><td>Transport</td><td>Rs.{calc.t}</td></tr>}
              {calc.fd > 0 && <tr><td>Food</td><td>Rs.{calc.fd}</td></tr>}
              {calc.s > 0 && <tr><td>Stay</td><td>Rs.{calc.s}</td></tr>}
              {calc.disc > 0 && <tr><td>Promo off</td><td>−Rs.{calc.disc}</td></tr>}
              <tr><td><b>Total</b></td><td><b>Rs.{calc.total}</b></td></tr>
            </tbody>
          </table></div>
          <label>Promo code (try FARM10)</label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input className="input" value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="FARM10" />
            <button className="btn btn-o btn-sm" onClick={() => {
              const v = PROMOS[promo.trim()];
              if (v) { setPromoOk(v); alert(`Applied! ${Math.round(v * 100)}% off.`); }
              else { setPromoOk(0); alert('Invalid code.'); }
            }}>Apply</button>
          </div>
          <div className="alert alert-g" style={{ fontSize: 12 }}>
            <b>Book with confidence</b><br />24/7 support • Secure payments • Verified hosts
          </div>
        </div>
      </div>
    </div>
  );
}
