import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import { SpringAvatar } from './SpringAvatar';

export type TrendDatum = { day: string; sleep: number; effort: number };

// Defaults mirror the prototype's STARTER_MESSAGES trend card so the welcome
// state still illustrates "sleep vs. workout effort" before real data flows in.
const DEFAULT_DATA: TrendDatum[] = [
  { day: 'M', sleep: 6.8, effort: 8.2 },
  { day: 'T', sleep: 7.6, effort: 6.5 },
  { day: 'W', sleep: 8.1, effort: 5.8 },
  { day: 'T', sleep: 6.5, effort: 8.6 },
  { day: 'F', sleep: 7.9, effort: 6.0 },
  { day: 'S', sleep: 8.0, effort: 5.5 },
  { day: 'S', sleep: 7.7, effort: 6.2 },
];

const SLEEP_COLOR = '#7A6FA0';

type Props = { data?: TrendDatum[]; index?: number };

export function TrendCard({ data = DEFAULT_DATA, index = 0 }: Props) {
  const { mode, palette } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(index * 50)}
      style={{
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-end',
        marginBottom: 14,
      }}
    >
      <SpringAvatar />
      <View
        style={{
          flex: 1,
          maxWidth: '85%',
          backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          padding: 14,
          borderWidth: 1,
          borderColor: palette.coralWhisper,
        }}
      >
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 11,
            color: palette.inkSoft,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            marginBottom: 10,
          }}
        >
          Sleep vs. workout effort
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 5,
            height: 56,
          }}
        >
          {data.map((d, i) => (
            <View
              key={`${d.day}-${i}`}
              style={{
                flex: 1,
                alignItems: 'center',
                gap: 3,
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: 44,
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <View
                  style={{
                    width: '40%',
                    height: `${Math.min(100, (d.sleep / 9) * 100)}%`,
                    backgroundColor: SLEEP_COLOR,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    opacity: 0.75,
                  }}
                />
                <View
                  style={{
                    width: '40%',
                    height: `${Math.min(100, (d.effort / 10) * 100)}%`,
                    backgroundColor: palette.coralDeep,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 9,
                  color: palette.stone,
                  fontFamily: 'PlusJakartaSans_500Medium',
                }}
              >
                {d.day}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <LegendDot color={SLEEP_COLOR} label="Sleep (h)" />
          <LegendDot color={palette.coralDeep} label="Perceived effort" />
        </View>
      </View>
    </Animated.View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 10,
          color: palette.inkSoft,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
