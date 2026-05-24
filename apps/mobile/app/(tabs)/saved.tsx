import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '@/theme';
export default function SavedScreen() {
  return <View style={s.c}><Text style={s.t}>Saved</Text></View>;
}
const s = StyleSheet.create({ c: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }, t: { color: colors.navy, fontSize: fontSize.lg, fontWeight: '700' } });
