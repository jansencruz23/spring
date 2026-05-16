import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  size?: 'lg' | 'md';
  className?: string;
};

export function SpringBtn({
  children,
  onPress,
  disabled,
  variant = 'primary',
  size = 'lg',
  className,
}: Props) {
  const height = size === 'lg' ? 'h-14' : 'h-11';
  const padding = size === 'lg' ? 'px-6' : 'px-4';
  const palette =
    variant === 'primary'
      ? `bg-coral ${disabled ? 'opacity-40' : 'active:opacity-80'}`
      : `bg-transparent ${disabled ? 'opacity-40' : 'active:opacity-60'}`;
  const textCls = variant === 'primary' ? 'text-cream' : 'text-ink-soft';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-full ${height} ${padding} ${palette} ${className ?? ''}`}
      style={{ gap: 8 }}
    >
      {typeof children === 'string' ? (
        <Text className={`font-sans-semibold text-base ${textCls}`}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
