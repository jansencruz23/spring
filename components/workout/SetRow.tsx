import { Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import type { RoutineExercise } from '../../lib/workouts/routine';

type Props = {
  exercise: RoutineExercise;
  /** Position in the routine list (1-indexed for the badge). */
  index: number;
  completedSets: number;
  state: 'done' | 'current' | 'upcoming';
  isLast?: boolean;
};

/**
 * One row in the routine's exercise checklist. Displays the prescribed sets +
 * detail, and a small bar pip per set (filled for completed, hollow for
 * upcoming) on the current exercise. Done rows get a green check; upcoming
 * rows show a hollow number badge.
 */
export function SetRow({ exercise, index, completedSets, state, isLast }: Props) {
  const { palette } = useTheme();

  const isDone = state === 'done';
  const isCurrent = state === 'current';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: palette.coralWhisper,
        backgroundColor: isCurrent ? palette.coralWhisper : 'transparent',
        borderRadius: isCurrent ? 14 : 0,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: isDone
            ? palette.sageDeep
            : isCurrent
              ? palette.coralDeep
              : palette.cream,
          borderWidth: isDone || isCurrent ? 0 : 1.5,
          borderColor: palette.sand,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isDone ? (
          <Check size={14} color="#FFFFFF" strokeWidth={3} />
        ) : (
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize: 13,
              color: isCurrent ? '#FFFFFF' : palette.stone,
            }}
          >
            {index}
          </Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 14,
            color: palette.espresso,
            textDecorationLine: isDone ? 'line-through' : 'none',
            textDecorationColor: palette.stone,
          }}
        >
          {exercise.name}
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_400Regular',
            fontSize: 11,
            color: palette.inkSoft,
            marginTop: 1,
          }}
        >
          {exercise.targetSets} × {exercise.targetReps} · {exercise.detail}
        </Text>
      </View>

      {isCurrent ? (
        <View className="flex-row" style={{ gap: 3 }}>
          {Array.from({ length: exercise.targetSets }, (_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 18,
                borderRadius: 3,
                backgroundColor: i < completedSets ? palette.coralDeep : palette.sand,
              }}
            />
          ))}
        </View>
      ) : isDone ? (
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 11,
            color: palette.sageDeep,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
          }}
        >
          Done
        </Text>
      ) : null}
    </View>
  );
}
