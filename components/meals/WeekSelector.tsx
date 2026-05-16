import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/theme';
import { WEEKDAY_INITIALS, addDays, isoToday, startOfMondayWeek } from '../../lib/util/time';

type Props = {
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  weekReference?: Date;
};

/**
 * Mon→Sun chip row. The chip for "today" gets a coral ring; the selected chip
 * gets the coral gradient + lift shadow (matches the prototype's `M T W T F S S`
 * picker). Date numbers come from the actual calendar week containing
 * `weekReference` (default: today).
 */
export function WeekSelector({ selectedDate, onSelect, weekReference = new Date() }: Props) {
  const { palette, mode } = useTheme();
  const weekStart = startOfMondayWeek(weekReference);
  const todayIso = isoToday();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      iso: isoToday(d),
      initial: WEEKDAY_INITIALS[i],
      day: d.getDate(),
    };
  });

  return (
    <View className="flex-row" style={{ gap: 6 }}>
      {days.map(({ iso, initial, day }) => {
        const selected = iso === selectedDate;
        const isToday = iso === todayIso;
        return (
          <Pressable
            key={iso}
            testID={`week-day-${iso}`}
            accessibilityRole="button"
            accessibilityLabel={`${initial} the ${day}${isToday ? ', today' : ''}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(iso)}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: selected ? 'transparent' : mode === 'dark' ? palette.ivory : '#FFFFFF',
              borderColor: selected
                ? 'transparent'
                : isToday
                  ? palette.coral
                  : palette.coralWhisper,
              borderWidth: 1,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: selected ? palette.coralDeep : 'transparent',
              shadowOpacity: selected ? 0.35 : 0,
              shadowRadius: selected ? 10 : 0,
              shadowOffset: { width: 0, height: 4 },
              elevation: selected ? 4 : 0,
            }}
          >
            {selected ? (
              <LinearGradient
                colors={[palette.coral, palette.coralDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
            ) : null}
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_600SemiBold',
                fontSize: 11,
                color: selected ? 'rgba(255,255,255,0.85)' : palette.inkSoft,
                opacity: selected ? 0.9 : 0.65,
              }}
            >
              {initial}
            </Text>
            <Text
              style={{
                fontFamily: 'Fraunces_500Medium',
                fontSize: 18,
                color: selected ? '#FFFFFF' : palette.bark,
                marginTop: 1,
              }}
            >
              {day}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
