import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView as _SafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = _SafeAreaView as any;
import type { IProperty } from '@indiatownship/types';
import { getPropertyBySlug } from '@/lib/api';
import { PropertyGallery } from '@/components/PropertyGallery';
import { InquiryForm } from '@/components/InquiryForm';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, fontSize, radius } from '@/theme';

const ADMIN_WHATSAPP = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER ?? '919876543210';
const ADMIN_PHONE = process.env.EXPO_PUBLIC_ADMIN_PHONE ?? '9876543210';

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertyDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [property, setProperty] = useState<IProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    getPropertyBySlug(slug)
      .then(setProperty)
      .catch(() => setError('Property not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  function handleCall() {
    Linking.openURL(`tel:${ADMIN_PHONE}`);
  }

  function handleWhatsApp() {
    if (!property) return;
    const msg = encodeURIComponent(
      `Hi! I'm interested in the property: ${property.title}\n${formatPrice(property.price)}\n${property.locality}, ${property.city}`
    );
    Linking.openURL(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.navy} size="large" />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>{error || 'Property not found.'}</Text>
      </View>
    );
  }

  // Map constructionStatus to a Badge variant (under_construction -> ongoing)
  const constructionBadgeVariant =
    property.constructionStatus === 'under_construction'
      ? 'ongoing'
      : (property.constructionStatus as 'new_launch' | 'ready_to_move');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll}>
        {/* Gallery */}
        <PropertyGallery images={property.images} />

        <View style={styles.content}>
          {/* Price + Title */}
          <View style={styles.badgeRow}>
            <Badge variant={property.listingType} />
            {property.constructionStatus !== 'ready_to_move' && (
              <View style={styles.badgeGap}>
                <Badge variant={constructionBadgeVariant} />
              </View>
            )}
          </View>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.locality}>📍 {property.locality}, {property.city.charAt(0).toUpperCase() + property.city.slice(1)}</Text>

          {/* Specs grid */}
          <View style={styles.specs}>
            {property.bedrooms > 0 && <SpecItem label="Bedrooms" value={`${property.bedrooms} BHK`} />}
            {property.bathrooms > 0 && <SpecItem label="Bathrooms" value={String(property.bathrooms)} />}
            <SpecItem label="Size" value={`${property.size} ${property.sizeUnit}`} />
            <SpecItem label="Status" value={property.constructionStatus.replace(/_/g, ' ')} />
            {property.facing && <SpecItem label="Facing" value={property.facing.replace(/_/g, ' ')} />}
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaRow}>
            <TouchableOpacity style={[styles.ctaBtn, styles.callBtn]} onPress={handleCall}>
              <Text style={styles.ctaBtnText}>📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaBtn, styles.waBtn]} onPress={handleWhatsApp}>
              <Text style={styles.ctaBtnText}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {property.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this Property</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          ) : null}

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenities}>
                {property.amenities.map((a) => (
                  <View key={a} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>✓ {a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Inquiry Form */}
          <View style={styles.section}>
            <InquiryForm propertyId={property._id} propertyTitle={property.title} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specItem}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.base },
  errorEmoji: { fontSize: 40 },
  errorText: { fontSize: fontSize.base, color: colors.gray500, marginTop: spacing.md },
  content: { padding: spacing.base },
  badgeRow: { flexDirection: 'row', marginBottom: spacing.sm, marginTop: spacing.md },
  badgeGap: { marginLeft: 6 },
  price: { fontSize: fontSize['3xl'], fontWeight: '800', color: colors.navy },
  title: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray900, marginTop: 4 },
  locality: { fontSize: fontSize.sm, color: colors.gray500, marginTop: 4, marginBottom: spacing.md },
  specs: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.gray50, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, marginBottom: spacing.lg },
  specItem: { width: '45%' },
  specLabel: { fontSize: fontSize.xs, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5 },
  specValue: { fontSize: fontSize.base, fontWeight: '600', color: colors.navy, marginTop: 2, textTransform: 'capitalize' },
  ctaRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  ctaBtn: { flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  callBtn: { backgroundColor: colors.navy },
  waBtn: { backgroundColor: '#25D366' },
  ctaBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.base },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.navy, marginBottom: spacing.md },
  description: { fontSize: fontSize.base, color: colors.gray700, lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenityChip: { backgroundColor: colors.gray100, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  amenityText: { fontSize: fontSize.sm, color: colors.gray700 },
});
