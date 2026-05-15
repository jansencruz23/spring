// spring-shell.jsx — Phone bezel + status bar + bottom nav, themed for Spring.
// Bypasses the Android frame's default app bar entirely; we build our own
// chrome that matches the warm palette.

const SpringStatusBar = ({ palette, mode }) => (
  <div style={{
    height: 36, padding: '0 22px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontFamily: SPRING_TYPE.sans, color: palette.espresso,
    flexShrink: 0,
    position: 'relative',
  }}>
    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.2 }}>9:41</span>
    <div style={{
      position: 'absolute', left: '50%', top: 8, transform: 'translateX(-50%)',
      width: 22, height: 22, borderRadius: '50%',
      background: mode === 'dark' ? '#0a0807' : '#2a221b',
    }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {/* signal */}
      <svg width="14" height="11" viewBox="0 0 14 11" fill={palette.espresso}>
        <rect x="0" y="7" width="2.5" height="4" rx="0.5"/>
        <rect x="3.5" y="5" width="2.5" height="6" rx="0.5"/>
        <rect x="7" y="3" width="2.5" height="8" rx="0.5"/>
        <rect x="10.5" y="0" width="2.5" height="11" rx="0.5"/>
      </svg>
      {/* wifi */}
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke={palette.espresso} strokeWidth="1.4" strokeLinecap="round">
        <path d="M1 4a8.5 8.5 0 0 1 12 0"/>
        <path d="M3.5 6.5a5 5 0 0 1 7 0"/>
        <circle cx="7" cy="9.2" r="0.8" fill={palette.espresso} stroke="none"/>
      </svg>
      {/* battery */}
      <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
        <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke={palette.espresso} strokeWidth="1"/>
        <rect x="2" y="2" width="13" height="7" rx="1" fill={palette.espresso}/>
        <rect x="19.5" y="3.5" width="1.5" height="4" rx="0.5" fill={palette.espresso}/>
      </svg>
    </div>
  </div>
);

const SpringHomeIndicator = ({ palette, mode }) => (
  <div style={{
    height: 22, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    paddingBottom: 8, flexShrink: 0,
    background: 'transparent',
  }}>
    <div style={{
      width: 120, height: 4, borderRadius: 2,
      background: mode === 'dark' ? palette.bark : palette.espresso, opacity: 0.4,
    }} />
  </div>
);

