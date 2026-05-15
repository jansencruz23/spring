import { Pressable, Switch, View } from 'react-native';
import { Body, Heading } from '../../components/primitives/Heading';
import { Screen } from '../../components/primitives/Screen';
import { useTheme } from '../../lib/theme';

export default function Settings() {
  const { mode, toggleMode, palette, accent, setAccent } = useTheme();

  const swatches: { coral: string; coralDeep: string; coralSoft: string; label: string }[] = [
    { coral: '#EFA890', coralDeep: '#D8866A', coralSoft: '#FCE5D9', label: 'Peach (default)' },
    { coral: '#9BB89A', coralDeep: '#6E8E73', coralSoft: '#E3ECDF', label: 'Sage' },
    { coral: '#F4D27A', coralDeep: '#D9B257', coralSoft: '#FAEFCB', label: 'Butter' },
    { coral: '#C8A8D6', coralDeep: '#A487B8', coralSoft: '#EEE0F4', label: 'Lavender' },
  ];

  return (
    <Screen scroll>
      <View className="pt-6 gap-6">
        <View className="gap-2">
          <Heading level="eyebrow">Tweaks</Heading>
          <Heading level="display">Make Spring yours</Heading>
        </View>

        <View className="bg-ivory rounded-card p-5 gap-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Body className="font-sans-semibold text-espresso">Dark mode</Body>
              <Body className="text-ink-soft text-sm">Currently: {mode}</Body>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{ false: palette.sand, true: palette.coralDeep }}
              thumbColor={palette.cream}
            />
          </View>
        </View>

        <View className="bg-ivory rounded-card p-5 gap-3">
          <Body className="font-sans-semibold text-espresso">Accent color</Body>
          <View className="flex-row flex-wrap gap-3">
            {swatches.map((s) => {
              const active = accent?.coral === s.coral || (!accent && s.label.startsWith('Peach'));
              return (
                <Pressable
                  key={s.label}
                  onPress={() =>
                    s.label.startsWith('Peach')
                      ? setAccent(null)
                      : setAccent({ coral: s.coral, coralDeep: s.coralDeep, coralSoft: s.coralSoft })
                  }
                  style={{ backgroundColor: s.coral }}
                  className={`h-12 w-12 rounded-full ${active ? 'border-2 border-espresso' : ''}`}
                />
              );
            })}
          </View>
          <Body className="text-ink-soft text-xs">Live accent picker — verified at M5.</Body>
        </View>
      </View>
    </Screen>
  );
}
