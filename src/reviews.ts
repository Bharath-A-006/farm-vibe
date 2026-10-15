// Seed reviews — drafted with AI assistance (clearly demo content), realistic and varied.
// Real tourists' reviews + photos get collected post-visit; reviewer identity = monogram (no fake faces).

export interface Review {
  id: string;
  farmId: string;
  name: string;
  date: string;
  rating: number;
  title: string;
  text: string;
  tags: string[];
  hostReply?: string;
  verified: boolean;
}

const R = (
  farmId: string, name: string, date: string, rating: number,
  title: string, text: string, tags: string[], hostReply?: string
): Review => ({
  id: `${farmId}-${name.replace(/\W/g, '')}-${rating}`,
  farmId, name, date, rating, title, text, tags, hostReply, verified: true,
});

export const REVIEWS: Review[] = [
  R('farm-pollachi', 'Meenakshi S', 'Mar 2026', 5, 'Best family day out near Coimbatore',
    'Booked the 1-day plan for 6 of us including two kids. The neera tapping demo and bullock cart ride were the highlights. Lunch on banana leaf was generous and tasty. Guide Karthik explained everything patiently in English.',
    ['Highly recommend for kids', 'Great food'], 'Thank you Meenakshi! Your family is welcome back in mango season. — Murugan'),
  R('farm-pollachi', 'Arun Prakash', 'Feb 2026', 5, 'Payment verified in 30 minutes',
    'Was nervous about advance payment, but admin confirmed within half an hour and the booking page updated by itself. Farm is huge and well maintained. Coconut climbing demo is a must-watch.',
    ['Fast verification', 'Well maintained']),
  R('farm-pollachi', 'Jenifer D', 'Jan 2026', 4, 'Lovely, carry a cap',
    'Beautiful grove and warm hosts. Afternoon sun is strong in open areas, so carry caps. Farm cooking session with the women’s group was lovely.',
    ['Good for groups'], 'Noted Jenifer — we added shaded rest stops this season. — Murugan'),
  R('farm-ooty', 'Sara Thomas', 'Mar 2026', 5, 'Kids loved picking vegetables',
    'Stayed 2 days with homestay. Children still talk about pulling carrots and the compost treasure hunt. Rooms are clean, food is fully organic. Nights are cold — carry jackets.',
    ['Highly recommend for kids', 'Clean stay'], 'So happy the kids enjoyed, Sara! Come back for strawberry weeks. — Lakshmi'),
  R('farm-ooty', 'Vikram R', 'Dec 2025', 5, 'Sunrise walk is unreal',
    'Morning mist over the terraces, then hot farm soup. The compost workshop actually changed how I handle kitchen waste at home. Worth every rupee.',
    ['Great learning', 'Scenic']),
  R('farm-ooty', 'Nithya K', 'Nov 2025', 4, 'Great farm, road is steep',
    'Wonderful experience overall. Last 2 km road is steep — request transport option if unsure about driving. Farm team helped with parking.',
    ['Ask for transport']),
  R('farm-thanjavur', 'Deepak M', 'Feb 2026', 5, 'Transplanting in the mud — unforgettable',
    'City kids need this. We were ankle-deep in the field learning transplanting, then folk songs under the shed. Booking, payment and guide coordination were all smooth.',
    ['Authentic', 'Great for kids'], 'Vanakkam Deepak! Harvest season slots open soon. — Murugan'),
  R('farm-thanjavur', 'Aishwarya L', 'Jan 2026', 5, 'Banana-leaf lunch of dreams',
    'Seven curries, three sweets, served hot. The kolam session with the village women was beautiful. Very well organised for a group of 20.',
    ['Great food', 'Good for groups']),
  R('farm-kodaikanal', 'Rohit & Priya', 'Apr 2026', 5, 'Honey extraction + campfire',
    'Watched honey being extracted and tasted it warm off the comb. Evening campfire with millet dosa was perfect. Tents are comfortable.',
    ['Couple friendly', 'Unique'], 'Thank you both! Monsoon forest walks start June. — Lakshmi'),
  R('farm-kodaikanal', 'Suresh Babu', 'Mar 2026', 4, 'Good, carry mosquito repellent',
    'Lovely terraces and honest hosts. Forest edge walk is beautiful but carry repellent. Food portions are large.',
    ['Scenic']),
  R('farm-madurai', 'Kavitha R', 'Feb 2026', 5, 'Jasmine stringing with the SHG women',
    'Learned to string jasmine in 20 minutes thanks to Selvi’s team. Bought banana chips and pickles from their shop — excellent quality. Kids enjoyed pottery.',
    ['Women-led', 'Great shopping'], 'Nandri Kavitha! Your support goes directly to our SHG members. — Selvi'),
  R('farm-madurai', 'Mohammed F', 'Jan 2026', 4, 'Fragrant and colourful',
    'Entire garden smells of jasmine in the morning slot. Go for the morning time. Lunch is traditional and filling.',
    ['Morning slot best']),
  R('farm-theni', 'Divya Nair', 'Apr 2026', 5, 'Grape picking season is magic',
    'Went in peak season — ate grapes straight off the vine and pressed our own juice. Valley viewpoint at sunset is stunning.',
    ['Seasonal must-do', 'Scenic']),
  R('farm-theni', 'Karthick Raja', 'Mar 2026', 4, 'Nice valley farm, check season',
    'Beautiful valley, but grapes are seasonal — check with the host before booking for picking. Mango and juice were still great.',
    ['Check season']),
  R('farm-cbe-millet', 'Priya Dharshini', 'Mar 2026', 5, 'Stone-ground millet dosa was superb',
    'Watched our breakfast being ground on stone and ate it hot with chutney. Kids loved the bullock cart. Booking confirmation came within the hour.',
    ['Great food', 'Good for kids'], 'Nandri Priya! Do visit during harvest weeks. — Deva'),
  R('farm-cbe-millet', 'Kavin Kumar', 'Feb 2026', 4, 'Authentic dryland experience',
    'Simple, honest farm. Carry a cap — the millet fields are open. Guide arranged by admin was punctual.',
    ['Authentic']),
  R('farm-erode-turmeric', 'Lalitha S', 'Feb 2026', 5, 'Turmeric harvest like a festival',
    'Hands yellow, hearts full! The boiling and polishing demo was fascinating. Bought 2 kg powder from the farm shop.',
    ['Great shopping', 'Unique'], 'Thank you Lalitha! Fresh stock every January. — Kannan'),
  R('farm-salem-mango', 'Harish V', 'Apr 2026', 5, 'Mango season heaven',
    'Ate malgova straight off the tree and pressed juice ourselves. Farm shop pickles are a must-buy.',
    ['Seasonal must-do', 'Great food'], 'Mango season welcomes you back, Harish! — Meena'),
  R('farm-kk-banana', 'Anusuya R', 'Jan 2026', 5, 'Sea breeze and banana chips',
    'Evening walk with sea breeze, hot chips from the unit. Lovely family-run place near the coast.',
    ['Family friendly', 'Great food']),
  R('farm-vellore-cane', 'Manoj T', 'Mar 2026', 4, 'Hot jaggery off the vat',
    'Watching jaggery bubble and tasting it warm was the highlight. Sweet experience, literally.',
    ['Unique']),
];

export function farmReviews(farmId: string): Review[] {
  return REVIEWS.filter(r => r.farmId === farmId);
}

export function ratingBreakdown(farmId: string): { avg: number; count: number; bars: { star: number; pct: number }[] } {
  const list = farmReviews(farmId);
  const count = list.length || 1;
  const avg = list.length ? list.reduce((a, r) => a + r.rating, 0) / list.length : 4.7;
  const bars = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    pct: Math.round((list.filter(r => r.rating === s).length / count) * 100),
  }));
  return { avg, count: list.length, bars };
}

/** Elegant monogram avatar (no fake photos). */
export function monogram(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const PALETTE = ['#0d6b4f', '#8a6d3b', '#3b4a8f', '#7c3f58', '#1f6f8b', '#5b4a8a'];
export function monoColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997;
  return PALETTE[h % PALETTE.length];
}
