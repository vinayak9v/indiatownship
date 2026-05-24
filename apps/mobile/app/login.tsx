import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { colors, spacing, fontSize } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone || !password) {
      setError('Phone and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.logo}>
          India<Text style={styles.logoGold}>Township</Text>
        </Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <AppTextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="9876543210"
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <View style={styles.gap} />
        <AppTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <View style={styles.gap} />
        <Button title={loading ? 'Signing in...' : 'Sign In'} onPress={handleLogin} loading={loading} />

        <TouchableOpacity onPress={() => router.push('/register')} style={styles.switchLink}>
          <Text style={styles.switchText}>
            Don't have an account? <Text style={styles.switchTextBold}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.navy, justifyContent: 'center', padding: spacing.base },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: spacing.xl },
  logo: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.navy, textAlign: 'center' },
  logoGold: { color: colors.gold },
  subtitle: { fontSize: fontSize.sm, color: colors.gray500, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  errorText: { color: colors.red500, fontSize: fontSize.sm },
  gap: { height: spacing.md },
  switchLink: { marginTop: spacing.lg, alignItems: 'center' },
  switchText: { fontSize: fontSize.sm, color: colors.gray500 },
  switchTextBold: { fontWeight: '600', color: colors.navy },
});
