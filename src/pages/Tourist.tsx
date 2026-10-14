import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '../store';
import { ProfileHead, PhotoPrompt, Avatar } from '../profile';
import { tx, FARMS as SEED_FARMS } from '../data';
import { usdt } from '../enrich';
import { I } from '../icons';

export function HeartBtn({ id }: { id: string }) {
  const { favs, toggleFav } = useDB();
  const on = favs.includes(id);
  return (
    <button className={`btn btn-o btn-sm fav-btn ${on ? 'fav-on' : ''}`} onClick={() => toggleFav(id)} title="Save to favourites">
      <span style={{ display: 'inline-flex', color: on ? '#c0392b' : undefined }}>{I.heart({ size: 14, filled: on })}</span>
    </button>
  );
}

export default function Tourist() {
  const db = useDB();
  const { user, farms, bookings, guides, notifs, lang, favs, toggleFav } = db;
  const [tab, setTab] = useState('explore');
  const [cmp, setCmp] = useState({ category: 'Booking issue', subject: '', detail: '', bookingId: '' });

  if (!user || user.role !== 'tourist') return <div className="wrap"><div className="alert alert-r">Tourist login required. <Link to="/login">Login</Link></div></div>;
  const myB = bookings.filter(b => b.touristId === user.id);
  const myN = notifs.filter(n => n.userId === user.id);
  const spent = myB.filter(b => b.payStatus === 'Confirmed').reduce((a, b) => a + b.total, 0);

  const side: [string, React.ReactNode][] = [
    ['explore', <span key="e" style={{ display: 'inline-flex' }}>{I.search({ size: 16 })}</span>],
    ['my', <span key="m" style={{ display: 'inline-flex' }}>{I.cal({ size: 16 })}</span>],
    ['fav', <span key="f" style={{ display: 'inline-flex' }}>{I.heart({ size: 16 })}</span>],
    ['help', <span key="h" style={{ display: 'inline-flex' }}>{I.chat({ size: 16 })}</span>],
    ['me', <span key="p" style={{ display: 'inline-flex' }}>{I.users({ size: 16 })}</span>],
  ];
  const sideLabel: Record<string, string> = { explore: tx(lang, 'explore'), my: tx(lang, 'myBookings'), fav: tx(lang, 'favorites'), help: tx(lang, 'help'), me: tx(lang, 'profile') };

  return (
    <div className="dash">
      <div className="side">
        <div className="row"><Avatar u={user} size={40} /><div><b style={{ color: '#fff' }}>{user.name}</b><br /><span className="mut" style={{ color: '#9fc3b2' }}>Tourist</span></div></div>
        {side.map(([k, ic]) => <a key={k} className={tab === k ? 'on' : ''} href="#" onClick={e => { e.preventDefault(); setTab(k); }}>{ic}{sideLabel[k]}{k === 'my' && myB.length > 0 ? ` (${myB.length})` : ''}</a>)}
        <div style={{ marginTop: 10 }}><b>Notifications ({myN.filter(n => !n.read).length})</b>{myN.slice(0, 4).map(n => <div key={n.id} style={{ fontSize: 12, background: '#ffffff14', padding: 8, borderRadius: 10, marginTop: 6 }}>{n.text}<br /><button className="btn btn-sm" style={{ background: '#ffffff2a', color: '#fff' }} onClick={() => db.markRead(n.id)}>mark read</button></div>)}</div>
      </div>
      <div className="main">
        {tab === 'explore' && <>
          <div className="sec-h"><h2>{tx(lang, 'explore')}</h2></div>
          <div className="grid3">{farms.filter(f => f.verified).map((f, i) => (
            <div className={`card hover ${i % 3 === 0 ? 'anim' : i % 3 === 1 ? 'anim-1' : 'anim-2'}`} key={f.id}>
              <img src={f.image} alt={f.name} className="cover" loading="lazy" />
              <div className="card-b">
                <div className="row"><b>{f.name}</b>{!SEED_FARMS.some(s => s.id === f.id) && <span className="chip gold">New</span>}</div>
                <div className="mut">{f.region} • <span className="stars">{I.star({ size: 13 })} {f.rating}</span></div>
                <div>{f.activities.slice(0, 2).map(a => <span className="chip" key={a}>{a}</span>)}</div>
                <div className="row" style={{ marginTop: 8, justifyContent: 'space-between' }}>
                  <b>Rs.{f.pricePerDay}<span className="mut">/person • ≈ {usdt(f.pricePerDay)} USDT</span></b>
                  <span className="row">
                    <HeartBtn id={f.id} />
                    <Link to={`/farm/${f.id}`}><button className="btn btn-g btn-sm">{tx(lang, 'viewDetails')}</button></Link>
                  </span>
                </div>
              </div>
            </div>))}
          </div>
          <h3>Certified guides</h3>
          <div className="row">{guides.filter(g => g.approved).map(g => <span className="chip blue" key={g.id}>{g.name} • {g.village}</span>)}</div>
        </>}

        {tab === 'my' && <>
          <div className="sec-h"><h2>{tx(lang, 'myBookings')}</h2></div>
          {myB.length === 0 && <div className="card"><div className="card-b" style={{ textAlign: 'center' }}><b>No bookings yet.</b><p className="mut">Discover an experience and book in 2 minutes.</p><Link to="/farms"><button className="btn btn-g btn-sm">Explore farms</button></Link></div></div>}
          {myB.map(b => (
            <div className="card" key={b.id} style={{ marginBottom: 12 }}><div className="card-b">
              <div className="row" style={{ justifyContent: 'space-between' }}><b>{b.id}</b><span className="chip">{b.bookStatus}</span></div>
              <div>{b.farmName} • {b.date}{b.slot ? ` • ${b.slot}` : ''} • {b.visitors} guests • Rs.{b.total} via {b.payMethod}</div>
              <div className="mut">TXN {b.txnRef} • {b.payAt}{b.guideName ? ` • Guide: ${b.guideName}` : ''}</div>
              {b.payStatus === 'Pending Admin Verification' && <div className="alert alert-y">Payment received — awaiting Admin verification (within 1 hour). Expected by 1 hour from {b.payAt}.</div>}
              {b.payStatus === 'Confirmed' && <div className="alert alert-g">Confirmed. Show this ID at the farm gate. Free cancellation up to 24h before.</div>}
              {b.payStatus === 'Rejected' && <div className="alert alert-r">Rejected: {b.rejectReason}</div>}
              {b.bookStatus !== 'Cancelled' && b.bookStatus !== 'Completed' && <button className="btn btn-o btn-sm" onClick={() => db.cancelBooking(b.id)}>Cancel (refund pending)</button>}
            </div></div>
          ))}
        </>}

        {tab === 'fav' && <>
          <div className="sec-h"><h2>{tx(lang, 'favorites')} ({favs.length})</h2></div>
          {favs.length === 0 && <p className="mut">Tap the heart on any farm to save it here.</p>}
          <div className="grid3">{farms.filter(f => favs.includes(f.id)).map(f => <div className="card hover" key={f.id}><img src={f.image} className="cover" alt="" /><div className="card-b"><b>{f.name}</b><div className="mut">{f.region} • Rs.{f.pricePerDay}</div><div className="row" style={{ marginTop: 6 }}><HeartBtn id={f.id} /><Link to={`/farm/${f.id}`}><button className="btn btn-g btn-sm">View & Book</button></Link></div></div></div>)}</div>
        </>}

        {tab === 'help' && <>
          <h2>Customer service</h2>
          <div className="card"><div className="card-b">
            <label>Category</label><select className="input" value={cmp.category} onChange={e => setCmp({ ...cmp, category: e.target.value })}><option>Booking issue</option><option>Payment / verification delay</option><option>Refund request</option><option>Farm complaint</option><option>Guide complaint</option><option>Transport / food / stay</option></select>
            <label>Subject</label><input className="input" value={cmp.subject} onChange={e => setCmp({ ...cmp, subject: e.target.value })} />
            <label>Booking ID (if any)</label><input className="input" value={cmp.bookingId} onChange={e => setCmp({ ...cmp, bookingId: e.target.value })} />
            <label>Detail</label><textarea className="input" rows={3} value={cmp.detail} onChange={e => setCmp({ ...cmp, detail: e.target.value })} />
            <br /><button className="btn btn-g" onClick={() => { if (!cmp.subject || !cmp.detail) { alert('Subject + detail required'); return; } db.addComplaint({ userId: user.id, role: 'tourist', ...cmp }); setCmp({ category: 'Booking issue', subject: '', detail: '', bookingId: '' }); alert('Complaint submitted!'); }}>Submit ticket</button>
          </div></div>
          <h3>My tickets</h3>
          {db.complaints.filter(c => c.userId === user.id).map(c => <div className="faq" key={c.id}><b>{c.id} • {c.subject}</b> <span className="chip">{c.status}</span><p className="mut">{c.detail}</p>{c.replies.map((r, i) => <div key={i} className="alert alert-g"><b>{r.from}:</b> {r.text}</div>)}</div>)}
        </>}

        {tab === 'me' && <>
          <PhotoPrompt text="Tourists with photos get faster host confirmations." />
          <ProfileHead stats={[
            { label: 'Trips booked', value: myB.length },
            { label: 'Confirmed spend', value: `Rs.${spent}` },
            { label: 'Favorites', value: favs.length },
            { label: 'Support tickets', value: db.complaints.filter(c => c.userId === user.id).length },
          ]} />
          <h3>Recent activity</h3>
          {myB.slice(0, 5).map(b => <div className="faq" key={b.id}><b>{b.id}</b> • {b.farmName} • {b.date} <span className="chip">{b.bookStatus}</span></div>)}
          {myB.length === 0 && <p className="mut">No trips yet — your history will appear here.</p>}
        </>}
      </div>
    </div>
  );
}
