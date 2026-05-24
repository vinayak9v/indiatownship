import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = RNSafeAreaView as any;
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, radius } from '@/theme';

function MenuItem({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  if (!user) {
    // Not logged in
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.guestSection}>
            <Text style={styles.guestEmoji}>👤</Text>
            <Text style={styles.guestTitle}>Sign in to your account</Text>
            <Text style={styles.guestText}>Save properties, set alerts, and track your inquiries.</Text>
            <View style={styles.guestGap} />
            <Button title="Sign In" onPress={() => router.push('/login')} />
            <View style={styles.guestGap} />
            <Button title="Create Account" variant="outline" onPress={() => router.push('/register')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Logged in
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profilePhone}>{user.phone}</Text>
            {user.email ? <Text style={styles.profileEmail}>{user.email}</Text> : null}
          </View>
        </View>

        <View style={styles.menuCard}>
          <MenuItem emoji="❤️" label="Saved Properties" onPress={() => router.push('/(tabs)/saved')} />
          <View style={styles.divider} />
          <MenuItem emoji="🔍" label="Search Properties" onPress={() => router.push('/(tabs)/search')} />
        </View>

        <View style={styles.logoutSection}>
          <Button title="Sign Out" variant="outline" onPress={handleLogout} />
        </View>

        <Text style={styles.version}>IndiaTownship v1.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  content: { flex: 1, padding: spacing.base },
  guestSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  guestEmoji: { fontSize: 64 },
  guestTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy, marginTop: spacing.lg, textAlign: 'center' },
  guestText: { fontSize: fontSize.sm, color: colors.gray500, textAlign: 'center', marginTop: 8 },
  guestGap: { height: spacing.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.base },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.xl, fontWeight: '700', color: colors.white },
  profileInfo: { marginLeft: spacing.md, flex: 1 },
  profileName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gray900 },
  profilePhone: { fontSize: fontSize.sm, color: colors.gray500, marginTop: 2 },
  profileEmail: { fontSize: fontSize.sm, color: colors.gray400, marginTop: 1 },
  menuCard: { backgroundColor: colors.white, borderRadius: radius.lg, marginBottom: spacing.base },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.base },
  menuEmoji: { fontSize: 20, width: 32 },
  menuLabel: { flex: 1, fontSize: fontSize.base, color: colors.gray900 },
  menuArrow: { fontSize: 20, color: colors.gray400 },
  divider: { height: 1, backgroundColor: colors.gray100, marginLeft: spacing.base },
  logoutSection: { marginTop: 'auto', paddingTop: spacing.base },
  version: { textAlign: 'center', fontSize: fontSize.xs, color: colors.gray400, marginTop: spacing.md },
});
