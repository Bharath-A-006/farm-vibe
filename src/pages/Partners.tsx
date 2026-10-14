import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '../store';
import { ProfileHead, PhotoPrompt, Avatar } from '../profile';
import { PLACES, usdt } from '../enrich';
import { tx } from '../data';
import { I } from '../icons';

const ID_TYPES = ['Aadhaar', 'Voter ID', 'PAN Card', 'Driving Licence', 'Passport'];
const GUIDE_LANGS = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu'];

export function GuideEditor() {
  const { user, guides, updateGuideSelf } = useDB();
  const me = guides.find(g => g.userId === user?.id);
  const [village, setVillage] = useState(me?.village || '');
  const [langs, setLangs] = useState<string[]>(me?.languages || ['Tamil']);
  const [exp, setExp] = useState(me?.experience || '');
  if (!me) return null;
  const toggleL = (l: string) => setLangs(s => s.includes(l) ? s.filter(x => x !== l) : [...s, l]);
  return (
    <>
      <label>Base village / town</label>
      <select className="input" value={village} onChange={e => setVillage(e.target.value)}>
        {PLACES.map(p => <option key={p}>{p}</option>)}
      </select>
      <label>Languages known</label>
      <div>{GUIDE_LANGS.map(l => <span key={l} className={`pill-sel ${langs.includes(l) ? 'on' : ''}`} onClick={() => toggleL(l)}>{l}</span>)}</div>
      <label>Experience</label><input className="input" value={exp} onChange={e => setExp(e.target.value)} placeholder="e.g. 5 yrs • 120 tours" />
      <br /><button className="btn btn-g btn-sm" onClick={() => {
        if (!langs.length) { alert('Pick at least one language.'); return; }
        updateGuideSelf({ village: village || me.village, languages: langs, experience: exp });
        alert('Profile updated!');
      }}>Save my updates</button>
    </>
  );
}

