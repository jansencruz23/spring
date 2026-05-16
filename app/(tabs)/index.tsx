import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Hero } from '../../components/home/Hero';
import { EnergyCard } from '../../components/home/EnergyCard';
import { HydrationTracker } from '../../components/home/HydrationTracker';
import { SupplementList } from '../../components/home/SupplementList';
import { PlannedCards } from '../../components/home/PlannedCards';
import { useSession } from '../../lib/auth';
import { useMealTotals, useProfile } from '../../lib/api/hooks';
import { useTheme } from '../../lib/theme';

export default function Today() {
  const { palette } = useTheme();
  const { session } = useSession();
  const userId = session?.user.id;
  const profile = useProfile(userId);
  const mealTotals = useMealTotals(userId);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream" testID="today-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={{ position: 'relative' }}>
          <LinearGradient
            colors={[palette.coralWhisper, palette.cream]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <Hero name={profile.data?.name ?? ''} />
        </View>

        <View style={{ paddingHorizontal: 18, gap: 14 }}>
          <Animated.View entering={FadeInDown.duration(420)}>
            <EnergyCard profile={profile.data ?? null} totals={mealTotals.data} />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(60)}>
            <PlannedCards />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(120)}>
            <HydrationTracker userId={userId} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(420).delay(180)}
            style={{ paddingHorizontal: 4, marginTop: 4 }}
          >
            <Text
              className="text-espresso"
              style={{ fontFamily: 'Fraunces_500Medium', fontSize: 18 }}
            >
              Supplements
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(420).delay(220)}>
            <SupplementList userId={userId} />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
