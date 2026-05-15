// spring-meals.jsx — Meal plan + active workout

const MealPlanScreen = ({ palette, mode, openContext }) => {
  const days = ['M','T','W','T','F','S','S'];
  const [selectedDay, setSelectedDay] = React.useState(2);

  return (
    <div className="spring-scroll" style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: '14px 22px 18px', background: `linear-gradient(180deg, ${palette.sageSoft}55 0%, ${palette.cream} 100%)` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: palette.sageDeep }}>This week</div>
            <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 26, fontWeight: 500, color: palette.espresso, letterSpacing: -0.3, marginTop: 2 }}>
              <em style={{ fontStyle: 'italic' }}>Mediterranean</em> rhythm
            </div>
          </div>
          <button style={iconBtnStyle(palette, mode)}><Icon name="list" size={18} color={palette.bark}/></button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {days.map((d, i) => (
            <button key={i} onClick={() => setSelectedDay(i)} style={{
              flex: 1, height: 56, borderRadius: 16, border: 'none', cursor: 'pointer',
              background: selectedDay === i ? `linear-gradient(135deg, ${palette.coral}, ${palette.coralDeep})` : (mode === 'dark' ? palette.ivory : '#fff'),
              color: selectedDay === i ? '#fff' : palette.bark,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              boxShadow: selectedDay === i ? `0 6px 14px -4px ${palette.coralDeep}88` : 'none',
              border: selectedDay === i ? 'none' : `1px solid ${palette.coralWhisper}`,
              transition: 'all .25s',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, opacity: selectedDay === i ? 0.85 : 0.5, fontFamily: SPRING_TYPE.sans }}>{d}</span>
              <span style={{ fontFamily: SPRING_TYPE.display, fontSize: 18, fontWeight: 500 }}>{12 + i}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '6px 18px 0' }}>
        {[
          { meal: 'Breakfast', time: '7:30 am', name: 'Greek yogurt, berries & honey', kcal: 320, p: 22, hue: palette.butter, hueDeep: palette.butterDeep, hueSoft: palette.butterSoft, tags: ['high-protein','quick'] },
          { meal: 'Lunch',     time: '12:45 pm', name: 'Lentil & roasted veg bowl', kcal: 510, p: 28, hue: palette.sage, hueDeep: palette.sageDeep, hueSoft: palette.sageSoft, tags: ['vegetarian','fiber'] },
          { meal: 'Snack',     time: '4:00 pm',  name: 'Almonds & a small pear',    kcal: 210, p: 8,  hue: palette.coral, hueDeep: palette.coralDeep, hueSoft: palette.coralSoft, tags: ['light'] },
          { meal: 'Dinner',    time: '7:30 pm',  name: 'Lemon herb salmon, farro',  kcal: 620, p: 42, hue: palette.coral, hueDeep: palette.coralDeep, hueSoft: palette.coralSoft, tags: ['omega-3','iron'] },
        ].map((m, i) => (
          <SpringCard key={i} palette={palette} mode={mode} padding={0} style={{ marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: 86, background: `linear-gradient(135deg, ${m.hueSoft}, ${m.hue}33)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px' }}>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 10, fontWeight: 600, color: m.hueDeep, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.meal}</div>
                <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 16, fontWeight: 500, color: palette.espresso, marginTop: 2 }}>{m.time.split(' ')[0]}</div>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 9, color: palette.inkSoft }}>{m.time.split(' ')[1]}</div>
              </div>
              <div style={{ flex: 1, padding: '14px 16px' }}>
                <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 17, fontWeight: 500, color: palette.espresso, lineHeight: 1.2, letterSpacing: -0.2 }}>{m.name}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 8, fontFamily: SPRING_TYPE.sans, fontSize: 12 }}>
                  <span style={{ color: palette.bark, fontWeight: 600 }}>{m.kcal} <span style={{ color: palette.inkSoft, fontWeight: 500 }}>kcal</span></span>
                  <span style={{ color: palette.bark, fontWeight: 600 }}>{m.p}g <span style={{ color: palette.inkSoft, fontWeight: 500 }}>protein</span></span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {m.tags.map(t => (
                      <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 8, background: m.hueSoft, color: m.hueDeep, fontFamily: SPRING_TYPE.sans, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                  <button style={{
                    width: 28, height: 28, borderRadius: 14, border: `1px solid ${palette.coralWhisper}`,
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="swap" size={13} color={palette.inkSoft} strokeWidth={2}/>
                  </button>
                </div>
              </div>
            </div>
          </SpringCard>
        ))}

        <button style={{
          width: '100%', padding: '14px', borderRadius: 18,
          background: palette.sageSoft, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: SPRING_TYPE.sans, fontSize: 14, fontWeight: 600, color: palette.sageDeep,
          marginTop: 4,
        }}>
          <Icon name="list" size={16} color={palette.sageDeep} strokeWidth={2}/>
          Shopping list (24 items)
        </button>
      </div>

      <div style={{ height: 120 }}/>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Active workout
// ─────────────────────────────────────────────────────────────────────
const WORKOUT_EXERCISES = [
  { name: 'Goblet squat',     sets: '3 × 10', detail: '20 kg', done: true },
  { name: 'Romanian deadlift', sets: '3 × 8',  detail: '40 kg', done: true },
  { name: 'Walking lunges',   sets: '3 × 12', detail: 'each side', done: false, current: true },
  { name: 'Glute bridge',     sets: '3 × 12', detail: '30 kg' },
  { name: 'Calf raise',       sets: '2 × 15', detail: 'bodyweight' },
];

const ActiveWorkoutScreen = ({ palette, mode }) => {
  const [seconds, setSeconds] = React.useState(847);
  const [restRemaining, setRestRemaining] = React.useState(38);
  const [restActive, setRestActive] = React.useState(true);

  React.useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  React.useEffect(() => {
    if (!restActive) return;
    const t = setInterval(() => setRestRemaining(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [restActive]);

  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const restPct = restRemaining / 60;

  return (
    <div className="spring-scroll" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header — workout meta */}
      <div style={{ padding: '14px 22px 22px', background: `linear-gradient(180deg, ${palette.coralWhisper} 0%, transparent 100%)` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button style={iconBtnStyle(palette, mode)}><Icon name="arrowLeft" size={18} color={palette.bark}/></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 14, background: palette.sageSoft }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: palette.sageDeep, animation: 'spring-pulse 1.4s ease infinite' }}/>
            <span style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, color: palette.sageDeep, letterSpacing: 0.3 }}>Live · {fmt(seconds)}</span>
          </div>
          <button style={iconBtnStyle(palette, mode)}><Icon name="settings" size={16} color={palette.bark}/></button>
        </div>
        <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: palette.coralDeep, marginBottom: 4 }}>
          Lower body · day 3 of 4
        </div>
        <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 26, fontWeight: 500, color: palette.espresso, letterSpacing: -0.3, lineHeight: 1.1 }}>
          <em style={{ fontStyle: 'italic' }}>Strong & steady</em><br/>lower body
        </div>
      </div>

      {/* Rest timer — hero card */}
      <div style={{ padding: '0 18px' }}>
        <SpringCard palette={palette} mode={mode} padding={20}
          style={{ background: `linear-gradient(135deg, ${palette.coral}ee, ${palette.coralDeep})`, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative' }}>
              <svg width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6"/>
                <circle cx="38" cy="38" r="32" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32} strokeDashoffset={2 * Math.PI * 32 * (1 - restPct)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SPRING_TYPE.display, fontSize: 22, fontWeight: 600, color: '#fff' }}>
                {restRemaining}s
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Resting</div>
              <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 19, fontWeight: 500, color: '#fff', lineHeight: 1.2, marginTop: 2 }}>
                Catch your breath — set 2 of walking lunges next.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => setRestRemaining(r => r + 15)} style={{ flex: 1, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: SPRING_TYPE.sans, fontSize: 13, fontWeight: 600 }}>+15s</button>
            <button onClick={() => setRestRemaining(0)} style={{ flex: 1, height: 36, borderRadius: 18, background: '#fff', color: palette.coralDeep, border: 'none', cursor: 'pointer', fontFamily: SPRING_TYPE.sans, fontSize: 13, fontWeight: 700 }}>Skip rest</button>
          </div>
        </SpringCard>
      </div>

      {/* Exercise list */}
      <div style={{ padding: '14px 18px 0' }}>
        <SectionHead palette={palette} title="Today's set" style={{ marginBottom: 12, padding: '0 4px' }}/>
        <SpringCard palette={palette} mode={mode} padding={6}>
          {WORKOUT_EXERCISES.map((ex, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px',
              borderBottom: i < arr.length - 1 ? `1px solid ${palette.coralWhisper}` : 'none',
              background: ex.current ? palette.coralWhisper : 'transparent',
              borderRadius: ex.current ? 14 : 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                background: ex.done ? palette.sageDeep : (ex.current ? palette.coralDeep : palette.cream),
                border: ex.done || ex.current ? 'none' : `1.5px solid ${palette.sand}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: ex.done || ex.current ? '#fff' : palette.stone,
                fontFamily: SPRING_TYPE.sans, fontSize: 13, fontWeight: 600,
              }}>
                {ex.done ? <Icon name="check" size={14} color="#fff" strokeWidth={3}/> : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 14, fontWeight: 600, color: palette.espresso, textDecoration: ex.done ? 'line-through' : 'none', textDecorationColor: palette.stone }}>
                  {ex.name}
                </div>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.inkSoft, marginTop: 1 }}>
                  {ex.sets} · {ex.detail}
                </div>
              </div>
              {ex.current && (
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3].map(s => (
                    <div key={s} style={{ width: 6, height: 18, borderRadius: 3, background: s === 1 ? palette.coralDeep : palette.sand }}/>
                  ))}
                </div>
              )}
            </div>
          ))}
        </SpringCard>
      </div>

      <div style={{ flex: 1, minHeight: 30 }}/>

      <div style={{ padding: '14px 18px 18px', display: 'flex', gap: 10 }}>
        <SpringBtn palette={palette} variant="outline" size="lg" style={{ flex: 1 }}>
          Pause
        </SpringBtn>
        <SpringBtn palette={palette} size="lg" style={{ flex: 1.4 }}>
          Log set <Icon name="arrowRight" size={16} color="#fff" strokeWidth={2.2}/>
        </SpringBtn>
      </div>
    </div>
  );
};

Object.assign(window, { MealPlanScreen, ActiveWorkoutScreen });
