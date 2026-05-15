// spring-home.jsx — Today / Home screen

const HomeScreen = ({ palette, mode, openChat, openContext }) => {
  const [water, setWater] = React.useState(5);
  const [supplement, setSupplement] = React.useState({ vitD: true, omega: true, creatine: false, mag: false });
  const waterGoal = 8;

  return (
    <div className="spring-scroll" style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
      {/* Hero — warm gradient */}
      <div style={{
        background: `linear-gradient(180deg, ${palette.coralWhisper} 0%, ${palette.cream} 90%)`,
        padding: '14px 22px 22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <SpringWordmark palette={palette} size={20} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={iconBtnStyle(palette, mode)}><Icon name="bell" size={18} color={palette.bark}/></button>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: `linear-gradient(135deg, ${palette.butter}, ${palette.coral})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SPRING_TYPE.sans, fontSize: 13, fontWeight: 700, color: '#fff' }}>M</div>
          </div>
        </div>

        <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 13, fontWeight: 600, color: palette.coralDeep, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
          Wednesday · Bright morning
        </div>
        <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 30, fontWeight: 500, color: palette.espresso, lineHeight: 1.1, letterSpacing: -0.4 }}>
          Good morning,<br/><em style={{ fontStyle: 'italic', color: palette.coralDeep }}>Maya.</em>
        </div>
        <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 14, color: palette.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
          You slept 7h 42m — that's your best stretch this week. A gentle start sounds about right.
        </div>
      </div>

      {/* Energy ring + macros — primary unit */}
      <div style={{ padding: '0 18px' }}>
        <SpringCard palette={palette} mode={mode} padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <EnergyRing palette={palette} consumed={1240} target={1940} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, color: palette.inkSoft, fontWeight: 600 }}>Today's energy</div>
              <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 28, fontWeight: 500, color: palette.espresso, lineHeight: 1, marginTop: 2 }}>
                700 <span style={{ fontSize: 13, color: palette.inkSoft, fontFamily: SPRING_TYPE.sans, fontWeight: 500 }}>left</span>
              </div>
              <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 12, color: palette.bark, marginTop: 8, lineHeight: 1.45 }}>
                Plenty of room for dinner — you're tracking gently.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {[
              { l: 'Protein', v: 78, g: 120, c: palette.coral, cd: palette.coralDeep },
              { l: 'Carbs',   v: 142, g: 220, c: palette.butter, cd: palette.butterDeep },
              { l: 'Fat',     v: 38,  g: 65,  c: palette.sage, cd: palette.sageDeep },
            ].map(m => (
              <div key={m.l} style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, color: palette.inkSoft }}>{m.l}</span>
                  <span style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.bark, fontWeight: 600 }}>{m.v}<span style={{ color: palette.stone, fontWeight: 500 }}>/{m.g}g</span></span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: palette.cream, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(m.v/m.g)*100}%`, background: `linear-gradient(90deg, ${m.c}, ${m.cd})`, borderRadius: 3,
                    animation: 'spring-fillbar .9s cubic-bezier(.2,.7,.3,1) both' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <AskAboutChip palette={palette} label="Ask about today" onClick={() => openContext?.('How am I tracking my macros today?')}/>
          </div>
        </SpringCard>
      </div>

      {/* Two-up: workout + sleep */}
      <div style={{ padding: '14px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SpringCard palette={palette} mode={mode} padding={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: palette.sageSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="train" size={15} color={palette.sageDeep} />
            </div>
            <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Today</div>
          </div>
          <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 18, fontWeight: 500, color: palette.espresso, lineHeight: 1.15 }}>
            Lower body<br/><span style={{ color: palette.sageDeep }}>+ mobility</span>
          </div>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.inkSoft, marginTop: 8 }}>5 exercises · ~38 min</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ width: 16, height: 4, borderRadius: 2, background: i <= 0 ? palette.sageDeep : palette.sand }}/>
              ))}
            </div>
            <Icon name="chevronRight" size={16} color={palette.stone}/>
          </div>
        </SpringCard>

        <SpringCard palette={palette} mode={mode} padding={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: '#3D3759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="moon" size={15} color="#E0DBF5" />
            </div>
            <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Last night</div>
          </div>
          <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 18, fontWeight: 500, color: palette.espresso, lineHeight: 1.15 }}>
            7h 42m<br/><span style={{ color: '#7A6FA0' }}>Restful</span>
          </div>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.inkSoft, marginTop: 8 }}>Score 84 · best this week</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 2, alignItems: 'flex-end', height: 22 }}>
            {[8, 14, 22, 18, 12, 16, 22].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h, borderRadius: 2, background: i === 6 ? palette.coralDeep : '#7A6FA0', opacity: i === 6 ? 1 : 0.6 }}/>
            ))}
          </div>
        </SpringCard>
      </div>

      {/* Hydration */}
      <div style={{ padding: '14px 18px 0' }}>
        <SpringCard palette={palette} mode={mode} padding={18}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: palette.butterSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="drop" size={16} color={palette.butterDeep}/>
              </div>
              <div>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 14, fontWeight: 600, color: palette.espresso }}>Hydration</div>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.inkSoft }}>{water * 250}ml of {waterGoal * 250}ml</div>
              </div>
            </div>
            <button onClick={() => setWater(Math.min(waterGoal + 2, water + 1))} style={{
              width: 36, height: 36, borderRadius: 18, border: 'none',
              background: `linear-gradient(135deg, ${palette.coral}, ${palette.coralDeep})`, color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 14px -4px ${palette.coralDeep}88`,
            }}>
              <Icon name="plus" size={18} color="#fff" strokeWidth={2.5}/>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: waterGoal }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 30, borderRadius: 6,
                background: i < water ? `linear-gradient(180deg, ${palette.butter}, ${palette.butterDeep})` : palette.cream,
                border: `1px solid ${i < water ? 'transparent' : palette.sand}`,
                transition: 'all .3s cubic-bezier(.2,.7,.3,1)',
                position: 'relative', overflow: 'hidden',
              }}>
                {i < water && (
                  <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}/>
                )}
              </div>
            ))}
          </div>
        </SpringCard>
      </div>

      {/* Supplements */}
      <div style={{ padding: '14px 18px 0' }}>
        <SectionHead palette={palette} title="Supplements" action="View all" style={{ marginBottom: 12, padding: '0 4px' }}/>
        <SpringCard palette={palette} mode={mode} padding={6}>
          {[
            { k: 'vitD',     name: 'Vitamin D3', sub: 'with breakfast · 2000 IU', icon: 'pill', tint: palette.butterSoft, c: palette.butterDeep },
            { k: 'omega',    name: 'Omega-3',    sub: 'with breakfast · 1000 mg', icon: 'pill', tint: palette.coralSoft,  c: palette.coralDeep },
            { k: 'creatine', name: 'Creatine',   sub: 'after workout · 5 g',      icon: 'pill', tint: palette.sageSoft,   c: palette.sageDeep },
            { k: 'mag',      name: 'Magnesium',  sub: 'before bed · 400 mg',      icon: 'pill', tint: '#E5DDF0',           c: '#7A6FA0' },
          ].map((s, i, arr) => (
            <div key={s.k} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 12px',
              borderBottom: i < arr.length - 1 ? `1px solid ${palette.coralWhisper}` : 'none',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: s.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={16} color={s.c}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 14, fontWeight: 600, color: palette.espresso, textDecoration: supplement[s.k] ? 'line-through' : 'none', textDecorationColor: palette.stone }}>{s.name}</div>
                <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.inkSoft, marginTop: 1 }}>{s.sub}</div>
              </div>
              <button onClick={() => setSupplement({ ...supplement, [s.k]: !supplement[s.k] })}
                style={{
                  width: 26, height: 26, borderRadius: 13,
                  background: supplement[s.k] ? palette.sageDeep : 'transparent',
                  border: `1.5px solid ${supplement[s.k] ? palette.sageDeep : palette.sand}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  animation: supplement[s.k] ? 'spring-bloom .35s ease' : 'none',
                }}>
                {supplement[s.k] && <Icon name="check" size={13} color="#fff" strokeWidth={3}/>}
              </button>
            </div>
          ))}
        </SpringCard>
      </div>

      <div style={{ height: 120 }}/>
    </div>
  );
};

const iconBtnStyle = (palette, mode) => ({
  width: 36, height: 36, borderRadius: 18, border: 'none',
  background: mode === 'dark' ? palette.ivory : '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  boxShadow: mode === 'dark' ? 'none' : '0 2px 6px -2px rgba(120,80,50,0.15)',
});

const EnergyRing = ({ palette, consumed, target, size = 88 }) => {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = Math.min(consumed / target, 1);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={palette.coralWhisper} strokeWidth="7" />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.coral}/>
            <stop offset="100%" stopColor={palette.coralDeep}/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.3,1)' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 22, fontWeight: 600, color: palette.espresso, lineHeight: 1 }}>
          {Math.round(pct * 100)}<span style={{ fontSize: 12, color: palette.inkSoft, fontWeight: 500 }}>%</span>
        </div>
        <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 9, fontWeight: 600, color: palette.inkSoft, marginTop: 1, letterSpacing: 0.5, textTransform: 'uppercase' }}>fueled</div>
      </div>
    </div>
  );
};

Object.assign(window, { HomeScreen, EnergyRing, iconBtnStyle });
