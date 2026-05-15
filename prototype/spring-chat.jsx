// spring-chat.jsx — Ask Spring (AI assistant)

const SUGGESTED_PROMPTS = [
  'How am I tracking this week?',
  'Suggest dinner under 600 cal',
  'Why am I tired today?',
  'Did I drink enough water on run days?',
];

const STARTER_MESSAGES = [
  { role: 'spring', kind: 'text', body: "Morning, Maya. You're tracking gently this week — sleep is steadier and you've hit your protein target three days running." },
  { role: 'user', kind: 'text', body: "How did my sleep affect my workouts?" },
  { role: 'spring', kind: 'text', body: "On the two nights you slept under 7 hours, your perceived effort jumped about 18% on the next-day session — and you skipped your finisher both times. The nights you slept 7.5+ hours, you finished strong." },
  { role: 'spring', kind: 'card-trend' },
  { role: 'spring', kind: 'text', body: "Sleep is doing more for your training than you might think. Want me to nudge a wind-down at 10:15 tonight?" },
];

const ChatScreen = ({ palette, mode, prefilled, onClear }) => {
  const [messages, setMessages] = React.useState(STARTER_MESSAGES);
  const [input, setInput] = React.useState(prefilled || '');
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (prefilled) setInput(prefilled);
  }, [prefilled]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const t = (text || input).trim();
    if (!t) return;
    setMessages(m => [...m, { role: 'user', kind: 'text', body: t }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'spring', kind: 'text', body: "Here's a quick read on that — give me a moment to pull together what I'm seeing in your data this week." }]);
    }, 1400);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
      background: `linear-gradient(180deg, ${palette.coralWhisper} 0%, ${palette.cream} 200px)`,
    }}>
      {/* Header */}
      <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 19, background: `linear-gradient(135deg, ${palette.butter}, ${palette.coral})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px -2px ${palette.coralDeep}55` }}>
            <Icon name="sparkle" size={18} color="#fff" strokeWidth={2.2}/>
          </div>
          <div>
            <div style={{ fontFamily: SPRING_TYPE.display, fontSize: 19, fontWeight: 500, color: palette.espresso, letterSpacing: -0.2 }}>Ask Spring</div>
            <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, color: palette.sageDeep, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: palette.sageDeep }}/> here & listening
            </div>
          </div>
        </div>
        <button onClick={onClear} style={iconBtnStyle(palette, mode)}>
          <Icon name="close" size={16} color={palette.bark}/>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="spring-scroll" style={{ flex: 1, overflow: 'auto', padding: '4px 18px 8px' }}>
        {messages.map((m, i) => <ChatBubble key={i} m={m} palette={palette} mode={mode} idx={i}/>)}
        {typing && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-end' }}>
            <SpringAvatar palette={palette}/>
            <div style={{
              background: mode === 'dark' ? palette.ivory : '#fff',
              borderRadius: '20px 20px 20px 6px',
              padding: '14px 16px', display: 'flex', gap: 4,
              border: `1px solid ${palette.coralWhisper}`,
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: palette.coralDeep, opacity: 0.6,
                  animation: `spring-pulse 1.2s ease-in-out infinite ${i * 0.15}s`,
                }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompt chips */}
      <div className="spring-scroll" style={{ overflow: 'auto', whiteSpace: 'nowrap', padding: '8px 14px' }}>
        {SUGGESTED_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 14px', borderRadius: 16, marginRight: 8,
              background: mode === 'dark' ? palette.ivory : '#fff',
              border: `1px solid ${palette.coralWhisper}`,
              fontFamily: SPRING_TYPE.sans, fontSize: 12, fontWeight: 500, color: palette.bark,
              cursor: 'pointer',
            }}>
            <Icon name="sparkle" size={11} color={palette.coralDeep} strokeWidth={2.2}/>
            {p}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div style={{ padding: '8px 16px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: mode === 'dark' ? palette.ivory : '#fff',
          border: `1.5px solid ${palette.coralWhisper}`,
          borderRadius: 26, padding: '6px 6px 6px 18px',
          boxShadow: mode === 'dark' ? 'none' : '0 4px 14px -6px rgba(120,80,50,0.15)',
        }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Ask anything about your day…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: SPRING_TYPE.sans, fontSize: 14, color: palette.espresso,
              padding: '10px 0',
            }}/>
          <button style={{ width: 36, height: 36, borderRadius: 18, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mic" size={18} color={palette.inkSoft}/>
          </button>
          <button onClick={() => send()}
            style={{
              width: 40, height: 40, borderRadius: 20, border: 'none', cursor: 'pointer',
              background: input.trim() ? `linear-gradient(135deg, ${palette.coral}, ${palette.coralDeep})` : palette.sand,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s ease',
            }}>
            <Icon name="send" size={17} color="#fff" strokeWidth={2.2}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const SpringAvatar = ({ palette }) => (
  <div style={{ width: 28, height: 28, borderRadius: 14, background: `linear-gradient(135deg, ${palette.butter}, ${palette.coral})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon name="sparkle" size={14} color="#fff" strokeWidth={2.2}/>
  </div>
);

const ChatBubble = ({ m, palette, mode, idx }) => {
  if (m.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14, animation: `spring-fadeup .35s ease both ${idx * 0.06}s` }}>
        <div style={{
          maxWidth: '80%',
          background: `linear-gradient(135deg, ${palette.coral}, ${palette.coralDeep})`,
          color: '#fff', padding: '12px 16px', borderRadius: '20px 20px 6px 20px',
          fontFamily: SPRING_TYPE.sans, fontSize: 14, lineHeight: 1.45,
          boxShadow: `0 4px 12px -4px ${palette.coralDeep}55`,
        }}>
          {m.body}
        </div>
      </div>
    );
  }

  if (m.kind === 'card-trend') {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-end', animation: `spring-fadeup .4s ease both ${idx * 0.06}s` }}>
        <SpringAvatar palette={palette}/>
        <div style={{
          maxWidth: '85%',
          background: mode === 'dark' ? palette.ivory : '#fff',
          borderRadius: '18px 18px 18px 6px', padding: 14,
          border: `1px solid ${palette.coralWhisper}`,
        }}>
          <div style={{ fontFamily: SPRING_TYPE.sans, fontSize: 11, fontWeight: 600, color: palette.inkSoft, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
            Sleep vs. workout effort
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
            {[
              { sleep: 6.8, effort: 8.2, day: 'M' },
              { sleep: 7.6, effort: 6.5, day: 'T' },
              { sleep: 8.1, effort: 5.8, day: 'W' },
              { sleep: 6.5, effort: 8.6, day: 'T' },
              { sleep: 7.9, effort: 6.0, day: 'F' },
              { sleep: 8.0, effort: 5.5, day: 'S' },
              { sleep: 7.7, effort: 6.2, day: 'S' },
            ].map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ position: 'relative', width: '100%', height: 44, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2 }}>
                  <div style={{ width: '40%', height: `${(d.sleep/9)*100}%`, background: '#7A6FA0', borderRadius: '2px 2px 0 0', opacity: 0.7 }}/>
                  <div style={{ width: '40%', height: `${(d.effort/10)*100}%`, background: palette.coralDeep, borderRadius: '2px 2px 0 0' }}/>
                </div>
                <div style={{ fontSize: 9, color: palette.stone, fontFamily: SPRING_TYPE.sans }}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontFamily: SPRING_TYPE.sans, fontSize: 10, color: palette.inkSoft }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#7A6FA0' }}/> Sleep (h)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: palette.coralDeep }}/> Perceived effort</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-end', animation: `spring-fadeup .35s ease both ${idx * 0.06}s` }}>
      <SpringAvatar palette={palette}/>
      <div style={{
        maxWidth: '80%',
        background: mode === 'dark' ? palette.ivory : '#fff',
        color: palette.bark, padding: '12px 16px',
        borderRadius: '20px 20px 20px 6px',
        fontFamily: SPRING_TYPE.sans, fontSize: 14, lineHeight: 1.5,
        border: `1px solid ${palette.coralWhisper}`,
      }}>
        {m.body}
      </div>
    </div>
  );
};

Object.assign(window, { ChatScreen, SUGGESTED_PROMPTS });
