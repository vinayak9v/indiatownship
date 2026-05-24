import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize } from '@/theme';

type BadgeVariant = 'buy' | 'rent' | 'new_launch' | 'ongoing' | 'ready_to_move' | 'featured' | 'luxury';

const variantStyles: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
  buy: { bg: colors.blue100, text: colors.blue700, label: 'For Sale' },
  rent: { bg: colors.yellow100, text: colors.yellow700, label: 'For Rent' },
  new_launch: { bg: '#EDE9FE', text: '#6D28D9', label: 'New Launch' },
  ongoing: { bg: colors.yellow100, text: colors.yellow700, label: 'Ongoing' },
  ready_to_move: { bg: colors.green100, text: colors.green700, label: 'Ready to Move' },
  featured: { bg: '#FEF3C7', text: '#92400E', label: 'Featured' },
  luxury: { bg: '#FDF2E9', text: '#92400E', label: 'Luxury' },
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  const s = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  text: { fontSize: fontSize.xs, fontWeight: '600' },
});
