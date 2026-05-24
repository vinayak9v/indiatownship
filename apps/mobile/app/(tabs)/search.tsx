import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = RNSafeAreaView as any;
import type { IProperty, City } from '@indiatownship/types';
import { getProperties } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { FilterSheet, Filters, DEFAULT_FILTERS } from '@/components/FilterSheet';
import { colors, spacing, fontSize, radius } from '@/theme';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ city?: string }>();

  const [properties, setProperties] = useState<IProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    city: (params.city as City) ?? '',
  });

  const load = useCallback(async (f: Filters, p: number, append = false) => {
    setLoading(true);
    try {
      const res = await getProperties({
        city: f.city || undefined,
        listingType: f.listingType || undefined,
        propertyType: f.propertyType || undefined,
        minPrice: f.minPrice ? Number(f.minPrice) : undefined,
        maxPrice: f.maxPrice ? Number(f.maxPrice) : undefined,
        bedrooms: f.bedrooms ? Number(f.bedrooms) : undefined,
        page: p,
        limit: 20,
        sort: 'newest',
      });
      setTotal(res.total);
      setProperties((prev) => append ? [...prev, ...res.properties] : res.properties);
    } catch {
      // keep previous results on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    load(filters, 1, false);
  }, [filters, load]);

  function handleApplyFilters(f: Filters) {
    setFilters(f);
  }

  function handleLoadMore() {
    if (loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    load(filters, nextPage, true);
  }

  const activeFilterCount = [filters.city, filters.listingType, filters.propertyType, filters.bedrooms]
    .filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Properties</Text>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Text style={[styles.filterText, activeFilterCount > 0 && styles.filterTextActive]}>
            🔧 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>{total} properties found</Text>

      <FlatList
        data={properties}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No properties found.</Text>
              <Text style={styles.emptySubText}>Try changing your filters.</Text>
            </View>
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator color={colors.navy} style={styles.loader} /> : null}
      />

      <FilterSheet
        visible={showFilter}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setShowFilter(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy },
  filterBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray200 },
  filterBtnActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: fontSize.sm, color: colors.gray700 },
  filterTextActive: { color: colors.white, fontWeight: '600' },
  count: { fontSize: fontSize.xs, color: colors.gray500, paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing['3xl'] },
  empty: { alignItems: 'center', paddingTop: spacing['3xl'] },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray700, marginTop: spacing.md },
  emptySubText: { fontSize: fontSize.sm, color: colors.gray400, marginTop: 4 },
  loader: { marginVertical: spacing.base },
});
