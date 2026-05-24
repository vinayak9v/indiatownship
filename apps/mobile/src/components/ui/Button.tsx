import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, fontSize } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? colors.navy : colors.white} size="small" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.navy },
  secondary: { backgroundColor: colors.gray100 },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.navy },
  danger: { backgroundColor: colors.red500 },
  disabled: { opacity: 0.5 },
  text: { fontSize: fontSize.base, fontWeight: '600' },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.navy },
  outlineText: { color: colors.navy },
  dangerText: { color: colors.white },
});
