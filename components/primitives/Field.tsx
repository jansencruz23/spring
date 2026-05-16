import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import { useTheme } from '../../lib/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

export const Field = forwardRef<TextInput, Props>(function Field(
  { label, error, style, ...rest },
  ref,
) {
  const { palette } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text
          className="font-sans-semibold text-ink-soft"
          style={{ fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase' }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={palette.stone}
        className="bg-ivory rounded-card font-sans text-espresso"
        style={[
          {
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            borderWidth: 1,
            borderColor: error ? palette.danger : palette.coralWhisper,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text className="font-sans text-danger text-xs" style={{ lineHeight: 16 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});
