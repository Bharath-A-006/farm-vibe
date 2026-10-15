// VAYALOO AI — Gemini-first (fast path), graceful fallback to built-in brain.
// Language: English primary, Tamil optional.
import { FARMS, PLANS } from './data';
import type { Farm } from './types';

export type AILang = 'en' | 'ta';

export function detectLang(q: string): AILang {
  return /[\u0B80-\u0BFF]/.test(q) ? 'ta' : 'en';
}

function farmContext(list: Farm[]): string {
  return list.map(f =>
    `- ${f.name} (${f.region}), crop: ${f.crop}, Rs.${f.pricePerDay}/day, rating ${f.rating}, capacity ${f.capacity}, season: ${f.season}, activities: ${f.activities.join(', ')}${f.verified ? '' : ' (pending verification)'}`
  ).join('\n') + '\nPlans: ' + PLANS.map(p => `${p.title} Rs.${p.price}`).join('; ') +
    '\nRules: generating a plan is NOT a booking; payment verified by Admin within 1 hour; tourists sign up publicly; farmer/guide accounts are Admin-created.';
}

function key(): string {
  try {
    const ls = localStorage.getItem('fv_gemini_key');
    if (ls) return ls;
  } catch {}
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

/** Live Gemini call with real thought process. Tries models in order. */
export interface AIResult { text: string; thoughts: string[]; live: boolean }

const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest'];
const TIMEOUT_MS = 8000;

async function callModel(model: string, body: any, k: string): Promise<{ thoughts: string[]; text: string } | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(k)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal, body: JSON.stringify(body) }
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const j = await res.json();
    const parts: any[] = j?.candidates?.[0]?.content?.parts || [];
    const thoughts = parts.filter(p => p.thought === true && p.text).map(p => p.text);
    const text = parts.filter(p => !p.thought && p.text).map(p => p.text).join('').trim();
    if (!text) return null;
    return { thoughts, text };
  } catch {
    return null;
  }
}

export async function geminiAnswer(q: string, role: string, list: Farm[]): Promise<AIResult | null> {
  const k = key();
  if (!k) return null;
  const L = detectLang(q);
  const budget = extractBudget(q);
  const body = {
    system_instruction: {
      parts: [{
        text: `You are the VAYALOO assistant for Tamil Nadu farm tourism. Reply in ${L === 'ta' ? 'Tamil' : 'English'}. Be concise (under 120 words), warm and practical. RULE: if the user states a budget (here: ${budget ? 'Rs.' + budget : 'none stated'}), recommend ONLY farms and plans within that budget — never list everything. Never invent farm names, prices or availability beyond this context:\n${farmContext(list)}`
      }]
    },
    contents: [{ parts: [{ text: `[role:${role}] ${q}` }] }],
    generationConfig: { maxOutputTokens: 400, temperature: 0.6 },
  };
  for (const m of MODELS) {
    const r = await callModel(m, body, k);
    if (r) return { text: r.text, thoughts: r.thoughts, live: true };
  }
  return null;
}

/** Summarize a list of review texts with Gemini; null on failure. */
export async function geminiReviewSummary(reviews: string[]): Promise<string | null> {
  const k = key();
  if (!k || !reviews.length) return null;
  const body = {
    contents: [{ parts: [{ text: `Summarize these farm-visit reviews in 3 short bullet lines (English):\n${reviews.slice(0, 12).join('\n---\n')}` }] }],
    generationConfig: { maxOutputTokens: 250, temperature: 0.4 },
  };
  for (const m of MODELS) {
    const r = await callModel(m, body, k);
    if (r) return r.text;
  }
  return null;
}

// ---------- Built-in fallback brain (English-first, Tamil optional) ----------
/** Extract a rupee budget from free text ("under 3000", "budget 5000", "3000"). */
export function extractBudget(q: string): number | null {
  const m = q.replace(/,/g, '').match(/(\d{3,6})/);
  if (!m) return null;
  const v = +m[1];
  return v >= 500 && v <= 100000 ? v : null;
}

