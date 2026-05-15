// spring-screens.jsx — All Spring screens. Each is a function(palette, mode, ...handlers).

// ─────────────────────────────────────────────────────────────────────────
// ONBOARDING — 3 polished steps + welcome
// ─────────────────────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { id: 'welcome',  title: 'welcome' },
  { id: 'name',     title: "What should we call you?" },
  { id: 'goal',     title: "What brings you to Spring?" },
  { id: 'rhythm',   title: "When does your day begin?" },
  { id: 'summary',  title: 'summary' },
];

const GOAL_OPTIONS = [
  { id: 'feel-good', label: 'Just feel good',     sub: 'Build steadier habits',         icon: 'leaf' },
  { id: 'lose',      label: 'Lose a little',      sub: 'Sustainable, not severe',       icon: 'flame' },
  { id: 'muscle',    label: 'Build strength',     sub: 'Train smarter, recover better', icon: 'bolt' },
  { id: 'eat',       label: 'Eat better',         sub: 'More plants, less guesswork',   icon: 'meal' },
  { id: 'sleep',     label: 'Sleep deeper',       sub: 'A calmer wind-down',            icon: 'moon' },
];

const OnbDots = ({ palette, total, current }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: 4, borderRadius: 2,
        width: i === current ? 28 : 8,
        background: i <= current ? palette.coralDeep : palette.sand,
        transition: 'all .35s cubic-bezier(.2,.7,.3,1)',
      }} />
    ))}
  </div>
);

