// Lightweight inline-SVG icon system. No new dependencies.
// Icons follow a 24x24 grid with stroke-based rendering for crispness.

const ICONS = {
  // ── Navigation / general
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  accounts: <><path d="M3 7.5 12 3l9 4.5" /><path d="M5 10v8" /><path d="M9 10v8" /><path d="M15 10v8" /><path d="M19 10v8" /><path d="M3 21h18" /></>,
  transactions: <><path d="M7 7h13" /><path d="m17 4 3 3-3 3" /><path d="M17 17H4" /><path d="m7 14-3 3 3 3" /></>,
  transfer: <><path d="M3 7h13" /><path d="m13 4 3 3-3 3" /><path d="M21 17H8" /><path d="m11 14-3 3 3 3" /></>,
  cards: <><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 9.5h19" /><path d="M6 15h3" /></>,
  loans: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M7 9.5h.01" /><path d="M17 14.5h.01" /></>,
  analytics: <><path d="M3 21V5" /><path d="M21 21H3" /><path d="M7 16V11" /><path d="M11 16V8" /><path d="M15 16v-3" /><path d="M19 16V6" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.7-4 4.2-6 8-6s7.3 2 8 6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 14.6a7.7 7.7 0 0 0 0-5.2l2-1.2-2-3.5-2.3.8a7.6 7.6 0 0 0-4.5-2.6L12 .5l-2.6 2.4a7.6 7.6 0 0 0-4.5 2.6l-2.3-.8-2 3.5 2 1.2a7.7 7.7 0 0 0 0 5.2l-2 1.2 2 3.5 2.3-.8a7.6 7.6 0 0 0 4.5 2.6L12 23.5l2.6-2.4a7.6 7.6 0 0 0 4.5-2.6l2.3.8 2-3.5-2-1.2Z" /></>,
  notifications: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
  shield: <><path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" /></>,
  shieldCheck: <><path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  fraud: <><path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" /><path d="M12 8v4" /><path d="M12 16h.01" /></>,
  admin: <><path d="M12 2v4" /><path d="M12 18v4" /><path d="M2 12h4" /><path d="M18 12h4" /><circle cx="12" cy="12" r="5" /></>,
  audit: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M14 3v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></>,

  // ── Actions
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  download: <><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></>,
  upload: <><path d="M12 21V9" /><path d="m7 13 5-5 5 5" /><path d="M5 3h14" /></>,
  filter: <><path d="M3 5h18" /><path d="M6 12h12" /><path d="M10 19h4" /></>,
  refresh: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>,
  external: <><path d="M14 4h6v6" /><path d="M10 14 20 4" /><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" /></>,
  more: <><circle cx="6" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="18" cy="12" r="1.5" /></>,
  moreV: <><circle cx="12" cy="6" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="18" r="1.5" /></>,
  close: <><path d="M6 6 18 18" /><path d="M18 6 6 18" /></>,
  check: <><path d="m5 12 5 5 9-11" /></>,
  chevronDown: <><path d="m6 9 6 6 6-6" /></>,
  chevronUp: <><path d="m6 15 6-6 6 6" /></>,
  chevronLeft: <><path d="m15 6-6 6 6 6" /></>,
  chevronRight: <><path d="m9 6 6 6-6 6" /></>,
  arrowUpRight: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
  arrowDownRight: <><path d="M7 7l10 10" /><path d="M17 8v9H8" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></>,
  arrowLeft: <><path d="M19 12H5" /><path d="m11 5-7 7 7 7" /></>,

  // ── Status
  warning: <><path d="M12 3 2 21h20L12 3Z" /><path d="M12 10v4" /><path d="M12 18h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><path d="M12 7h.01" /></>,
  success: <><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  unlock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7-2.8" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a14 14 0 0 1-3.4 4M6.6 6.6A14 14 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.7" /><path d="M9.9 14.1A3 3 0 1 1 14 9.9" /></>,

  // ── Finance
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M16 12h2.5" /><path d="M3 9h18" /></>,
  bank: <><path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 10V21" /><path d="M19 10V21" /><path d="M9 10v11" /><path d="M15 10v11" /><path d="m12 3 9 5H3l9-5Z" /></>,
  coin: <><circle cx="12" cy="12" r="9" /><path d="M9 9c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3 1.3-3 3 1.3 3 3 3 3-1.3 3-3" /><path d="M12 3v3" /><path d="M12 18v3" /></>,
  trendUp: <><path d="m3 17 6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
  trendDown: <><path d="m3 7 6 6 4-4 8 8" /><path d="M14 17h7v-7" /></>,
  receipt: <><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-2-2Z" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></>,

  // ── Misc
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.7-4 4.2-6 8-6s7.3 2 8 6" /></>,
  users: <><circle cx="9" cy="8" r="4" /><circle cx="17" cy="9" r="3" /><path d="M2 21c.7-4 3.6-6 7-6s6.3 2 7 6" /><path d="M22 21c-.4-3-2.5-4.5-5-4.8" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></>,
  location: <><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>,
  menu: <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2" /><path d="M12 19v2" /><path d="M3 12h2" /><path d="M19 12h2" /><path d="m5 5 1.5 1.5" /><path d="m17.5 17.5 1.5 1.5" /><path d="m5 19 1.5-1.5" /><path d="m17.5 6.5 1.5-1.5" /></>,
  moon: <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></>,
  fingerprint: <><path d="M6 12a6 6 0 0 1 12 0v3" /><path d="M6 14a6 6 0 0 0 4 5.7" /><path d="M14 21a8 8 0 0 0 4-7" /><path d="M10 9a2 2 0 0 1 4 0v6" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3" /><path d="M20 14v3" /><path d="M14 20h3" /><path d="M20 20v.01" /></>,
  star: <><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.2 9.4l6.1-.9L12 3Z" /></>,
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.6, ...rest }) {
  const path = ICONS[name];
  if (!path) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}

// Brand mark — institutional bank shield with EBMS monogram
export function BrandMark({ size = 32, variant = 'light' }) {
  const stroke = variant === 'dark' ? '#0d1b34' : '#ffffff';
  const fill = variant === 'dark' ? '#fff' : 'transparent';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="bm-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#243e68" />
          <stop offset="1" stopColor="#0d1b34" />
        </linearGradient>
        <linearGradient id="bm-gold" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#dfbe65" />
          <stop offset="1" stopColor="#9a6e22" />
        </linearGradient>
      </defs>
      <path d="M20 2 4 8v12c0 9 7 16 16 18 9-2 16-9 16-18V8L20 2Z" fill="url(#bm-grad)" />
      <path d="M14 14h12M14 20h8M14 26h12" stroke="url(#bm-gold)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
