// spring-tokens.jsx — Spring's design tokens + low-level primitives.
// Color, type, icons, and shared bits used across every screen.
// All colors are warm — never pure black, never cold gray.

// ─────────────────────────────────────────────────────────────────────────
// Palette — softened per user feedback. Coral leans peach, not red.
// ─────────────────────────────────────────────────────────────────────────
const SPRING_PALETTE = {
  light: {
    // primary (coral / peach) — softened
    coral:        '#EFA890',
    coralDeep:    '#D8866A',  // hover / pressed / strong text on cream
    coralSoft:    '#FCE5D9',  // tinted backgrounds
    coralWhisper: '#FBF1EA',  // very subtle wash

    // secondary (sage)
    sage:         '#9BB89A',
    sageDeep:     '#6E8E73',
    sageSoft:     '#E3ECDF',

    // accent (butter yellow)
    butter:       '#F4D27A',
    butterDeep:   '#D9B257',
    butterSoft:   '#FAEFCB',

    // neutrals — warm
    cream:        '#FBF7F1',  // app bg
    ivory:        '#F4EEE5',  // surface alt
    sand:         '#E8DFD2',  // dividers, soft chips
    stone:        '#B8AC9C',  // muted text
    bark:         '#5C4D3F',  // body text
    espresso:     '#3A2E25',  // headlines
    inkSoft:      '#7A6B5C',  // secondary text

    // semantic
    success:      '#7A9F6E',
    danger:       '#C97A6A',
  },
  dark: {
    // dark mode is WARM — deep brown base, muted coral accents
    coral:        '#E8A088',
    coralDeep:    '#F0B69E',
    coralSoft:    '#3D2A22',
    coralWhisper: '#2A1E18',

    sage:         '#A8C4A6',
    sageDeep:     '#B9D3B8',
    sageSoft:     '#2A3528',

    butter:       '#E8C674',
    butterDeep:   '#F2D589',
    butterSoft:   '#3A2F1C',

    cream:        '#1F1814',     // app bg — deep warm brown
    ivory:        '#2A2017',     // surface
    sand:         '#3A2D22',     // dividers, raised
    stone:        '#857668',
    bark:         '#E8DDD0',
    espresso:     '#FBF7F1',
    inkSoft:      '#B8A89A',

    success:      '#9BBC8E',
    danger:       '#E09080',
  },
};

// Resolve a tweakable primary into the palette (overrides .coral & .coralDeep)
function resolveSpringPalette(mode, primaryOverride) {
  const base = SPRING_PALETTE[mode];
  if (!primaryOverride) return base;
  // Compute a slightly deeper companion for hover states
  return { ...base, coral: primaryOverride.coral || base.coral, coralDeep: primaryOverride.coralDeep || base.coralDeep, coralSoft: primaryOverride.coralSoft || base.coralSoft };
}

// ─────────────────────────────────────────────────────────────────────────
// Type — humanist sans (Plus Jakarta Sans) + softer display (Fraunces)
// ─────────────────────────────────────────────────────────────────────────
const SPRING_TYPE = {
  sans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  display: '"Fraunces", "Source Serif 4", Georgia, serif',
};

