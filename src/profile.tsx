import { useRef, useState } from 'react';
import { useDB } from './store';
import { monogram, monoColor } from './reviews';
import { I } from './icons';
import type { User } from './types';

export function Avatar({ u, size = 92 }: { u: User; size?: number }) {
  if (u.photo) return <img src={u.photo} alt={u.name} className="avatar" style={{ width: size, height: size, fontSize: size / 3 }} />;
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size / 3, background: monoColor(u.name) }}>
      {monogram(u.name)}
    </span>
  );
}

/** Downscale any upload to a small JPEG data-URL (quota-safe for storage + cloud). */
export function fileToPhoto(file: File, maxDim = 800, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const r = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * r));
        const h = Math.max(1, Math.round(img.height * r));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d')!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL('image/jpeg', quality));
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

export function usePhotoUpload() {
  const db = useDB();
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState('');
  const pick = () => { setErr(''); ref.current?.click(); };
  const input = (
    <input ref={ref} type="file" accept="image/*" hidden onChange={async e => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const photo = await fileToPhoto(f);
        db.updateProfile({ photo });
      } catch { setErr('That photo could not be read. Try another one.'); }
    }} />
  );
  return { pick, input, err };
}

export function SyncBadge() {
  const { cloud } = useDB();
  return (
    <span className="chip" style={cloud ? {} : { background: '#fdf3d8', color: '#7a5a14' }} title={cloud ? 'All devices sync via cloud' : 'Demo runs on this device; tabs sync live'}>
      {cloud ? 'Cloud live' : 'Local demo'}
    </span>
  );
}

export function PhotoPrompt({ text }: { text: string }) {
  const { pick, input, err } = usePhotoUpload();
  const { user } = useDB();
  if (user?.photo) return null;
  return (
    <div className="photo-cta">
      <span><b>Show your real face.</b> {text}</span>
      <span>{input}<button className="btn btn-g btn-sm" onClick={pick}><span style={{ display: 'inline-flex' }}>{I.cam({ size: 15 })}</span>Upload photo</button></span>
      {err && <span className="mut">{err}</span>}
    </div>
  );
}

export function ProfileHead({ stats }: { stats: { label: string; value: string | number }[] }) {
  const { user, lang, setLang } = useDB();
  const { pick, input, err } = usePhotoUpload();
  if (!user) return null;
  return (
    <>
      <div className="prof-head anim">
        <div style={{ position: 'relative', zIndex: 1 }}><Avatar u={user} /></div>
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h2 style={{ margin: 0 }}>{user.name}</h2>
          <div style={{ color: '#cfe6d8', fontSize: 14, textTransform: 'capitalize' }}>{user.role} • {user.email || user.phone}{user.village ? ` • ${user.village}` : ''}</div>
          <div className="row" style={{ marginTop: 10 }}>
            {input}
            <button className="btn btn-sm" style={{ background: '#ffffff22', color: '#fff' }} onClick={pick}>
              <span style={{ display: 'inline-flex' }}>{I.cam({ size: 14 })}</span>{user.photo ? 'Change photo' : 'Upload photo'}
            </button>
            <button className="btn btn-sm" style={{ background: '#ffffff22', color: '#fff' }} onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}>
              <span style={{ display: 'inline-flex' }}>{I.globe({ size: 14 })}</span>{lang === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
          {err && <div style={{ color: '#ffd9a0', fontSize: 13 }}>{err}</div>}
        </div>
      </div>
      <div className="stat-cards">
        {stats.map((s, i) => <div className={`card ${i === 0 ? 'anim' : i === 1 ? 'anim-1' : i === 2 ? 'anim-2' : 'anim-3'}`} key={s.label}><div className="card-b"><b>{s.value}</b><div className="mut">{s.label}</div></div></div>)}
      </div>
    </>
  );
}
