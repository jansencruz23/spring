import { Text, type TextProps } from 'react-native';

type Props = TextProps & {
  level?: 'display' | 'title' | 'eyebrow';
};

export function Heading({ level = 'title', className, children, ...rest }: Props) {
  const variant = {
    display: 'font-display-medium text-espresso text-3xl',
    title: 'font-display-medium text-espresso text-xl',
    eyebrow: 'font-sans-semibold text-stone text-xs uppercase tracking-widest',
  }[level];
  return (
    <Text {...rest} className={`${variant} ${className ?? ''}`}>
      {children}
    </Text>
  );
}

export function Body({ className, children, ...rest }: TextProps) {
  return (
    <Text {...rest} className={`font-sans text-bark text-base ${className ?? ''}`}>
      {children}
    </Text>
  );
}
