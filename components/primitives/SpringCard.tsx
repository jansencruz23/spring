import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '../../lib/theme';

type Props = ViewProps & {
  children: ReactNode;
  /** Padding shorthand: 's' = 12, 'm' = 16, 'l' = 20. Defaults to 'm'. */
  padding?: 's' | 'm' | 'l';
};

/**
 * Soft rounded surface. In light mode this is pure white with a faint coral
 * shadow; in dark mode it's the warm `ivory` surface tone (no shadow because
 * the warm-dark theme is intentionally flat).
 */
export function SpringCard({ children, padding = 'm', style, className, ...rest }: Props) {
  const { mode, palette } = useTheme();
  const pad = padding === 's' ? 12 : padding === 'l' ? 20 : 16;
  return (
    <View
      {...rest}
      className={`rounded-card ${className ?? ''}`}
      style={[
        {
          padding: pad,
          backgroundColor: mode === 'dark' ? palette.ivory : '#FFFFFF',
          shadowColor: mode === 'dark' ? 'transparent' : '#8B5A3C',
          shadowOpacity: mode === 'dark' ? 0 : 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: mode === 'dark' ? 0 : 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
