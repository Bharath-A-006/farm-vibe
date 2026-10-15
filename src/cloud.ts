// VAYALOO cloud sync — optional cross-device realtime via Firestore REST (no SDK).
// Disabled by default: works only when VITE_FIREBASE_API_KEY + VITE_FIREBASE_PROJECT_ID
// are set. Until then every device runs the instant local demo (same-browser tabs sync live).
// Cloud doc: single document app/live { updatedAt, users, farms, bookings, complaints, guides, notifs }.
// Photos (data-URLs) stay device-local; everything else syncs.

export function cloudReady(): boolean {
  try {
    const e = (import.meta as any).env;
    return Boolean(e?.VITE_FIREBASE_API_KEY && e?.VITE_FIREBASE_PROJECT_ID);
  } catch { return false; }
}

function cfg() {
  const e = (import.meta as any).env;
  return { key: e.VITE_FIREBASE_API_KEY as string, pid: e.VITE_FIREBASE_PROJECT_ID as string };
}

function enc(v: any): any {
  if (v === null || v === undefined) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === 'object') {
    const fields: any = {};
    for (const k of Object.keys(v)) fields[k] = enc(v[k]);
    return { mapValue: { fields } };
  }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'string' && v.startsWith('data:')) return { stringValue: '' }; // photos stay local
  return { stringValue: v };
}

function dec(v: any): any {
  if (!v || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
  if ('mapValue' in v) {
    const o: any = {};
    for (const k of Object.keys(v.mapValue.fields || {})) o[k] = dec(v.mapValue.fields[k]);
    return o;
  }
  return null;
}

export interface CloudState {
  updatedAt: number;
  users: any[]; farms: any[]; bookings: any[];
  complaints: any[]; guides: any[]; notifs: any[];
}

export async function cloudPush(s: CloudState): Promise<void> {
  if (!cloudReady()) return;
  const { key, pid } = cfg();
  const fields = enc(s).mapValue.fields;
  const mask = Object.keys(fields).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/app/live?key=${encodeURIComponent(key)}&${mask}`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) }
  );
}

export async function cloudPull(): Promise<CloudState | null> {
  if (!cloudReady()) return null;
  const { key, pid } = cfg();
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/app/live?key=${encodeURIComponent(key)}`
  );
  if (!res.ok) return null;
  const j = await res.json();
  if (!j.fields) return null;
  return dec({ mapValue: { fields: j.fields } }) as CloudState;
}
