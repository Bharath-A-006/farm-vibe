import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Booking, Complaint, Farm, Guide, Notif, Role, User, Lang } from './types';
import { FARMS } from './data';

interface DB {
  users: User[];
  farms: Farm[];
  bookings: Booking[];
  complaints: Complaint[];
  guides: Guide[];
  notifs: Notif[];
  lang: Lang;
  user: User | null;
  setLang: (l: Lang) => void;
  login: (id: string, pass: string) => string | null;
  signupTourist: (name: string, email: string, phone: string, pass: string) => string | null;
  logout: () => void;
  createFarmer: (name: string, phone: string, pass: string) => void;
  createGuide: (name: string, village: string, phone: string, pass: string) => void;
  approveGuide: (id: string) => void;
  addFarm: (f: Farm) => void;
  verifyFarm: (id: string) => void;
  makeBooking: (b: Omit<Booking, 'id' | 'txnRef' | 'payAt' | 'payStatus' | 'bookStatus'>) => Booking;
  verifyPayment: (id: string, ok: boolean, reason?: string) => void;
  assignGuide: (bookingId: string, guideId: string) => void;
  completeBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
  addComplaint: (c: Omit<Complaint, 'id' | 'createdAt' | 'replies' | 'status'>) => void;
  replyComplaint: (id: string, text: string, status: Complaint['status']) => void;
  markRead: (id: string) => void;
  notify: (userId: string, text: string) => void;
  updateProfile: (patch: Partial<User>) => void;
  favs: string[];
  toggleFav: (farmId: string) => void;
  submitIdProof: (idType: string, idNumber: string, idDesc: string) => void;
  verifyId: (userId: string, ok: boolean) => void;
  updateGuideSelf: (patch: { village?: string; languages?: string[]; experience?: string }) => void;
}

const Ctx = createContext<DB | null>(null);
export const useDB = () => useContext(Ctx) as DB;

const LS = 'farmvibe_db_v1';
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

function seed(): Omit<DB, 'user' | 'lang' | keyof Function> & any {
  return {
    users: [
      { id: 'u-admin', role: 'admin', name: 'Admin', email: 'admin@farmvibe.in', password: 'admin123' },
      { id: 'u-tourist-demo', role: 'tourist', name: 'Divya', email: 'divya@demo.in', phone: '9842111122', password: 'demo123' },
      { id: 'u-farmer-1', role: 'farmer', name: 'Murugan K.', phone: '9842000111', password: 'farm123', approved: true, idType: 'Aadhaar', idNumber: 'XXXX-XXXX-4821', idDesc: 'Pollachi coconut farmer, 22 years. 60-acre grove with heritage house.', idStatus: 'verified' },
      { id: 'u-farmer-2', role: 'farmer', name: 'Lakshmi A.', phone: '9842000222', password: 'farm123', approved: true, idType: 'Aadhaar', idNumber: 'XXXX-XXXX-7734', idDesc: 'Ooty organic pioneer. Polyhouse vegetable farm and homestay host.', idStatus: 'verified' },
      { id: 'u-farmer-3', role: 'farmer', name: 'Selvi R.', phone: '9842000333', password: 'farm123', approved: true, idType: 'Voter ID', idNumber: 'TN/21/XXX452', idDesc: 'Madurai jasmine grower leading a 14-member women self-help group.', idStatus: 'verified' },
      { id: 'u-guide-1', role: 'guide', name: 'Karthik S.', phone: '9751000111', password: 'guide123', village: 'Pollachi', languages: ['Tamil', 'English'], approved: true, idType: 'Driving Licence', idNumber: 'TN38 XXXX9214', idDesc: 'Certified rural guide, 5 years, 120+ tours across Coimbatore belt.', idStatus: 'verified' },
      { id: 'u-guide-2', role: 'guide', name: 'Divya P.', phone: '9751000222', password: 'guide123', village: 'Ooty', languages: ['Tamil', 'English'], approved: true, idType: 'Aadhaar', idNumber: 'XXXX-XXXX-2098', idDesc: 'Nature-education guide specialising in Nilgiri flora and family groups.', idStatus: 'verified' },
    ],
    farms: FARMS,
    bookings: [],
    complaints: [],
    guides: [
      { id: 'g-1', userId: 'u-guide-1', name: 'Karthik S.', village: 'Pollachi', phone: '9751000111', languages: ['Tamil', 'English'], experience: '5 yrs • 120 tours', approved: true },
      { id: 'g-2', userId: 'u-guide-2', name: 'Divya P.', village: 'Ooty', phone: '9751000222', languages: ['Tamil', 'English'], experience: '4 yrs • Nature expert', approved: true },
    ],
    notifs: [],
  };
}