// Phone bezel — wraps a screen
const SpringPhone = ({ palette, mode, children, width = 390, height = 844, floating = false }) => (
  <div style={{
    width, height,
    borderRadius: 44, padding: 9,
    background: mode === 'dark' ? '#0a0807' : '#1a1410',
    boxShadow: floating
      ? '0 50px 100px -30px rgba(60,40,25,0.45), 0 20px 40px -20px rgba(60,40,25,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.04)'
      : '0 30px 60px -20px rgba(60,40,25,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.04)',
    position: 'relative',
  }}>
    <div style={{
      width: '100%', height: '100%',
      borderRadius: 36, overflow: 'hidden',
      background: palette.cream,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {children}
    </div>
  </div>
);

// Bottom nav — 5 destinations
const NAV_ITEMS = [
  { id: 'home',  label: 'Today',    icon: 'home' },
  { id: 'meals', label: 'Meals',    icon: 'meal' },
  { id: 'train', label: 'Train',    icon: 'train' },
  { id: 'sleep', label: 'Wellness', icon: 'sleep' },
  { id: 'chat',  label: 'Spring',   icon: 'sparkle' },
];

const SpringBottomNav = ({ palette, mode, active, onChange }) => (
  <div style={{
    flexShrink: 0,
    background: mode === 'dark' ? palette.ivory : '#FFFFFF',
    borderTop: `1px solid ${mode === 'dark' ? palette.sand : palette.coralWhisper}`,
    padding: '8px 8px 6px',
    display: 'flex',
    fontFamily: SPRING_TYPE.sans,
  }}>
    {NAV_ITEMS.map(item => {
      const isActive = active === item.id;
      const isAi = item.id === 'chat';
      return (
        <button key={item.id}
          onClick={() => onChange?.(item.id)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '6px 0 4px', gap: 4, cursor: 'pointer',
            color: isActive ? palette.coralDeep : palette.inkSoft,
          }}>
          <div style={{
            width: 44, height: 28, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? (isAi ? palette.butterSoft : palette.coralSoft) : 'transparent',
            transition: 'background .25s cubic-bezier(.2,.7,.3,1)',
            position: 'relative',
          }}>
            <Icon name={item.icon} size={isAi ? 19 : 20} strokeWidth={isActive ? 2 : 1.75}
              color={isActive ? (isAi ? palette.butterDeep : palette.coralDeep) : palette.inkSoft} />
            {isAi && (
              <div style={{
                position: 'absolute', top: 2, right: 7,
                width: 5, height: 5, borderRadius: '50%',
                background: palette.coralDeep,
              }}/>
            )}
          </div>
          <span style={{ fontSize: 10.5, fontWeight: isActive ? 600 : 500, letterSpacing: 0.1 }}>
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);

// Floating "Ask Spring" action button — appears on most screens
const AskSpringFab = ({ palette, mode, onClick, bottom = 88, contextLabel }) => (
  <button onClick={onClick}
    style={{
      position: 'absolute', right: 18, bottom,
      height: 52, padding: '0 18px 0 16px',
      borderRadius: 26, border: 'none', cursor: 'pointer',
      background: `linear-gradient(135deg, ${palette.coral}, ${palette.coralDeep})`,
      color: '#fff',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: `0 12px 28px -8px ${mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(168,99,72,0.45)'}, 0 4px 10px -2px rgba(168,99,72,0.3)`,
      fontFamily: SPRING_TYPE.sans, fontWeight: 600, fontSize: 14,
      letterSpacing: 0.1,
      animation: 'spring-fadeup .4s ease both',
    }}>
    <Icon name="sparkle" size={18} color="#fff" strokeWidth={2} />
    <span>{contextLabel || 'Ask Spring'}</span>
  </button>
);

// Generic primary button
const SpringBtn = ({ palette, children, onClick, variant = 'primary', size = 'md', fullWidth, style, disabled }) => {
  const sizes = {
    sm: { h: 36, px: 16, fs: 13 },
    md: { h: 48, px: 22, fs: 15 },
    lg: { h: 56, px: 28, fs: 16 },
  };
  const s = sizes[size];
  const variants = {
    primary: {
      background: disabled ? palette.sand : `linear-gradient(135deg, ${palette.coral}, ${palette.coralDeep})`,
      color: '#fff',
      boxShadow: disabled ? 'none' : `0 6px 16px -6px ${palette.coralDeep}99`,
    },
    soft: {
      background: palette.coralSoft, color: palette.coralDeep, boxShadow: 'none',
    },
    ghost: {
      background: 'transparent', color: palette.bark, boxShadow: 'none',
    },
    outline: {
      background: 'transparent', color: palette.bark,
      boxShadow: `inset 0 0 0 1.5px ${palette.sand}`,
    },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        height: s.h, padding: `0 ${s.px}px`, borderRadius: s.h / 2,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: SPRING_TYPE.sans, fontWeight: 600, fontSize: s.fs,
        letterSpacing: 0.1, width: fullWidth ? '100%' : undefined,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'transform .15s ease, box-shadow .15s ease',
        ...variants[variant], ...style,
      }}>
      {children}
    </button>
  );
};

// Card — soft warm surface
const SpringCard = ({ palette, mode, children, style, padding = 18, ...rest }) => (
  <div {...rest} style={{
    background: mode === 'dark' ? palette.ivory : '#FFFFFF',
    borderRadius: 22,
    padding,
    boxShadow: mode === 'dark'
      ? '0 1px 0 rgba(255,255,255,0.03), 0 8px 18px -10px rgba(0,0,0,0.5)'
      : '0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 18px -10px rgba(120,80,50,0.18)',
    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.04)' : palette.coralWhisper}`,
    ...style,
  }}>
    {children}
  </div>
);

// Section heading
const SectionHead = ({ palette, eyebrow, title, action, onAction, style }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', ...style }}>
    <div>
      {eyebrow && (
        <div style={{
          fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
          textTransform: 'uppercase', color: palette.stone, marginBottom: 4,
        }}>{eyebrow}</div>
      )}
      <div style={{
        fontFamily: SPRING_TYPE.display, fontSize: 22, fontWeight: 500,
        color: palette.espresso, letterSpacing: -0.3,
      }}>{title}</div>
    </div>
    {action && (
      <button onClick={onAction} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: SPRING_TYPE.sans, fontSize: 13, fontWeight: 600, color: palette.coralDeep,
      }}>{action}</button>
    )}
  </div>
);

// "Ask about this" contextual chip (small, sits on cards)
const AskAboutChip = ({ palette, label = 'Ask about this', onClick }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 24, padding: '0 9px 0 7px', borderRadius: 12,
      background: palette.butterSoft, color: palette.butterDeep,
      border: 'none', cursor: 'pointer',
      fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, letterSpacing: 0.1,
    }}>
    <Icon name="sparkle" size={11} color={palette.butterDeep} strokeWidth={2.2} />
    {label}
  </button>
);

Object.assign(window, {
  SpringStatusBar, SpringHomeIndicator, SpringPhone, SpringBottomNav,
  AskSpringFab, SpringBtn, SpringCard, SectionHead, AskAboutChip, NAV_ITEMS,
});