// Inject Google Fonts once
if (typeof document !== 'undefined' && !document.getElementById('spring-fonts')) {
  const link = document.createElement('link');
  link.id = 'spring-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap';
  document.head.appendChild(link);

  // Global keyframes — bloom, fadeup, etc.
  const style = document.createElement('style');
  style.id = 'spring-global';
  style.textContent = `
    @keyframes spring-bloom {
      0% { transform: scale(0.6); opacity: 0; }
      60% { transform: scale(1.08); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes spring-fadeup {
      from { transform: translateY(8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes spring-fillbar {
      from { transform: scaleX(0); }
      to { transform: scaleX(var(--fill, 1)); }
    }
    @keyframes spring-pulse {
      0%,100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    .spring-app * { box-sizing: border-box; }
    .spring-app button { font-family: inherit; }
    .spring-scroll::-webkit-scrollbar { display: none; }
    .spring-scroll { scrollbar-width: none; }
  `;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────────────────
// Icons — custom rounded line icons, 1.75px stroke
// ─────────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = 'currentColor', strokeWidth = 1.75 }) => {
  const paths = {
    home:     <><path d="M4 11l8-7 8 7v8a2 2 0 0 1-2 2h-3v-6h-6v6H6a2 2 0 0 1-2-2v-8z"/></>,
    meal:     <><path d="M5 4v8a3 3 0 0 0 3 3v6"/><path d="M8 4v6"/><path d="M11 4v6"/><path d="M16 4c-1 0-2 2-2 5s1 5 2 5v7"/></>,
    train:    <><path d="M3 12h2"/><path d="M19 12h2"/><rect x="5" y="9" width="3" height="6" rx="1"/><rect x="16" y="9" width="3" height="6" rx="1"/><path d="M8 12h8"/></>,
    sleep:    <><path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z"/></>,
    chat:     <><path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H10l-4 4v-4H7a3 3 0 0 1-3-3V7z"/></>,
    plus:     <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    check:    <><path d="M5 12l5 5 9-11"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
    arrowLeft:  <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></>,
    drop:     <><path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z"/></>,
    leaf:     <><path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z"/><path d="M5 19l9-9"/></>,
    flame:    <><path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5s3-3 3-3z"/><path d="M12 21a4 4 0 0 1-4-4"/></>,
    moon:     <><path d="M20 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z"/></>,
    pill:     <><rect x="3" y="9" width="18" height="6" rx="3"/><path d="M12 9v6"/></>,
    search:   <><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5a7 7 0 0 0 .1-1.2z"/></>,
    sparkle:  <><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/></>,
    timer:    <><circle cx="12" cy="13" r="7"/><path d="M12 9v4l2 2"/><path d="M10 3h4"/></>,
    bolt:     <><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"/></>,
    chevronDown: <><path d="M6 9l6 6 6-6"/></>,
    chevronRight: <><path d="M9 6l6 6-6 6"/></>,
    close:    <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
    mic:      <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></>,
    send:     <><path d="M4 12l16-7-7 16-2-7-7-2z"/></>,
    bell:     <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    barcode:  <><path d="M4 6v12"/><path d="M7 6v12"/><path d="M10 6v12"/><path d="M14 6v12"/><path d="M17 6v12"/><path d="M20 6v12"/></>,
    camera:   <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13" r="4"/></>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    star:     <><path d="M12 3l2.7 6 6.3.6-4.8 4.4 1.5 6.5L12 17.3 6.3 20.5l1.5-6.5L3 9.6l6.3-.6L12 3z"/></>,
    swap:     <><path d="M5 8h12"/><path d="M14 5l3 3-3 3"/><path d="M19 16H7"/><path d="M10 13l-3 3 3 3"/></>,
    list:     <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></>,
    heart:    <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name] || null}
    </svg>
  );
};

// Spring signature mark — leaf next to wordmark
const SpringMark = ({ size = 24, color, secondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z" fill={color} opacity="0.18"/>
    <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 19l9-9" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
    <circle cx="16.5" cy="7.5" r="1.4" fill={secondary || color} />
  </svg>
);

const SpringWordmark = ({ palette, size = 22 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <SpringMark size={size} color={palette.coralDeep} secondary={palette.sageDeep} />
    <span style={{ fontFamily: SPRING_TYPE.display, fontSize: size, fontWeight: 500, color: palette.espresso, letterSpacing: -0.2 }}>
      Spring
    </span>
  </div>
);

Object.assign(window, {
  SPRING_PALETTE, SPRING_TYPE, resolveSpringPalette,
  Icon, SpringMark, SpringWordmark,
});
