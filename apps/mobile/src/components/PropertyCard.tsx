import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { IProperty } from '@indiatownship/types';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, radius, fontSize, shadow } from '@/theme';

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

interface PropertyCardProps {
  property: IProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const thumb = property.images[0]?.url;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => router.push(`/property/${property.slug}`)}
    >
      <View style={styles.imageWrap}>
        {thumb ? (
          <Image
            source={{ uri: thumb }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>🏠</Text>
          </View>
        )}
        <View style={styles.badgeRow}>
          <Badge variant={property.listingType} />
          {property.isFeatured && <View style={styles.badgeGap}><Badge variant="featured" /></View>}
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.price}>{formatPrice(property.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        <Text style={styles.locality} numberOfLines={1}>
          📍 {property.locality}, {property.city.charAt(0).toUpperCase() + property.city.slice(1)}
        </Text>

        <View style={styles.specs}>
          {property.bedrooms > 0 && (
            <Text style={styles.spec}>🛏 {property.bedrooms} BHK</Text>
          )}
          <Text style={styles.spec}>📐 {property.size} {property.sizeUnit}</Text>
          <Text style={styles.spec} numberOfLines={1}>
            {property.constructionStatus.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 180 },
  imagePlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 40 },
  badgeRow: { position: 'absolute', top: spacing.sm, left: spacing.sm, flexDirection: 'row' },
  badgeGap: { marginLeft: 4 },
  info: { padding: spacing.md },
  price: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy },
  title: { fontSize: fontSize.base, fontWeight: '600', color: colors.gray900, marginTop: 2, marginBottom: 4 },
  locality: { fontSize: fontSize.sm, color: colors.gray500, marginBottom: spacing.sm },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  spec: { fontSize: fontSize.xs, color: colors.gray500, backgroundColor: colors.gray100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
});