export function IdProofCard() {
  const { user, submitIdProof } = useDB();
  const [f, setF] = useState({ t: user?.idType || 'Aadhaar', n: user?.idNumber || '', d: user?.idDesc || '' });
  if (!user || (user.role !== 'farmer' && user.role !== 'guide')) return null;
  const st = user.idStatus || 'none';
  return (
    <div className="card" style={{ marginTop: 12 }}><div className="card-b">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Identity verification</h3>
        <span className={`chip ${st === 'verified' ? '' : st === 'pending' ? 'gold' : 'red'}`}>
          {st === 'verified' ? 'Verified' : st === 'pending' ? 'Pending Admin review' : st === 'rejected' ? 'Rejected — resubmit' : 'Not submitted'}
        </span>
      </div>
      <p className="mut">Admin verifies your identity with the description below before your profile goes fully live.</p>
      <label>ID type</label>
      <select className="input" value={f.t} onChange={e => setF({ ...f, t: e.target.value })}>
        {ID_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
      <label>ID number</label><input className="input" value={f.n} onChange={e => setF({ ...f, n: e.target.value })} placeholder="XXXX-XXXX-1234" />
      <label>Who are you? (specific description)</label>
      <textarea className="input" rows={3} value={f.d} onChange={e => setF({ ...f, d: e.target.value })} placeholder="e.g. Pollachi coconut farmer, 22 years, 60-acre grove…" />
      <br /><button className="btn btn-g btn-sm" onClick={() => {
        if (!f.n || !f.d) { alert('ID number + description required.'); return; }
        submitIdProof(f.t, f.n, f.d); alert('Submitted for Admin verification!');
      }}>Submit for verification</button>
    </div></div>
  );
}

export function Farmer() {
  const db = useDB();
  const { user, farms, bookings, notifs, lang } = db;
  const [tab, setTab] = useState('farms');
  const [nf, setNf] = useState({ name: '', region: PLACES[0], crop: '', price: '2999', capacity: '25', desc: '', img: '' });
  const [cmp, setCmp] = useState({ category: 'Booking / visitor issue', subject: '', detail: '', bookingId: '' });
  if (!user || user.role !== 'farmer') return <div className="wrap"><div className="alert alert-r">Farmer login required. <Link to="/login">Login</Link></div></div>;
  const myFarms = farms.filter(f => f.farmerId === user.id || f.farmerName === user.name);
  const myB = bookings.filter(b => myFarms.some(f => f.id === b.farmId));
  const revenue = myB.filter(b => b.payStatus === 'Confirmed').reduce((a, b) => a + b.total, 0);
  const menu: [string, string][] = [['farms', tx(lang, 'myFarms')], ['book', tx(lang, 'bookings')], ['help', tx(lang, 'help')], ['me', tx(lang, 'profile')]];
  return (
    <div className="dash">
      <div className="side">
        <div className="row"><Avatar u={user} size={44} /><div><b style={{ color: '#fff' }}>Farmer Studio</b><br /><span className="mut" style={{ color: '#d9e8e1' }}>{user.name}</span></div></div>
        {menu.map(([k, l]) => <a key={k} className={tab === k ? 'on' : ''} href="#" onClick={e => { e.preventDefault(); setTab(k); }}>{l}</a>)}
        <div style={{ marginTop: 10 }}><b>Alerts ({notifs.filter(n => n.userId === user.id && !n.read).length})</b>{notifs.filter(n => n.userId === user.id).slice(0, 4).map(n => <div key={n.id} style={{ fontSize: 12, background: '#ffffff14', padding: 8, borderRadius: 10, marginTop: 6 }}>{n.text}</div>)}</div>
      </div>
      <div className="main">
        {tab === 'me' && <>
          <PhotoPrompt text="Tourists book 2x more when they see the real host. Upload your photo — no model shots needed." />
          <ProfileHead stats={[
            { label: 'Live farms', value: myFarms.filter(f => f.verified).length },
            { label: 'Visits hosted', value: myB.filter(b => b.bookStatus === 'Completed').length },
            { label: 'Upcoming', value: myB.filter(b => b.bookStatus === 'Confirmed').length },
            { label: 'Earnings', value: `Rs.${revenue}` },
          ]} />
          <IdProofCard />
        </>}
        {tab === 'farms' && <>
          <PhotoPrompt text="Add your real photo from Profile so tourists recognise you at the gate." />
          <div className="sec-h"><h2>{tx(lang, 'myFarms')}</h2></div>
          <div className="grid3">{myFarms.map(f => <div className="card hover" key={f.id}><img src={f.image} className="cover" alt="" /><div className="card-b"><b>{f.name}</b> {f.verified ? <span className="chip">Verified</span> : <span className="chip gold">Pending Admin</span>}<div className="mut">{f.region} • cap {f.capacity}</div><div><b>Rs.{f.pricePerDay}</b> <span className="mut">≈ {usdt(f.pricePerDay)} USDT / person</span></div></div></div>)}</div>
          <h3>Add a farm (goes to Admin verification)</h3>
          <div className="card"><div className="card-b">
            <div className="row"><div><label>Farm name</label><input className="input" value={nf.name} onChange={e => setNf({ ...nf, name: e.target.value })} /></div>
              <div style={{ flex: 1 }}><label>Region — type or pick a district</label>
                <input className="input" list="fv-districts" value={nf.region} onChange={e => setNf({ ...nf, region: e.target.value })} placeholder="Start typing…" />
                <datalist id="fv-districts">{PLACES.map(p => <option key={p} value={p} />)}</datalist>
              </div>
              <div><label>Crop</label><input className="input" value={nf.crop} onChange={e => setNf({ ...nf, crop: e.target.value })} /></div></div>
            <label>Farm photos (tourists see these in Explore)</label>
            <input type="file" accept="image/*" onChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 1_200_000) { alert('Photo under 1.2 MB please.'); return; }
              const r = new FileReader();
              r.onload = () => setNf({ ...nf, img: String(r.result) });
              r.readAsDataURL(f);
            }} />
            {nf.img && <img src={nf.img} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, marginTop: 8 }} />}
            <div className="row"><div><label>Price / person (INR)</label><input className="input" value={nf.price} onChange={e => setNf({ ...nf, price: e.target.value })} /></div>
              <div><label>≈ USDT</label><input className="input" disabled value={usdt(+nf.price || 0)} /></div>
              <div><label>Capacity</label><input className="input" value={nf.capacity} onChange={e => setNf({ ...nf, capacity: e.target.value })} /></div></div>
            <div className="alert alert-g">Tourists will see <b>Rs.{+nf.price || 0} ≈ {usdt(+nf.price || 0)} USDT</b> per person.</div>
            <label>Description</label><textarea className="input" value={nf.desc} onChange={e => setNf({ ...nf, desc: e.target.value })} />
            <br /><button className="btn btn-g" onClick={() => {
              if (!nf.name || !nf.region) { alert('Name + region required'); return; }
              db.addFarm({ id: `farm-${Date.now()}`, name: nf.name, region: nf.region, crop: nf.crop || 'Mixed', image: nf.img || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop', rating: 4.5, pricePerDay: +nf.price || 2999, capacity: +nf.capacity || 20, activities: ['Farm walk', 'Village lunch'], facilities: ['Parking', 'Washrooms'], season: 'All season', farmerId: user.id, farmerName: user.name, verified: false, description: nf.desc });
              setNf({ name: '', region: PLACES[0], crop: '', price: '2999', capacity: '25', desc: '', img: '' });
              alert('Farm submitted for Admin verification!');
            }}>Submit farm</button>
          </div></div>
        </>}
        {tab === 'book' && <>
          <div className="sec-h"><h2>{tx(lang, 'bookings')}</h2></div>
          {myB.length === 0 && <p className="mut">No visits yet — share your farm link with tourists.</p>}
          {myB.map(b => <div className="card" key={b.id} style={{ marginBottom: 10 }}><div className="card-b">
            <div className="row" style={{ justifyContent: 'space-between' }}><b>{b.id}</b><span className="chip">{b.bookStatus}</span></div>
            <div>{b.touristName}{b.touristPhone ? ` • ${b.touristPhone}` : ''} • {b.date}{b.slot ? ` • ${b.slot}` : ''} • {b.visitors} guests • Rs.{b.total}</div>
            <div className="mut">Guide: {b.guideId ? `${b.guideName} (assigned)` : 'Not assigned yet'}</div>
            <div className="row" style={{ marginTop: 6 }}><button className="btn btn-g btn-sm" onClick={() => db.completeBooking(b.id)}>Mark completed</button></div></div></div>)}
        </>}
        {tab === 'help' && <>
          <h2>{tx(lang, 'help')}</h2>
          <div className="card"><div className="card-b">
            <label>Category</label><select className="input" value={cmp.category} onChange={e => setCmp({ ...cmp, category: e.target.value })}><option>Booking / visitor issue</option><option>Guide coordination</option><option>Platform issue</option><option>Payment query</option></select>
            <label>Subject</label><input className="input" value={cmp.subject} onChange={e => setCmp({ ...cmp, subject: e.target.value })} />
            <label>Detail</label><textarea className="input" value={cmp.detail} onChange={e => setCmp({ ...cmp, detail: e.target.value })} />
            <br /><button className="btn btn-g" onClick={() => { db.addComplaint({ userId: user.id, role: 'farmer', ...cmp, bookingId: cmp.bookingId }); alert('Submitted!'); }}>{tx(lang, 'submit')}</button>
          </div></div>
          {db.complaints.filter(c => c.userId === user.id).map(c => <div className="faq" key={c.id}><b>{c.id} • {c.subject}</b> <span className="chip">{c.status}</span>{c.replies.map((r, i) => <div key={i} className="alert alert-g">{r.text}</div>)}</div>)}
        </>}
      </div>
    </div>
  );
}

