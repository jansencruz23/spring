import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
};

export function Screen({ children, scroll = false, className }: Props) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView edges={['top', 'bottom']} className={`flex-1 bg-cream ${className ?? ''}`}>
      <Container className="flex-1 px-5">{children}</Container>
    </SafeAreaView>
  );
}