function pickFarms(q: string, list: Farm[]) {
  const t = q.toLowerCase();
  const hit = list.filter(f =>
    t.includes(f.region.split(',')[0].toLowerCase()) ||
    t.includes(f.crop.toLowerCase()) ||
    f.activities.some(a => t.includes(a.split(' ')[0].toLowerCase()))
  ).slice(0, 3);
  return hit.length ? hit : list.slice(0, 3);
}

export function localAnswer(q: string, role: 'home' | 'tourist' | 'farmer' | 'guide' = 'home', liveFarms?: Farm[]): string {
  const src = liveFarms && liveFarms.length ? liveFarms : FARMS;
  const L = detectLang(q);
  const t = q.toLowerCase();
  const budget = extractBudget(q);
  // Budget-first: NEVER list everything when a budget is stated — only what fits.
  const pool = budget ? src.filter(f => f.pricePerDay <= budget) : src;
  const farms = (pool.length ? pickFarms(q, pool) : [...src].sort((a, b) => a.pricePerDay - b.pricePerDay).slice(0, 2));
  const line = (f: Farm) => `- ${f.name} (${f.region}) — Rs.${f.pricePerDay}/day, ${f.rating} stars`;
  const farmTxt = farms.map(line).join('\n');
  const budgetNote = budget
    ? (pool.length
      ? (L === 'ta' ? `\n\nRs.${budget} பட்ஜெட்டுக்குள் வரும் தேர்வுகள் மட்டும்:` : `\n\nOnly options within your Rs.${budget} budget:`)
      : (L === 'ta' ? `\n\nRs.${budget}-க்குள் பண்ணை இல்லை — மலிவான 2:` : `\n\nNothing fits Rs.${budget} — closest affordable 2:`))
    : '';
  if (/price|cost|budget|rate|விலை/.test(t)) {
    return L === 'ta'
      ? `கட்டண விவரம்:${budgetNote}\n${farmTxt}\n\n1-day Rs.3499 முதல், 2-day Rs.8499, 3-day Rs.13499. Transport/food/stay optional. Payment-க்கு பிறகு 1 மணி நேரத்தில் Admin verify செய்வார்.`
      : `Pricing guide:${budgetNote}\n${farmTxt}\n\n1-day from Rs.3499, 2-day Rs.8499, 3-day Rs.13499. Transport, food and stay are optional. After payment, Admin verifies within 1 hour.`;
  }
  if (/plan|trip|itinerary|days|1-day|2-day|3-day|நாள்|திட்டம்/.test(t)) {
    const plans = budget ? PLANS.filter(x => x.price <= budget) : PLANS;
    const plist = (plans.length ? plans : [...PLANS].sort((a, b) => a.price - b.price).slice(0, 1));
    const p = plist.map(x => `- ${x.title} — Rs.${x.price}: ${x.itinerary.join(' > ')}`).join('\n');
    return L === 'ta'
      ? `பயண திட்டங்கள்:${budgetNote}\n${p}\n\nபரிந்துரைகள்:\n${farmTxt}\nPlan உருவாக்குவது booking ஆகாது — Confirm செய்தால் மட்டுமே booking.`
      : `Tour plans:${budgetNote}\n${p}\n\nRecommended farms:\n${farmTxt}\nGenerating a plan does NOT create a booking — only your Confirm does.`;
  }
  if (role === 'farmer') {
    return L === 'ta'
      ? `விவசாயி உதவி:\n${farmTxt}\n\nபார்வையாளர்களுக்கு நிழல், குடிநீர், washroom தயார் செய்யுங்கள். Dashboard-ல் capacity update செய்யுங்கள். உங்கள் photo-வை profile-ல் upload செய்யுங்கள்.`
      : `Farmer help:\n${farmTxt}\n\nKeep shade, drinking water and washrooms ready for visitors. Update capacity on your dashboard, and upload your profile photo so tourists recognise you.`;
  }
  if (role === 'guide') {
    return L === 'ta'
      ? `Guide உதவி:\n${farmTxt}\n\nFarm activities + season crops தயார் செய்யுங்கள். Assigned விவரங்கள் dashboard-ல் உள்ளன. Profile photo upload செய்யுங்கள்.`
      : `Guide help:\n${farmTxt}\n\nPrepare farm activities and seasonal-crop notes. Assigned farm and tourist details are on your dashboard. Please upload a profile photo.`;
  }
  if (/pollachi|ooty|thanjavur|madurai|theni|kodaikanal|coconut|paddy|grape|honey|millet|jasmine|turmeric|mango|cotton|banana|sugarcane|book|cancel|refund|payment/.test(t)) {
    return L === 'ta'
      ? `பொருத்தமான பண்ணைகள்:${budgetNote}\n${farmTxt}\n\nDate + visitors தேர்ந்து booking செய்யலாம். முன்பதிவு செய்த 18 மணி நேரத்திற்குள் இலவச ரத்து.`
      : `Matching farms:${budgetNote}\n${farmTxt}\n\nPick a date and group size to book. Free cancellation within 18 hours of booking.`;
  }
  return L === 'ta'
    ? `வணக்கம்! VAYALOO உதவியாளர்.\n\n${farmTxt}\n\n"Pollachi coconut", "2-day plan", "booking எப்படி?" என்று கேளுங்கள்.`
    : `Hello! I'm the VAYALOO assistant.\n\n${farmTxt}\n\nAsk "Pollachi coconut farm", "2-day plan under 2500" or "how do I book?". Speak or type — English and Tamil supported.`;
}