export function Guide() {
  const db = useDB();
  const { user, users, bookings, farms, notifs, guides, lang } = db;
  const [tab, setTab] = useState('tours');
  const [cmp, setCmp] = useState({ category: 'Tour assignment issue', subject: '', detail: '', bookingId: '' });
  if (!user || user.role !== 'guide') return <div className="wrap"><div className="alert alert-r">Guide login required. <Link to="/login">Login</Link></div></div>;
  const me = guides.find(g => g.userId === user.id);
  const myT = bookings.filter(b => b.guideId === me?.id);
  const menu: [string, string][] = [['tours', tx(lang, 'tours')], ['dir', tx(lang, 'directory')], ['help', tx(lang, 'help')], ['me', tx(lang, 'profile')]];
  return (
    <div className="dash">
      <div className="side">
        <div className="row"><Avatar u={user} size={44} /><div><b style={{ color: '#fff' }}>Guide Studio</b><br /><span className="mut" style={{ color: '#d9e8e1' }}>{user.name}</span></div></div>
        {menu.map(([k, l]) => <a key={k} className={tab === k ? 'on' : ''} href="#" onClick={e => { e.preventDefault(); setTab(k); }}>{l}</a>)}
      </div>
      <div className="main">
        {tab === 'me' && <>
          <PhotoPrompt text="Tourists choose guides with real photos. Upload yours — it shows on every tour you lead." />
          <ProfileHead stats={[
            { label: 'Tours done', value: myT.filter(b => b.bookStatus === 'Completed').length },
            { label: 'Upcoming', value: myT.filter(b => b.bookStatus === 'Confirmed').length },
            { label: 'Languages', value: me?.languages.length || 1 },
            { label: 'Rating', value: '4.8' },
          ]} />
          <div className="card"><div className="card-b"><b>{me?.name}</b><div className="mut">{me?.village} • {me?.languages.join(', ')} • {me?.experience}</div></div></div>
          <div className="card" style={{ marginTop: 12 }}><div className="card-b">
            <h3 style={{ margin: '0 0 4px' }}>Update my details</h3>
            <p className="mut">Keep your village, languages and experience fresh — tourists see this on every tour.</p>
            <GuideEditor />
          </div></div>
          <IdProofCard />
        </>}
        {tab === 'tours' && <>
          <PhotoPrompt text="No photo yet — tourists trust guides they can see. Set it from Profile." />
          <div className="sec-h"><h2>{tx(lang, 'tours')} ({myT.length})</h2></div>
          {myT.map(b => {
            const f = farms.find(x => x.id === b.farmId);
            return <div className="card" key={b.id} style={{ marginBottom: 10 }}><div className="card-b">
              <div className="row" style={{ justifyContent: 'space-between' }}><b>{b.id} • {b.farmName}</b><span className="chip">{b.bookStatus}</span></div>
              <div>Date: {b.date}{b.slot ? ` • ${b.slot}` : ''} • Tourist: {b.touristName}{b.touristPhone ? ` (${b.touristPhone})` : ''} • {b.visitors} guests</div>
              <div className="mut">Activities: {b.activities.join(', ') || 'All highlights'}</div>
              <div className="mut">Farm: {f?.region} • Farmer: {f?.farmerName}{f?.farmerName ? ` (${users.find(u => u.name === f?.farmerName)?.phone || ''})` : ''}</div>
            </div></div>;
          })}
          {myT.length === 0 && <p className="mut">No tours assigned yet. Admin assigns guides after payment confirmation.</p>}
          <p className="mut">Notifications: {notifs.filter(n => n.userId === user.id).length}</p>
        </>}
        {tab === 'dir' && <>
          <div className="sec-h"><h2>{tx(lang, 'directory')}</h2></div>
          <div className="dir-grid">
            {guides.filter(g => g.approved).map(g => {
              const u = users.find(x => x.id === g.userId);
              const tours = bookings.filter(b => b.guideId === g.id);
              return <div className="card hover" key={g.id}><div className="card-b" style={{ textAlign: 'center' }}>
                {u ? <Avatar u={u} size={72} /> : null}
                <b style={{ display: 'block', marginTop: 8 }}>{g.name}</b>
                <div className="mut">{g.village} • {g.languages.join(', ')}</div>
                <div className="mut">{g.experience}</div>
                <div className="row" style={{ justifyContent: 'center', marginTop: 6 }}>
                  <span className="chip">{tours.length} tours</span>
                  <span className="chip gold">{tours.filter(t => t.bookStatus === 'Confirmed').length} upcoming</span>
                </div>
              </div></div>;
            })}
          </div>
        </>}
        {tab === 'help' && <>
          <h2>{tx(lang, 'help')}</h2>
          <div className="card"><div className="card-b">
            <label>Category</label><select className="input" value={cmp.category} onChange={e => setCmp({ ...cmp, category: e.target.value })}><option>Tour assignment issue</option><option>Tourist issue</option><option>Farmer coordination</option><option>Itinerary issue</option></select>
            <label>Subject</label><input className="input" value={cmp.subject} onChange={e => setCmp({ ...cmp, subject: e.target.value })} />
            <label>Detail</label><textarea className="input" value={cmp.detail} onChange={e => setCmp({ ...cmp, detail: e.target.value })} />
            <br /><button className="btn btn-g" onClick={() => { db.addComplaint({ userId: user.id, role: 'guide', ...cmp, bookingId: cmp.bookingId }); alert('Submitted!'); }}>{tx(lang, 'submit')}</button>
          </div></div></>}
      </div>
    </div>
  );
}

export function SideIcon() { return <span style={{ display: 'inline-flex' }}>{I.leaf({ size: 15 })}</span>; }
