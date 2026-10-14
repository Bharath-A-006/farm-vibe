import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '../store';
import { tx } from '../data';
import { Avatar } from '../profile';

function overdue(payAt: string) {
  const t = new Date(payAt).getTime();
  if (isNaN(t)) return false;
  return Date.now() - t > 60 * 60 * 1000;
}

export default function Admin() {
  const db = useDB();
  const { user, users, farms, bookings, complaints, guides, lang } = db;
  const [tab, setTab] = useState('pay');
  const [ff, setFf] = useState({ name: '', phone: '', pass: '' });
  const [gf, setGf] = useState({ name: '', village: '', phone: '', pass: '' });
  const [reason, setReason] = useState('');
  const [reply, setReply] = useState('');
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [uFilter, setUFilter] = useState<'all' | 'tourist' | 'farmer' | 'guide'>('all');
  const [uSearch, setUSearch] = useState('');

  if (!user || user.role !== 'admin') return <div className="wrap"><div className="alert alert-r">Private Admin access only. <Link to="/panel-verify-login">Admin Login</Link></div></div>;

  const pending = bookings.filter(b => b.payStatus === 'Pending Admin Verification');
  const openC = complaints.filter(c => c.status !== 'Closed' && c.status !== 'Resolved');
  const pendingId = users.filter(u => (u.role === 'farmer' || u.role === 'guide') && u.idStatus === 'pending');
  const menu: [string, string][] = [
    ['pay', `${tx(lang, 'payments')} (${pending.length})`],
    ['verify', `Verify (${pendingId.length})`],
    ['farms', 'Farms'],
    ['book', `${tx(lang, 'bookings')}`],
    ['users', `${tx(lang, 'users')} (${users.length})`],
    ['guides', `${tx(lang, 'guides')}`],
    ['help', `${tx(lang, 'complaints')} (${openC.length})`],
    ['reports', tx(lang, 'reports')],
  ];
  const counts = useMemo(() => ({
    all: users.length,
    tourist: users.filter(u => u.role === 'tourist').length,
    farmer: users.filter(u => u.role === 'farmer').length,
    guide: users.filter(u => u.role === 'guide').length,
  }), [users]);
  const ulist = users.filter(u =>
    (uFilter === 'all' || u.role === uFilter) &&
    (u.name + (u.email || '') + (u.phone || '')).toLowerCase().includes(uSearch.toLowerCase())
  );

  return (
    <div className="dash">
      <div className="side"><b style={{ color: '#fff' }}>Admin Console</b><span className="mut" style={{ color: '#d9e8e1' }}>Investor-grade control</span>
        {menu.map(([k, l]) => <a key={k} className={tab === k ? 'on' : ''} href="#" onClick={e => { e.preventDefault(); setTab(k); }}>{l}</a>)}
      </div>
      <div className="main">
        {tab === 'pay' && <>
          <div className="sec-h"><h2>Payment Verification</h2></div>
          <p className="mut">1-hour SLA. Overdue items are highlighted red.</p>
          {pending.length === 0 && <div className="alert alert-g">No pending payments. All clear.</div>}
          {pending.map(b => (
            <div className="card" key={b.id} style={{ marginBottom: 10, border: overdue(b.payAt) ? '2px solid #c0392b' : undefined }}><div className="card-b">
              <b>{b.id}</b> • {b.touristName} • {b.farmName} • Rs.{b.total} via {b.payMethod}
              <div className="mut">TXN {b.txnRef} • {b.payAt} • Gateway: verified (server-side)</div>
              {overdue(b.payAt) ? <div className="alert alert-r">OVERDUE — beyond 1 hour! Verify now.</div> : <div className="alert alert-y">Expected within 1 hour from payment.</div>}
              <div className="row">
                <button className="btn btn-g btn-sm" onClick={() => db.verifyPayment(b.id, true)}>Confirm</button>
                <input className="input" style={{ maxWidth: 260 }} placeholder="Reject reason (required)" value={reason} onChange={e => setReason(e.target.value)} />
                <button className="btn btn-o btn-sm" onClick={() => { if (!reason) { alert('Rejection reason required'); return; } db.verifyPayment(b.id, false, reason); setReason(''); }}>Reject</button>
              </div>
            </div></div>
          ))}
          <h3>History</h3>
          <table className="table"><thead><tr><th>ID</th><th>Amount</th><th>Payment</th><th>Booking</th></tr></thead><tbody>
            {bookings.filter(b => b.payStatus !== 'Pending Admin Verification').map(b => <tr key={b.id}><td>{b.id}</td><td>Rs.{b.total}</td><td>{b.payStatus}</td><td>{b.bookStatus}</td></tr>)}
          </tbody></table>
        </>}

        {tab === 'verify' && <>
          <div className="sec-h"><h2>Identity Verification — Farmers & Guides</h2></div>
          <p className="mut">Review each person's ID proof and description, then verify or reject.</p>
          {pendingId.length === 0 && <div className="alert alert-g">No pending verifications. All hosts verified.</div>}
          {pendingId.map(u => (
            <div className="card" key={u.id} style={{ marginBottom: 10 }}><div className="card-b">
              <div className="row">
                <Avatar u={u} size={52} />
                <div style={{ flex: 1 }}>
                  <b>{u.name}</b> <span className="chip blue">{u.role}</span> <span className="chip gold">ID pending</span>
                  <div className="mut">{u.phone}{u.village ? ` • ${u.village}` : ''}</div>
                  <div><b>ID:</b> {u.idType} {u.idNumber}</div>
                  <p className="mut" style={{ margin: '4px 0' }}>{u.idDesc}</p>
                </div>
                <span className="row">
                  <button className="btn btn-g btn-sm" onClick={() => db.verifyId(u.id, true)}>Verify</button>
                  <button className="btn btn-o btn-sm" onClick={() => db.verifyId(u.id, false)}>Reject</button>
                </span>
              </div>
            </div></div>
          ))}
          <h3>Verification history</h3>
          <div className="row">{users.filter(u => (u.role === 'farmer' || u.role === 'guide') && u.idStatus && u.idStatus !== 'pending' && u.idStatus !== 'none').map(u => <span className="chip" key={u.id}>{u.name}: {u.idStatus}</span>)}</div>
        </>}

        {tab === 'farms' && <>
          <div className="sec-h"><h2>Farm Verification</h2></div>
          {farms.filter(f => !f.verified).map(f => <div className="card" key={f.id} style={{ marginBottom: 8 }}><div className="card-b"><b>{f.name}</b> • {f.region} • by {f.farmerName}<div className="row" style={{ marginTop: 6 }}><button className="btn btn-g btn-sm" onClick={() => db.verifyFarm(f.id)}>Verify</button></div></div></div>)}
          {farms.filter(f => !f.verified).length === 0 && <p className="mut">All farms verified.</p>}
          <h3>All farms ({farms.length})</h3>
          <div className="row">{farms.map(f => <span className="chip" key={f.id}>{f.name} {f.verified ? '✓' : 'pending'}</span>)}</div>
        </>}

        {tab === 'book' && <>
          <div className="sec-h"><h2>{tx(lang, 'bookings')} + Guide Assignment</h2></div>
          {bookings.map(b => (
            <div className="card" key={b.id} style={{ marginBottom: 8 }}><div className="card-b">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>{b.id} • {b.farmName} • {b.date}{b.slot ? ` • ${b.slot}` : ''}</b>
                {b.guideId
                  ? <span className="chip">Assigned: {b.guideName}</span>
                  : <span className="chip gold">Guide unassigned</span>}
              </div>
              <div className="mut">{b.touristName} • {b.visitors} guests • Rs.{b.total} • {b.bookStatus}</div>
              <div className="row" style={{ marginTop: 6 }}>
                <select className="input" style={{ maxWidth: 220 }} value={assign[b.id] || b.guideId || ''} onChange={e => setAssign({ ...assign, [b.id]: e.target.value })}>
                  <option value="">— assign guide —</option>{guides.filter(g => g.approved).map(g => <option key={g.id} value={g.id}>{g.name} ({g.village})</option>)}
                </select>
                <button className="btn btn-o btn-sm" onClick={() => { if (assign[b.id]) db.assignGuide(b.id, assign[b.id]); }}>Assign</button>
                {b.payStatus === 'Refund Pending' && <button className="btn btn-g btn-sm" onClick={() => db.verifyPayment(b.id, false, 'Refunded via gateway')}>Mark Refunded</button>}
              </div>
            </div></div>
          ))}
          {bookings.length === 0 && <p className="mut">No bookings yet.</p>}
        </>}

        {tab === 'users' && <>
          <div className="sec-h"><h2>{tx(lang, 'users')}</h2></div>
          <div className="row" style={{ marginBottom: 10 }}>
            {(['all', 'tourist', 'farmer', 'guide'] as const).map(f => (
              <button key={f} className={`btn btn-sm ${uFilter === f ? 'btn-g' : 'btn-o'}`} onClick={() => setUFilter(f)}>
                {f === 'all' ? 'All' : f + 's'} ({counts[f]})
              </button>
            ))}
            <input className="input" style={{ maxWidth: 220 }} placeholder="Search name / email / phone" value={uSearch} onChange={e => setUSearch(e.target.value)} />
          </div>
          {ulist.map(u => (
            <div className="card" key={u.id} style={{ marginBottom: 8 }}><div className="card-b">
              <div className="row">
                <Avatar u={u} size={46} />
                <div style={{ flex: 1 }}>
                  <b>{u.name}</b> <span className="chip blue">{u.role}</span>
                  {(u.role === 'farmer' || u.role === 'guide') && (
                    <span className={`chip ${u.idStatus === 'verified' ? '' : u.idStatus === 'pending' ? 'gold' : 'red'}`}>
                      ID: {u.idStatus || 'none'}
                    </span>
                  )}
                  <div className="mut">{u.email || u.phone}{u.village ? ` • ${u.village}` : ''}</div>
                  {(u.role === 'farmer' || u.role === 'guide') && (u.idType || u.idDesc) && (
                    <div className="mut">ID: {u.idType} {u.idNumber} — {u.idDesc}</div>
                  )}
                </div>
                {(u.role === 'farmer' || u.role === 'guide') && u.idStatus === 'pending' && (
                  <span className="row">
                    <button className="btn btn-g btn-sm" onClick={() => db.verifyId(u.id, true)}>Verify ID</button>
                    <button className="btn btn-o btn-sm" onClick={() => db.verifyId(u.id, false)}>Reject</button>
                  </span>
                )}
              </div>
            </div></div>
          ))}
          {ulist.length === 0 && <p className="mut">No users in this segment.</p>}
          <div className="grid3" style={{ marginTop: 14 }}>
            <div className="card"><div className="card-b"><h3>New Farmer</h3>
              <label>Name</label><input className="input" value={ff.name} onChange={e => setFf({ ...ff, name: e.target.value })} />
              <label>Phone</label><input className="input" value={ff.phone} onChange={e => setFf({ ...ff, phone: e.target.value })} />
              <label>Password</label><input className="input" value={ff.pass} onChange={e => setFf({ ...ff, pass: e.target.value })} />
              <br /><button className="btn btn-g btn-sm" onClick={() => { if (!ff.name || !ff.phone || !ff.pass) { alert('All fields required'); return; } db.createFarmer(ff.name, ff.phone, ff.pass); setFf({ name: '', phone: '', pass: '' }); }}>Create Farmer</button>
            </div></div>
            <div className="card"><div className="card-b"><h3>New Guide</h3>
              <label>Name</label><input className="input" value={gf.name} onChange={e => setGf({ ...gf, name: e.target.value })} />
              <label>Village</label><input className="input" value={gf.village} onChange={e => setGf({ ...gf, village: e.target.value })} />
              <label>Phone</label><input className="input" value={gf.phone} onChange={e => setGf({ ...gf, phone: e.target.value })} />
              <label>Password</label><input className="input" value={gf.pass} onChange={e => setGf({ ...gf, pass: e.target.value })} />
              <br /><button className="btn btn-g btn-sm" onClick={() => { if (!gf.name || !gf.phone || !gf.pass) { alert('Required'); return; } db.createGuide(gf.name, gf.village, gf.phone, gf.pass); setGf({ name: '', village: '', phone: '', pass: '' }); }}>Create Guide</button>
            </div></div>
            <div className="card"><div className="card-b"><h3>Policy</h3><p className="mut">Tourist signup is public. Farmer, guide and admin accounts are created here only. Identity proof is verified per profile.</p></div></div>
          </div>
        </>}

        {tab === 'guides' && <>
          <div className="sec-h"><h2>{tx(lang, 'guides')}</h2></div>
          {guides.map(g => <div className="card" key={g.id} style={{ marginBottom: 8 }}><div className="card-b"><b>{g.name}</b> • {g.village} • {g.phone} {g.approved ? <span className="chip">Approved</span> : <span className="chip">Pending</span>}
            {!g.approved && <button className="btn btn-g btn-sm" style={{ marginLeft: 8 }} onClick={() => db.approveGuide(g.id)}>Approve</button>}</div></div>)}
        </>}

        {tab === 'help' && <>
          <div className="sec-h"><h2>{tx(lang, 'complaints')} — Open: {openC.length}</h2></div>
          {openC.length === 0 && <div className="alert alert-g">All complaints resolved. Open count: 0.</div>}
          {complaints.map(c => (
            <div className="card" key={c.id} style={{ marginBottom: 8 }}><div className="card-b">
              <b>{c.id}</b> [{c.role}] <b>{c.subject}</b> <span className="chip">{c.status}</span>
              <p className="mut">{c.detail} {c.bookingId && `(Booking ${c.bookingId})`} • {c.createdAt}</p>
              {c.replies.map((r, i) => <div key={i} className="alert alert-g">{r.from}: {r.text}</div>)}
              <div className="row"><input className="input" style={{ maxWidth: 300 }} placeholder="Admin response…" value={reply} onChange={e => setReply(e.target.value)} />
                {(['Under Review', 'In Progress', 'Resolved', 'Closed'] as const).map(s => <button key={s} className="btn btn-o btn-sm" onClick={() => { if (!reply) { alert('Response required'); return; } db.replyComplaint(c.id, reply, s); setReply(''); }}>{s}</button>)}
              </div>
            </div></div>
          ))}
        </>}

        {tab === 'reports' && <>
          <div className="sec-h"><h2>{tx(lang, 'reports')} & Analytics</h2></div>
          <div className="kpi">
            <div className="card"><div className="card-b"><span className="mut">Revenue (confirmed)</span><br /><b>Rs.{bookings.filter(b => b.payStatus === 'Confirmed').reduce((a, b) => a + b.total, 0)}</b></div></div>
            <div className="card"><div className="card-b"><span className="mut">Bookings</span><br /><b>{bookings.length}</b></div></div>
            <div className="card"><div className="card-b"><span className="mut">Open complaints</span><br /><b>{openC.length}</b></div></div>
            <div className="card"><div className="card-b"><span className="mut">Overdue payments</span><br /><b>{pending.filter(b => overdue(b.payAt)).length}</b></div></div>
          </div>
          <div className="kpi">
            <div className="card"><div className="card-b"><span className="mut">Tourists</span><br /><b>{counts.tourist}</b></div></div>
            <div className="card"><div className="card-b"><span className="mut">Farmers</span><br /><b>{counts.farmer}</b></div></div>
            <div className="card"><div className="card-b"><span className="mut">Guides</span><br /><b>{counts.guide}</b></div></div>
            <div className="card"><div className="card-b"><span className="mut">Verified farms</span><br /><b>{farms.filter(f => f.verified).length}</b></div></div>
          </div>
        </>}
      </div>
    </div>
  );
}