export function Provider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) {
        const d = JSON.parse(raw);
        setUsers(d.users); setFarms(d.farms); setBookings(d.bookings || []);
        setComplaints(d.complaints || []); setGuides(d.guides || []); setNotifs(d.notifs || []);
        setFavs(d.favs || []);
        const su = localStorage.getItem('farmvibe_session');
        if (su) {
          const found = (d.users as User[]).find(x => x.id === su);
          if (found) setUser(found);
        }
        return;
      }
    } catch {}
    const s = seed();
    setUsers(s.users); setFarms(s.farms); setBookings([]); setComplaints([]); setGuides(s.guides); setNotifs([]); setFavs([]);
  }, []);

  useEffect(() => {
    if (!users.length) return;
    localStorage.setItem(LS, JSON.stringify({ users, farms, bookings, complaints, guides, notifs, favs }));
  }, [users, farms, bookings, complaints, guides, notifs, favs]);

  // Live automation: when another tab (farmer/admin/tourist) changes data,
  // this tab updates instantly — no manual refresh needed.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== LS || !e.newValue) return;
      try {
        const d = JSON.parse(e.newValue);
        if (d.users) setUsers(d.users);
        if (d.farms) setFarms(d.farms);
        if (d.bookings) setBookings(d.bookings || []);
        if (d.complaints) setComplaints(d.complaints || []);
        if (d.guides) setGuides(d.guides || []);
        if (d.notifs) setNotifs(d.notifs || []);
        if (d.favs) setFavs(d.favs || []);
        setUser(prev => {
          if (!prev || !d.users) return prev;
          const still = (d.users as User[]).find(x => x.id === prev.id);
          return still || prev;
        });
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const notify = (userId: string, text: string) =>
    setNotifs(n => [{ id: uid('N'), userId, text, at: new Date().toLocaleString(), read: false }, ...n].slice(0, 200));

  const val: DB = useMemo(() => ({
    users, farms, bookings, complaints, guides, notifs, lang, user, favs,
    setLang,
    toggleFav: (farmId) => setFavs(f => f.includes(farmId) ? f.filter(x => x !== farmId) : [...f, farmId]),
    submitIdProof: (idType, idNumber, idDesc) => {
      if (!user) return;
      const patch = { idType, idNumber, idDesc, idStatus: 'pending' as const };
      setUsers(s => s.map(x => x.id === user.id ? { ...x, ...patch } : x));
      setUser({ ...user, ...patch });
      notify('u-admin', `ID verification pending: ${user.name} (${user.role}).`);
    },
    verifyId: (userId, ok) => {
      setUsers(s => s.map(x => {
        if (x.id !== userId) return x;
        if (ok) notify(userId, 'Your identity is verified. Welcome aboard!');
        else notify(userId, 'Identity verification was rejected. Please resubmit clear details.');
        return { ...x, idStatus: ok ? 'verified' as const : 'rejected' as const };
      }));
    },
    updateGuideSelf: (patch) => {
      if (!user) return;
      setGuides(g => g.map(x => x.userId === user.id ? { ...x, ...patch } : x));
      const upatch: Partial<User> = {};
      if (patch.village) upatch.village = patch.village;
      if (patch.languages) upatch.languages = patch.languages;
      setUsers(s => s.map(x => x.id === user.id ? { ...x, ...upatch } : x));
      setUser({ ...user, ...upatch });
      notify('u-admin', `Guide ${user.name} updated their profile.`);
    },
    login: (id, pass) => {
      const u = users.find(x => x.email === id || x.phone === id);
      if (!u) return 'Account not found. Tourists please Sign Up. Farmers/Guides use Admin-given credentials.';
      if (u.password !== pass) return 'Wrong password.';
      if ((u.role === 'farmer' || u.role === 'guide') && u.approved === false) return 'Waiting for Admin approval.';
      setUser(u);
      try { localStorage.setItem('farmvibe_session', u.id); } catch {}
      return null;
    },
    signupTourist: (name, email, phone, pass) => {
      if (users.some(x => (email && x.email === email) || (phone && x.phone === phone))) return 'Email/phone already exists. Please Login.';
      const u: User = { id: uid('U'), role: 'tourist', name, email, phone, password: pass };
      setUsers(s => [...s, u]); setUser(u);
      try { localStorage.setItem('farmvibe_session', u.id); } catch {}
      return null;
    },
    logout: () => { setUser(null); try { localStorage.removeItem('farmvibe_session'); } catch {} },
    createFarmer: (name, phone, pass) => {
      const u: User = { id: uid('U'), role: 'farmer', name, phone, password: pass, approved: true, idStatus: 'none' };
      setUsers(s => [...s, u]);
      notify('u-admin', `Farmer created: ${name} (${phone})`);
    },
    createGuide: (name, village, phone, pass) => {
      const u: User = { id: uid('U'), role: 'guide', name, phone, password: pass, village, languages: ['Tamil'], approved: true, idStatus: 'none' };
      setUsers(s => [...s, u]);
      setGuides(g => [...g, { id: uid('G'), userId: u.id, name, village, phone, languages: ['Tamil', 'English'], experience: 'New', approved: true }]);
    },
    approveGuide: (id) => {
      setGuides(g => g.map(x => x.id === id ? { ...x, approved: true } : x));
    },
    addFarm: (f) => setFarms(s => [{ ...f }, ...s]),
    verifyFarm: (id) => setFarms(s => s.map(f => f.id === id ? { ...f, verified: true } : f)),
    makeBooking: (b) => {
      const nb: Booking = {
        ...b, id: `FV-${Math.floor(1000 + Math.random() * 9000)}`,
        txnRef: `TXN${Date.now().toString().slice(-8)}`,
        payAt: new Date().toLocaleString(),
        payStatus: 'Pending Admin Verification',
        bookStatus: 'Payment Verification Pending',
      };
      setBookings(s => [nb, ...s]);
      notify('u-admin', `New payment ${nb.id} ₹${nb.total} — verify within 1 hour.`);
      notify(nb.touristId, `Payment Completed! ${nb.id} awaiting Admin verification (within 1 hour).`);
      return nb;
    },
    verifyPayment: (id, ok, reason) => {
      setBookings(s => s.map(b => {
        if (b.id !== id) return b;
        if (ok) {
          notify(b.touristId, `Payment Confirmed! Booking ${b.id} is Confirmed.`);
          if (b.guideId) {
            const g = guides.find(x => x.id === b.guideId);
            if (g) notify(g.userId, `Tour assigned: ${b.id} on ${b.date}.`);
          }
          notify(b.farmId, `New visit ${b.id}.`);
          return { ...b, payStatus: 'Confirmed', bookStatus: 'Confirmed' };
        }
        notify(b.touristId, `Payment Rejected for ${b.id}. Reason: ${reason || 'Check details'}.`);
        return { ...b, payStatus: 'Rejected', bookStatus: 'Rejected', rejectReason: reason };
      }));
    },
    assignGuide: (bookingId, guideId) => {
      const g = guides.find(x => x.id === guideId);
      setBookings(s => s.map(b => b.id === bookingId ? { ...b, guideId, guideName: g?.name } : b));
      if (g) notify(g.userId, `You are assigned to booking ${bookingId}.`);
    },
    completeBooking: (id) => setBookings(s => s.map(b => b.id === id ? { ...b, bookStatus: 'Completed' } : b)),
    cancelBooking: (id) => setBookings(s => s.map(b => b.id === id ? { ...b, bookStatus: 'Cancelled', payStatus: 'Refund Pending' } : b)),
    addComplaint: (c) => {
      const nc: Complaint = { ...c, id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: new Date().toLocaleString(), status: 'Submitted', replies: [] };
      setComplaints(s => [nc, ...s]);
      notify('u-admin', `New complaint ${nc.id} from ${c.role}.`);
    },
    replyComplaint: (id, text, status) => {
      setComplaints(s => s.map(c => {
        if (c.id !== id) return c;
        notify(c.userId, `Complaint ${c.id} → ${status}: ${text}`);
        return { ...c, status, replies: [...c.replies, { from: 'Admin', text, at: new Date().toLocaleString() }] };
      }));
    },
    markRead: (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x)),
    notify,
    updateProfile: (patch) => {
      if (!user) return;
      setUsers(s => s.map(x => x.id === user.id ? { ...x, ...patch } : x));
      setUser({ ...user, ...patch });
    },
  }), [users, farms, bookings, complaints, guides, notifs, lang, user, favs]);

  return <Ctx.Provider value={val}>{children}</Ctx.Provider>;
}

export function roleHome(r: Role) {
  return r === 'tourist' ? '/tourist' : r === 'farmer' ? '/farmer' : r === 'guide' ? '/guide' : '/panel-verify';
}