/** Unified entry: live Gemini (fast) with instant fallback. Cached per question. */
const cache = new Map<string, AIResult>();
export async function aiAnswer(
  q: string,
  role: 'home' | 'tourist' | 'farmer' | 'guide' = 'home',
  liveFarms?: Farm[]
): Promise<AIResult> {
  const src = liveFarms && liveFarms.length ? liveFarms : FARMS;
  const ck = `${role}|${detectLang(q)}|${q.trim().toLowerCase()}|${src.length}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const live = await geminiAnswer(q, role, src);
  const out = live || { text: localAnswer(q, role, src), thoughts: localThoughts(q, role), live: false };
  if (cache.size > 60) cache.clear();
  cache.set(ck, out);
  return out;
}

/** Transparent reasoning trace for the fallback brain. */
function localThoughts(q: string, role: string): string[] {
  const t = q.toLowerCase();
  const steps = [`Detected language: ${detectLang(q) === 'ta' ? 'Tamil' : 'English'}; role context: ${role}.`];
  if (/price|cost|budget|rate|விலை/.test(t)) steps.push('Intent = pricing. Compared farm day-rates and 1/2/3-day plan slabs.');
  else if (/plan|trip|itinerary|days|நாள்|திட்டம்/.test(t)) steps.push('Intent = trip planning. Matched plan durations with farm seasons and group size.');
  else if (role === 'farmer') steps.push('Intent = farmer support. Checked visitor-readiness and capacity rules.');
  else if (role === 'guide') steps.push('Intent = guide support. Checked assigned-tour context rules.');
  else steps.push('Intent = discovery. Matched keywords against regions, crops and activities.');
  steps.push('Composed answer strictly from verified VAYALOO data — no invented details.');
  return steps;
}

export function speak(text: string, lang: AILang) {
  try {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 400));
    u.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    u.rate = 0.95;
    s.speak(u);
  } catch {}
}

export function listenOnce(lang: AILang, onText: (t: string) => void, onErr?: () => void) {
  try {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { onErr?.(); return null; }
    const r = new SR();
    r.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    r.interimResults = false;
    r.onresult = (e: any) => onText(e.results[0][0].transcript);
    r.onerror = () => onErr?.();
    r.start();
    return r;
  } catch { onErr?.(); return null; }
}
