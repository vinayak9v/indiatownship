import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TouchableWithoutFeedback
} from 'react-native';
import type { City, ListingType, PropertyType } from '@indiatownship/types';
import { Button } from '@/components/ui/Button';
import { colors, spacing, radius, fontSize } from '@/theme';

export interface Filters {
  city: City | '';
  listingType: ListingType | '';
  propertyType: PropertyType | '';
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
}

export const DEFAULT_FILTERS: Filters = {
  city: '',
  listingType: '',
  propertyType: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
};

interface FilterSheetProps {
  visible: boolean;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}

function PillRow<T extends string>({
  label, options, value, onChange
}: {
  label: string;
  options: { value: T | ''; label: string }[];
  value: T | '';
  onChange: (v: T | '') => void;
}) {
  return (
    <View style={fs.group}>
      <Text style={fs.groupLabel}>{label}</Text>
      <View style={fs.pills}>
        {options.map((o) => (
          <TouchableOpacity
            key={o.value}
            style={[fs.pill, value === o.value && fs.pillActive]}
            onPress={() => onChange(value === o.value ? '' : o.value)}
          >
            <Text style={[fs.pillText, value === o.value && fs.pillTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function FilterSheet({ visible, filters, onApply, onClose }: FilterSheetProps) {
  const [local, setLocal] = useState<Filters>(filters);

  function set<K extends keyof Filters>(key: K, val: Filters[K]) {
    setLocal((f) => ({ ...f, [key]: val }));
  }

  function handleApply() {
    onApply(local);
    onClose();
  }

  function handleReset() {
    setLocal(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={fs.backdrop} />
      </TouchableWithoutFeedback>
      <View style={fs.sheet}>
        <View style={fs.handle} />
        <Text style={fs.title}>Filters</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <PillRow
            label="City"
            options={[{ value: '', label: 'Any' }, { value: 'indore', label: 'Indore' }, { value: 'bhopal', label: 'Bhopal' }]}
            value={local.city}
            onChange={(v) => set('city', v as City | '')}
          />
          <PillRow
            label="Listing Type"
            options={[{ value: '', label: 'Any' }, { value: 'buy', label: 'Buy' }, { value: 'rent', label: 'Rent' }]}
            value={local.listingType}
            onChange={(v) => set('listingType', v as ListingType | '')}
          />
          <PillRow
            label="Property Type"
            options={[
              { value: '', label: 'Any' },
              { value: 'flat', label: 'Flat' },
              { value: 'villa', label: 'Villa' },
              { value: 'house', label: 'House' },
              { value: 'plot', label: 'Plot' },
            ]}
            value={local.propertyType}
            onChange={(v) => set('propertyType', v as PropertyType | '')}
          />
          <PillRow
            label="Bedrooms"
            options={[
              { value: '', label: 'Any' },
              { value: '1', label: '1 BHK' },
              { value: '2', label: '2 BHK' },
              { value: '3', label: '3 BHK' },
              { value: '4', label: '4+ BHK' },
            ]}
            value={local.bedrooms}
            onChange={(v) => set('bedrooms', v)}
          />
        </ScrollView>

        <View style={fs.actions}>
          <View style={fs.actionHalf}>
            <Button title="Reset" variant="secondary" onPress={handleReset} />
          </View>
          <View style={[fs.actionHalf, fs.actionGap]}>
            <Button title="Apply Filters" onPress={handleApply} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const fs = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.base,
    paddingBottom: spacing['2xl'],
    maxHeight: '80%',
  },
  handle: { width: 40, height: 4, backgroundColor: colors.gray200, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.navy, marginBottom: spacing.md },
  group: { marginBottom: spacing.lg },
  groupLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray700, marginBottom: spacing.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white },
  pillActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  pillText: { fontSize: fontSize.sm, color: colors.gray700 },
  pillTextActive: { color: colors.white, fontWeight: '600' },
  actions: { flexDirection: 'row', marginTop: spacing.lg },
  actionHalf: { flex: 1 },
  actionGap: { marginLeft: spacing.md },
});
