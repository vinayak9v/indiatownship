import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = RNSafeAreaView as any;
import type { IProperty } from '@indiatownship/types';
import { useAuth } from '@/context/AuthContext';
import { getSavedProperties, getProperties } from '@/lib/api';
import { getLocalSavedIds } from '@/lib/storage';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize } from '@/theme';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Logged in: fetch from API
        const saved = await getSavedProperties().catch(() => []);
        setProperties(saved);
      } else {
        // Logged out: fetch by local IDs
        const ids = await getLocalSavedIds();
        if (ids.length === 0) {
          setProperties([]);
        } else {
          // Fetch all and filter by saved IDs
          const res = await getProperties({ limit: 100 }).catch(() => ({ properties: [] as IProperty[], total: 0, page: 1, totalPages: 1 }));
          setProperties(res.properties.filter((p) => ids.includes(p._id)));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.navy} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Properties</Text>
      </View>
      <FlatList
        data={properties}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyTitle}>No saved properties</Text>
            <Text style={styles.emptyText}>Tap ❤️ on any property to save it here.</Text>
            <View style={styles.gap} />
            <Button title="Browse Properties" onPress={() => router.push('/(tabs)/search')} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy },
  list: { paddingHorizontal: spacing.base, paddingBottom: 80 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.base },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy, marginTop: spacing.lg },
  emptyText: { fontSize: fontSize.sm, color: colors.gray500, textAlign: 'center', marginTop: 6 },
  gap: { height: spacing.lg },
});
