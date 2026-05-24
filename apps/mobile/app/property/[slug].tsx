import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, fontSize } from '@/theme';
export default function PropertyDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <View style={s.c}><Text style={s.t}>Property: {slug}</Text></View>;
}
const s = StyleSheet.create({ c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }, t: { color: colors.navy, fontSize: fontSize.lg, fontWeight: '700' } });