const OnboardingScreen = ({ palette, mode, step, data, onChange, onNext, onBack, onFinish }) => {
  const stepDef = ONBOARDING_STEPS[step];
  const total = ONBOARDING_STEPS.length;

  // — Welcome —
  if (stepDef.id === 'welcome') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative',
        background: `radial-gradient(ellipse at 50% -10%, ${palette.coralSoft} 0%, ${palette.cream} 60%)`,
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
          {/* Hero leaf mark — large, with soft bloom */}
          <div style={{ animation: 'spring-bloom .9s cubic-bezier(.2,1.4,.3,1) both', marginBottom: 28 }}>
            <svg width="92" height="92" viewBox="0 0 24 24" fill="none">
              <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z" fill={palette.coral} opacity="0.25"/>
              <path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z" stroke={palette.coralDeep} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 19l9-9" stroke={palette.coralDeep} strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="16.5" cy="7.5" r="1.4" fill={palette.sageDeep} />
            </svg>
          </div>
          <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 44, fontWeight: 500, color: palette.espresso, letterSpacing: -1, marginBottom: 14, textAlign: 'center', lineHeight: 1.05, animation: 'spring-fadeup .5s ease both .2s' }}>
            Welcome to <em style={{ fontStyle: 'italic', color: palette.coralDeep }}>Spring</em>
          </div>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 16, color: palette.bark, textAlign: 'center', maxWidth: 300, lineHeight: 1.5, animation: 'spring-fadeup .5s ease both .35s' }}>
            A gentler way to look after yourself. Eat, move, rest — all in one calm place.
          </div>
        </div>
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'spring-fadeup .5s ease both .5s' }}>
          <SpringBtn palette={palette} size="lg" fullWidth onClick={onNext}>
            Let's begin <Icon name="arrowRight" size={18} color="#fff" strokeWidth={2.2} />
          </SpringBtn>
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: SPRING_TYPE.sans, fontSize: 13, color: palette.inkSoft, padding: 8,
          }}>I already have an account</button>
        </div>
      </div>
    );
  }

  // — Summary —
  if (stepDef.id === 'summary') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 24px 24px',
        background: `linear-gradient(180deg, ${palette.coralWhisper} 0%, ${palette.cream} 50%)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 18px' }}>
          <OnbDots palette={palette} total={total} current={step} />
        </div>
        <div style={{ animation: 'spring-fadeup .4s ease both' }}>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: palette.coralDeep, marginBottom: 8 }}>
            Your fresh start
          </div>
          <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 30, fontWeight: 500, color: palette.espresso, letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 6 }}>
            Hello, {data.name || 'friend'} —<br/>
            <em style={{ fontStyle: 'italic', color: palette.coralDeep }}>here's your starting place.</em>
          </div>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 14, color: palette.inkSoft, marginBottom: 22, lineHeight: 1.5 }}>
            Numbers are gentle suggestions — we'll adjust as we learn your rhythm.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'spring-fadeup .5s ease both .15s' }}>
          <SpringCard palette={palette} mode={mode} padding={18}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, color: palette.inkSoft, fontWeight: 600 }}>Daily energy</div>
                <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 32, fontWeight: 500, color: palette.espresso, lineHeight: 1 }}>1,940 <span style={{ fontSize: 14, color: palette.inkSoft, fontFamily: SPRING_TYPE.sans, fontWeight: 500 }}>kcal</span></div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: palette.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="flame" size={22} color={palette.coralDeep} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {[{ l: 'Protein', v: '120g', c: palette.coral },{ l: 'Carbs', v: '220g', c: palette.butter },{ l: 'Fat', v: '65g', c: palette.sage }].map(m => (
                <div key={m.l} style={{ flex: 1, background: palette.cream, borderRadius: 12, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: palette.inkSoft, fontWeight: 600 }}>{m.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: palette.espresso, fontFamily: SPRING_TYPE.sans }}>{m.v}</div>
                  <div style={{ height: 3, borderRadius: 2, background: m.c, marginTop: 5, opacity: 0.7 }} />
                </div>
              ))}
            </div>
          </SpringCard>
          <SpringCard palette={palette} mode={mode} padding={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: palette.sageSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="moon" size={18} color={palette.sageDeep} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: palette.espresso, fontFamily: SPRING_TYPE.sans }}>Wind down by 10:30 pm</div>
                <div style={{ fontSize: 12, color: palette.inkSoft }}>For 7.5 hrs of sleep before 7:00 am</div>
              </div>
            </div>
          </SpringCard>
          <SpringCard palette={palette} mode={mode} padding={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: palette.butterSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="drop" size={18} color={palette.butterDeep} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: palette.espresso, fontFamily: SPRING_TYPE.sans }}>2.4 L of water</div>
                <div style={{ fontSize: 12, color: palette.inkSoft }}>About 8 glasses through the day</div>
              </div>
            </div>
          </SpringCard>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingTop: 20 }}>
          <SpringBtn palette={palette} size="lg" fullWidth onClick={onFinish}>
            Take me home <Icon name="arrowRight" size={18} color="#fff" strokeWidth={2.2} />
          </SpringBtn>
        </div>
      </div>
    );
  }

  // — Standard step layout (name, goal, rhythm) —
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 18px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, marginLeft: -6, color: palette.bark }}>
          <Icon name="arrowLeft" size={20} color={palette.bark} />
        </button>
        <OnbDots palette={palette} total={total} current={step} />
        <div style={{ width: 32 }}/>
      </div>

      <div style={{ animation: 'spring-fadeup .35s ease both', marginBottom: 28 }}>
        <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: palette.stone, marginBottom: 10 }}>
          Step {step} of {total - 2}
        </div>
        <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 28, fontWeight: 500, color: palette.espresso, letterSpacing: -0.4, lineHeight: 1.15 }}>
          {stepDef.title}
        </div>
      </div>

      {/* Per-step body */}
      {stepDef.id === 'name' && (
        <div style={{ animation: 'spring-fadeup .4s ease both .1s' }}>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 14, color: palette.inkSoft, marginBottom: 22, lineHeight: 1.5 }}>
            Just a first name is fine — we'll use it to greet you each morning.
          </div>
          <div style={{
            position: 'relative', borderBottom: `2px solid ${palette.coralDeep}`,
            paddingBottom: 8,
          }}>
            <input value={data.name || ''} onChange={(e) => onChange('name', e.target.value)}
              placeholder="Type your name"
              autoFocus
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontFamily: SPRING_TYPE.display, fontSize: 30, fontWeight: 500, color: palette.espresso,
                letterSpacing: -0.4,
              }} />
          </div>
          <div style={{ marginTop: 16, fontFamily: SPRING_TYPE.sans, fontSize: 12, color: palette.stone, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="leaf" size={13} color={palette.sageDeep} strokeWidth={2}/>
            We'll never share your name with anyone.
          </div>
        </div>
      )}

      {stepDef.id === 'goal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'spring-fadeup .4s ease both .1s' }}>
          {GOAL_OPTIONS.map((opt, i) => {
            const selected = data.goal === opt.id;
            return (
              <button key={opt.id} onClick={() => onChange('goal', opt.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 18,
                  background: selected ? palette.coralSoft : (mode === 'dark' ? palette.ivory : '#fff'),
                  border: `1.5px solid ${selected ? palette.coralDeep : (mode === 'dark' ? palette.sand : palette.coralWhisper)}`,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all .2s cubic-bezier(.2,.7,.3,1)',
                  animation: `spring-fadeup .35s ease both ${0.1 + i * 0.05}s`,
                }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 19,
                  background: selected ? palette.coral : palette.coralWhisper,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={opt.icon} size={18} color={selected ? '#fff' : palette.coralDeep} strokeWidth={2}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 15, fontWeight: 600, color: palette.espresso }}>{opt.label}</div>
                  <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, color: palette.inkSoft, marginTop: 1 }}>{opt.sub}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: selected ? palette.coralDeep : 'transparent',
                  border: `1.5px solid ${selected ? palette.coralDeep : palette.sand}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all .15s ease',
                }}>
                  {selected && <Icon name="check" size={13} color="#fff" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {stepDef.id === 'rhythm' && (
        <div style={{ animation: 'spring-fadeup .4s ease both .1s' }}>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 14, color: palette.inkSoft, marginBottom: 22, lineHeight: 1.5 }}>
            We'll plan meals, training, and reminders around your natural rhythm.
          </div>
          {[
            { k: 'wake',  label: 'Wake up around', value: data.wake || '6:45 am', icon: 'flame', tint: palette.coralSoft, tintDeep: palette.coralDeep },
            { k: 'sleep', label: 'Wind down around', value: data.sleep || '10:30 pm', icon: 'moon', tint: palette.sageSoft, tintDeep: palette.sageDeep },
          ].map(row => (
            <div key={row.k} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', borderRadius: 18,
              background: mode === 'dark' ? palette.ivory : '#fff',
              border: `1px solid ${mode === 'dark' ? palette.sand : palette.coralWhisper}`,
              marginBottom: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: row.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={row.icon} size={18} color={row.tintDeep} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, fontWeight: 600, color: palette.inkSoft }}>{row.label}</div>
                <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 22, fontWeight: 500, color: palette.espresso, marginTop: 2 }}>{row.value}</div>
              </div>
              <Icon name="chevronRight" size={18} color={palette.stone} />
            </div>
          ))}
          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 14, background: palette.butterSoft, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="sparkle" size={16} color={palette.butterDeep} strokeWidth={2} />
            <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, color: palette.bark, lineHeight: 1.5 }}>
              That's about <strong>8.25 hours</strong> of sleep — well within the gentle sweet spot.
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />
      <div style={{ paddingTop: 20 }}>
        <SpringBtn palette={palette} size="lg" fullWidth onClick={onNext}
          disabled={stepDef.id === 'name' && !data.name || stepDef.id === 'goal' && !data.goal}>
          Continue <Icon name="arrowRight" size={18} color="#fff" strokeWidth={2.2} />
        </SpringBtn>
      </div>
    </div>
  );
};

Object.assign(window, { OnboardingScreen, ONBOARDING_STEPS });
