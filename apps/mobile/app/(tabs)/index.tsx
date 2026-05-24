import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeArea = SafeAreaView as any;
import type { IProperty } from '@indiatownship/types';
import { getFeaturedProperties, getLuxuryProperties } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { colors, spacing, fontSize, radius } from '@/theme';

const CITIES = [
  { key: 'indore', label: 'Indore', emoji: '🏙️' },
  { key: 'bhopal', label: 'Bhopal', emoji: '🕌' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured] = useState<IProperty[]>([]);
  const [luxury, setLuxury] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeaturedProperties().catch(() => []),
      getLuxuryProperties().catch(() => []),
    ]).then(([f, l]) => {
      setFeatured(f);
      setLuxury(l);
      setLoading(false);
    });
  }, []);

  return (
    <SafeArea style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>India<Text style={styles.logoGold}>Township</Text></Text>
          <Text style={styles.tagline}>Find your dream property</Text>
        </View>

        <Text style={styles.sectionTitle}>Browse by City</Text>
        <View style={styles.cityRow}>
          {CITIES.map((city) => (
            <View key={city.key} style={styles.cityHalf}>
              <TouchableOpacity
                style={styles.cityCard}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { city: city.key } })}
              >
                <Text style={styles.cityEmoji}>{city.emoji}</Text>
                <Text style={styles.cityLabel}>{city.label}</Text>
                <Text style={styles.citySubLabel}>Buy · Rent · Plots</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : (
          <>
            {featured.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Featured Projects</Text>
                {featured.slice(0, 3).map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </View>
            )}

            {luxury.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Luxury Properties</Text>
                {luxury.slice(0, 3).map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </View>
            )}

            {featured.length === 0 && luxury.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🏠</Text>
                <Text style={styles.emptyText}>No properties yet.</Text>
                <Text style={styles.emptySubText}>Check back soon!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing['3xl'] },
  header: { marginBottom: spacing.lg },
  logo: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.navy },
  logoGold: { color: colors.gold },
  tagline: { fontSize: fontSize.sm, color: colors.gray500, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.navy, marginBottom: spacing.md, marginTop: spacing.lg },
  cityRow: { flexDirection: 'row', gap: spacing.md },
  cityHalf: { flex: 1 },
  cityCard: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    padding: spacing.base,
    alignItems: 'center',
  },
  cityEmoji: { fontSize: 32, marginBottom: 6 },
  cityLabel: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
  citySubLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  loader: { marginTop: spacing['3xl'] },
  emptyState: { alignItems: 'center', paddingTop: spacing['3xl'] },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray700, marginTop: spacing.md },
  emptySubText: { fontSize: fontSize.sm, color: colors.gray400, marginTop: 4 },
});
