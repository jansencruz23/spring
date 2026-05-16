import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SpringCard } from '../primitives/SpringCard';
import { useTheme } from '../../lib/theme';
import { useApplyMealSwap, useMealSwap } from '../../lib/api/hooks';
import type { MealPlan } from '../../lib/api';
import type { MealSwapSuggestion } from '../../lib/schemas/chat';

type Props = {
  plan: MealPlan | null;
  date: string;
  onClose: () => void;
};

/**
 * Modal that requests a meal swap from the AI on open, then lets the user
 * accept or dismiss the suggestion. Accepting applies the swap optimistically
 * via React Query.
 */
export function SwapSheet({ plan, date, onClose }: Props) {
  const { mode, palette } = useTheme();
  const visible = !!plan;
  const swap = useMealSwap();
  const apply = useApplyMealSwap(plan?.user_id, date);

  // Trigger the swap request when the modal opens for a new plan. The reset
  // makes the loading state visible if the user opens, dismisses, then opens
  // again for a different plan.
  useEffect(() => {
    if (!plan) {
      swap.reset();
      return;
    }
    swap.mutate({
      food_name: plan.food_name,
      slot: plan.slot,
      kcal: plan.kcal,
      protein_g: plan.protein_g,
      carbs_g: plan.carbs_g,
      fat_g: plan.fat_g,
      tags: plan.tags,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id]);

  const [applied, setApplied] = useState(false);
  useEffect(() => {
    if (!visible) setApplied(false);
  }, [visible]);

  const handleApply = () => {
    if (!plan || !swap.data) return;
    apply.mutate(
      {
        planId: plan.id,
        swap: {
          food_name: swap.data.food_name,
          kcal: swap.data.kcal,
          protein_g: swap.data.protein_g,
          carbs_g: swap.data.carbs_g,
          fat_g: swap.data.fat_g,
          tags: swap.data.tags,
        },
      },
      {
        onSuccess: () => {
          setApplied(true);
          setTimeout(onClose, 700);
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(36, 22, 14, 0.45)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: mode === 'dark' ? palette.cream : palette.cream,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 18,
            paddingBottom: 30,
            gap: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={[palette.butter, palette.coral]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Sparkles size={14} color="#FFFFFF" strokeWidth={2.2} />
                </LinearGradient>
              </View>
              <Text
                style={{
                  fontFamily: 'Fraunces_500Medium',
                  fontSize: 18,
                  color: palette.espresso,
                  letterSpacing: -0.2,
                }}
              >
                Spring suggests
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: palette.ivory,
              }}
            >
              <X size={16} color={palette.bark} strokeWidth={2} />
            </Pressable>
          </View>

          {plan ? (
            <Text
              style={{
                fontFamily: 'PlusJakartaSans_500Medium',
                fontSize: 12,
                color: palette.inkSoft,
              }}
            >
              Swapping{' '}
              <Text style={{ color: palette.bark, fontWeight: '600' }}>
                {plan.food_name}
              </Text>{' '}
              ({plan.kcal} kcal · {plan.protein_g}g protein)
            </Text>
          ) : null}

          {swap.isPending ? (
            <SpringCard padding="m">
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 12,
                }}
              >
                <ActivityIndicator color={palette.coralDeep} />
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_500Medium',
                    fontSize: 14,
                    color: palette.inkSoft,
                  }}
                >
                  Looking for a thoughtful alternative…
                </Text>
              </View>
            </SpringCard>
          ) : swap.isError ? (
            <SpringCard padding="m">
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  fontSize: 13,
                  color: palette.danger,
                  marginBottom: 4,
                }}
              >
                Couldn't reach Spring
              </Text>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_400Regular',
                  fontSize: 12,
                  color: palette.inkSoft,
                }}
              >
                {swap.error instanceof Error ? swap.error.message : String(swap.error)}
              </Text>
            </SpringCard>
          ) : swap.data ? (
            <SuggestionCard suggestion={swap.data} />
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 25,
                borderWidth: 1.5,
                borderColor: palette.sand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_600SemiBold',
                  fontSize: 14,
                  color: palette.bark,
                }}
              >
                Keep original
              </Text>
            </Pressable>
            <Pressable
              onPress={swap.data && !applied ? handleApply : undefined}
              disabled={!swap.data || applied || apply.isPending}
              style={{
                flex: 1.3,
                height: 50,
                borderRadius: 25,
                overflow: 'hidden',
                opacity: swap.data && !apply.isPending ? 1 : 0.5,
              }}
            >
              <LinearGradient
                colors={
                  applied
                    ? [palette.sage, palette.sageDeep]
                    : [palette.coral, palette.coralDeep]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {apply.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_700Bold',
                      fontSize: 14,
                      color: '#FFFFFF',
                    }}
                  >
                    {applied ? 'Swapped' : 'Use this'}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SuggestionCard({ suggestion }: { suggestion: MealSwapSuggestion }) {
  const { palette } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <SpringCard padding="m">
        <Text
          style={{
            fontFamily: 'Fraunces_500Medium',
            fontSize: 19,
            color: palette.espresso,
            letterSpacing: -0.2,
            lineHeight: 24,
          }}
        >
          {suggestion.food_name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          <Macro value={suggestion.kcal} unit="kcal" />
          <Macro value={`${suggestion.protein_g}g`} unit="protein" />
          <Macro value={`${suggestion.carbs_g}g`} unit="carbs" />
          <Macro value={`${suggestion.fat_g}g`} unit="fat" />
        </View>
        {suggestion.tags.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {suggestion.tags.map((t) => (
              <View
                key={t}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  backgroundColor: palette.coralSoft,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    fontSize: 10,
                    color: palette.coralDeep,
                  }}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_400Regular',
            fontSize: 13,
            color: palette.inkSoft,
            lineHeight: 18,
            marginTop: 12,
            fontStyle: 'italic',
          }}
        >
          “{suggestion.reason}”
        </Text>
      </SpringCard>
    </Animated.View>
  );
}

function Macro({ value, unit }: { value: number | string; unit: string }) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 13,
          color: palette.bark,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 11,
          color: palette.inkSoft,
        }}
      >
        {unit}
      </Text>
    </View>
  );
}
