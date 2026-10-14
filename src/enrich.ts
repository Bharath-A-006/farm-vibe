// Discovery + PDP enrichment: durations, slots, inclusions, itineraries, galleries, deals.
import type { Farm } from './types';
export interface FarmExtra {
  durationHrs: number;
  slots: string[];
  timeOfDay: ('Morning' | 'Afternoon' | 'Full Day')[];
  languages: string[];
  tags: string[];
  dealEndsInDays?: number;
  mrp?: number;
  sellout?: boolean;
  pickup: string;
  mapNote: string;
  included: { ok: boolean; text: string }[];
  itinerary: { t: string; d: string }[];
  gallery: string[];
  info: string[];
}

const G = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`;

export const FARM_EXTRA: Record<string, FarmExtra> = {
  'farm-pollachi': {
    durationHrs: 6, slots: ['8:00 AM', '10:30 AM', '2:00 PM'], timeOfDay: ['Morning', 'Afternoon', 'Full Day'],
    languages: ['Tamil', 'English'], tags: ['Free cancellation', 'Likely to Sell Out'],
    dealEndsInDays: 3, mrp: 1099, sellout: true,
    pickup: 'Pollachi Bus Stand arch — guide holds a green Farm Vibe flag. Free parking inside the farm gate.',
    mapNote: '12 km from Pollachi town, tar road till gate. Share live location on booking day.',
    included: [
      { ok: true, text: 'Guided coconut grove walk (90 min)' },
      { ok: true, text: 'Neera tasting + farm cooking session' },
      { ok: true, text: 'Banana-leaf village lunch' },
      { ok: true, text: 'Bullock cart ride' },
      { ok: false, text: 'Transport to farm (add-on at checkout)' },
      { ok: false, text: 'Personal shopping' },
    ],
    itinerary: [
      { t: '8:00 AM', d: 'Meet guide at pickup point, tender coconut welcome drink' },
      { t: '8:30 AM', d: 'Heritage house + 60-acre grove walk with farmer' },
      { t: '10:30 AM', d: 'Live neera tapping + coconut climbing demo' },
      { t: '1:00 PM', d: 'Banana-leaf lunch + rest in mango shade' },
      { t: '2:30 PM', d: 'Farm cooking + bullock cart ride, sunset tea, send-off' },
    ],
    gallery: [G('photo-1625246333195-78d9c38ad449'), G('photo-1500382017468-9049fed747ef'), G('photo-1416879595882-3373a0480b5b'), G('photo-1470252649378-9c29740c9fa8')],
    info: ['Wear field footwear; caps provided.', 'Vegetarian + non-veg lunch options.', 'Kids under 5 free.'],
  },
  'farm-ooty': {
    durationHrs: 8, slots: ['7:30 AM', '9:00 AM'], timeOfDay: ['Morning', 'Full Day'],
    languages: ['Tamil', 'English'], tags: ['Free cancellation', 'Deal'],
    dealEndsInDays: 5, mrp: 1399,
    pickup: 'Ooty Charing Cross — homestay host receives you. Private parking available.',
    mapNote: 'Steep last 2 km; transport add-on recommended for low-clearance cars.',
    included: [
      { ok: true, text: 'Polyhouse + terrace farm tour' },
      { ok: true, text: 'Pick-your-vegetables basket (1 kg)' },
      { ok: true, text: 'Compost workshop + farm soup lunch' },
      { ok: true, text: 'Sunrise walk with guide' },
      { ok: false, text: 'Extra produce beyond basket' },
      { ok: false, text: 'Bonfire snacks' },
    ],
    itinerary: [
      { t: '7:30 AM', d: 'Sunrise walk over misty terraces' },
      { t: '9:00 AM', d: 'Polyhouse tour + pick-your-veggies' },
      { t: '11:00 AM', d: 'Compost school workshop' },
      { t: '1:00 PM', d: 'Farm-to-plate lunch + tea, send-off' },
    ],
    gallery: [G('photo-1595855759920-86582396756a'), G('photo-1500382017468-9049fed747ef'), G('photo-1466692476868-aef1dfb1e735'), G('photo-1416879595882-3373a0480b5b')],
    info: ['Nights are cold — carry jackets.', 'Altitude 2,200 m; walk is gentle.'],
  },
  'farm-thanjavur': {
    durationHrs: 6, slots: ['8:00 AM', '3:00 PM'], timeOfDay: ['Morning', 'Afternoon'],
    languages: ['Tamil', 'English'], tags: ['Free cancellation', 'Likely to Sell Out'],
    sellout: true,
    pickup: 'Thanjavur Old Bus Stand east gate. Farm shuttle for 10+ groups.',
    mapNote: 'Delta fields; approach road is narrow — follow guide pins.',
    included: [
      { ok: true, text: 'Hands-on transplanting / harvest demo' },
      { ok: true, text: 'Kolam + folk songs session' },
      { ok: true, text: 'Banana-leaf meals, buttermilk' },
      { ok: true, text: 'Bullock cart field circuit' },
      { ok: false, text: 'Transport (add-on)' },
    ],
    itinerary: [
      { t: '8:00 AM', d: 'Field welcome + transplanting in groups' },
      { t: '10:30 AM', d: 'Harvest demo + grain to plate talk' },
      { t: '1:00 PM', d: 'Banana-leaf lunch + folk songs' },
      { t: '3:00 PM', d: 'Kolam session + cart ride, send-off' },
    ],
    gallery: [G('photo-1560493676-04071c5f467b'), G('photo-1500937386664-56d1dfef3854'), G('photo-1470252649378-9c29740c9fa8'), G('photo-1464226184884-fa280b87c399')],
    info: ['You will get muddy — change room + wash provided.', 'Best Nov–Feb.'],
  },
  'farm-kodaikanal': {
    durationHrs: 7, slots: ['9:00 AM', '2:00 PM'], timeOfDay: ['Morning', 'Afternoon', 'Full Day'],
    languages: ['Tamil', 'English'], tags: ['Free cancellation', 'Deal'],
    dealEndsInDays: 4, mrp: 1149,
    pickup: 'Kodaikanal lake junction. Camp host meets with lantern in evening slots.',
    mapNote: 'Forest-edge property; network is patchy — download offline map.',
    included: [
      { ok: true, text: 'Live honey extraction + tasting' },
      { ok: true, text: 'Millet grinding + dosa session' },
      { ok: true, text: 'Forest-edge guided walk' },
      { ok: true, text: 'Campfire dinner (2-day+ plans)' },
      { ok: false, text: 'Tent upgrade (add-on)' },
    ],
    itinerary: [
      { t: '9:00 AM', d: 'Apiary visit + honey tasting off the comb' },
      { t: '11:30 AM', d: 'Millet terraces + stone grinding' },
      { t: '1:00 PM', d: 'Millet dosa lunch' },
      { t: '3:00 PM', d: 'Forest-edge walk + campfire tea' },
    ],
    gallery: [G('photo-1500937386664-56d1dfef3854'), G('photo-1444858291040-58f756a3bdd6'), G('photo-1472214103451-9374bd1c798e'), G('photo-1500382017468-9049fed747ef')],
    info: ['Carry mosquito repellent.', 'Tents have bedding; sleeping bags optional.'],
  },
  'farm-madurai': {
    durationHrs: 5, slots: ['7:00 AM', '10:00 AM', '3:30 PM'], timeOfDay: ['Morning', 'Afternoon'],
    languages: ['Tamil', 'English'], tags: ['Free cancellation'],
    pickup: 'Madurai Mattuthavani arch. SHG welcome desk at farm gate.',
    mapNote: 'City-edge farm; autos available from pickup point.',
    included: [
      { ok: true, text: 'Jasmine stringing with SHG women' },
      { ok: true, text: 'Banana chips making + tasting' },
      { ok: true, text: 'Village walk + pottery' },
      { ok: true, text: 'Traditional lunch' },
      { ok: false, text: 'Shop purchases' },
    ],
    itinerary: [
      { t: '7:00 AM', d: 'Jasmine harvest in morning fragrance' },
      { t: '9:00 AM', d: 'Stringing workshop + banana chips unit' },
      { t: '11:30 AM', d: 'Pottery + village walk' },
      { t: '1:00 PM', d: 'Lunch + SHG shop, send-off' },
    ],
    gallery: [G('photo-1464226184884-fa280b87c399'), G('photo-1416879595882-3373a0480b5b'), G('photo-1470252649378-9c29740c9fa8'), G('photo-1466692476868-aef1dfb1e735')],
    info: ['Morning slot smells best.', 'Supports women SHG directly.'],
  },
  'farm-theni': {
    durationHrs: 6, slots: ['9:00 AM', '3:00 PM'], timeOfDay: ['Morning', 'Afternoon', 'Full Day'],
    languages: ['Tamil', 'English'], tags: ['Free cancellation', 'Seasonal'],
    pickup: 'Theni new bus stand. Valley viewpoint cab on request.',
    mapNote: 'Cumbum valley; picking is seasonal — host confirms a day before.',
    included: [
      { ok: true, text: 'Vineyard walk + seasonal picking' },
      { ok: true, text: 'Fresh juice pressing + tasting' },
      { ok: true, text: 'Valley viewpoint sunset' },
      { ok: true, text: 'Farm meals' },
      { ok: false, text: 'Take-home boxes beyond 1 kg' },
    ],
    itinerary: [
      { t: '9:00 AM', d: 'Vineyard walk + picking session' },
      { t: '11:30 AM', d: 'Juice pressing + tasting' },
      { t: '1:00 PM', d: 'Valley lunch + rest' },
      { t: '4:00 PM', d: 'Viewpoint sunset, send-off' },
    ],
    gallery: [G('photo-1472214103451-9374bd1c798e'), G('photo-1500382017468-9049fed747ef'), G('photo-1466692476868-aef1dfb1e735'), G('photo-1444858291040-58f756a3bdd6')],
    info: ['Peak picking Feb–May.', 'Carry sun protection.'],
  },
};

export const PROMOS: Record<string, number> = { FARM10: 0.1, VIBE15: 0.15 };

export const ALL_REGIONS = ['All regions', 'Pollachi', 'Ooty', 'Thanjavur', 'Kodaikanal', 'Madurai', 'Theni'];
export const ALL_LANGS = ['Tamil', 'English'];

// Farmer region picker — curated Tamil Nadu farm destinations.
export const PLACES = [
  'Pollachi, Tamil Nadu', 'Ooty, Nilgiris', 'Thanjavur, Delta', 'Kodaikanal Hills',
  'Madurai', 'Theni, Cumbum Valley', 'Coimbatore', 'Erode', 'Salem', 'Trichy',
  'Kanyakumari', 'Courtallam', 'Yercaud', 'Valparai', 'Dindigul', 'Karur',
];

// Dual currency: INR + USDT (demo rate; live rate via payment provider in production).
export const USDT_RATE = 83.5;
export const usdt = (inr: number) => (inr / USDT_RATE).toFixed(2);

// Fallback details for newly added farms (before Admin enriches them).
// Guarantees every farm is viewable + bookable the moment it goes live.
export function extraFor(f: Farm): FarmExtra {
  return {
    durationHrs: 5,
    slots: ['9:00 AM', '2:00 PM'],
    timeOfDay: ['Morning', 'Afternoon'],
    languages: ['Tamil', 'English'],
    tags: ['Free cancellation'],
    pickup: `${f.region} main junction — the host shares the live location after Admin payment verification.`,
    mapNote: 'Exact Google Maps pin is shared on WhatsApp after booking confirmation.',
    included: [
      { ok: true, text: 'Guided farm walk with the host farmer' },
      { ok: true, text: 'Traditional village lunch' },
      { ok: true, text: `${(f.activities[0] || 'Farm activity')} session` },
      { ok: false, text: 'Transport to farm (add-on at checkout)' },
    ],
    itinerary: [
      { t: '9:00 AM', d: 'Meet the host, welcome drink and farm walk' },
      { t: '11:30 AM', d: `${(f.activities[0] || 'Farm activity')} with the family` },
      { t: '1:00 PM', d: 'Village lunch and send-off' },
    ],
    gallery: [f.image],
    info: ['Wear field footwear; drinking water provided.', `Hosted by ${f.farmerName}.`],
  };
}
