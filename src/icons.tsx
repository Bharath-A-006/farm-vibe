// Elegant stroke icon set — professional, no cartoon styling.
import React from 'react';

type P = { size?: number; className?: string; sw?: number };

function base(size: number, sw: number, children: React.ReactNode, className?: string) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export const I = {
  search: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></>, p.className),
  pin: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>, p.className),
  cal: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, p.className),
  users: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>, p.className),
  star: (p: P = {}) => (
    <svg width={p.size || 15} height={p.size || 15} viewBox="0 0 24 24" fill="currentColor" className={p.className} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  ),
  check: (p: P = {}) => base(p.size || 18, p.sw || 2, <polyline points="20 6 9 17 4 12" />, p.className),
  cross: (p: P = {}) => base(p.size || 18, p.sw || 2, <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, p.className),
  shield: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>, p.className),
  clock: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, p.className),
  card: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>, p.className),
  globe: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>, p.className),
  mic: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></>, p.className),
  send: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>, p.className),
  vol: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></>, p.className),
  sliders: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>, p.className),
  chevR: (p: P = {}) => base(p.size || 18, p.sw || 2, <polyline points="9 18 15 12 9 6" />, p.className),
  chevL: (p: P = {}) => base(p.size || 18, p.sw || 2, <polyline points="15 18 9 12 15 6" />, p.className),
  leaf: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 8-4 16-9 16" /><path d="M4 21c4-4 7-7 12-11" /></>, p.className),
  bell: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>, p.className),
  cam: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>, p.className),
  home: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>, p.className),
  tag: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>, p.className),
  bolt: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />, p.className),
  chat: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, p.className),
  bot: (p: P = {}) => base(p.size || 22, p.sw || 1.6, <><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V4M8 4h8" /><circle cx="9" cy="14" r="1" fill="currentColor" /><circle cx="15" cy="14" r="1" fill="currentColor" /><path d="M9 17h6" /></>, p.className),
  heart: (p: P & { filled?: boolean } = {}) => base(p.size || 18, p.sw || 1.8, <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={p.filled ? 'currentColor' : 'none'} />, p.className),
  logout: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>, p.className),
  wallet: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>, p.className),
  trend: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>, p.className),
  sun: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>, p.className),
  moon: (p: P = {}) => base(p.size || 18, p.sw || 1.8, <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />, p.className),
};
