import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { colors, spacing, fontSize } from '@/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (val: string) => setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleRegister() {
    if (!form.name || !form.phone || !form.password) {
      setError('Name, phone, and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.phone, form.password, form.email || undefined);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
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
        <Text style={styles.subtitle}>Create your account</Text>

        {error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <AppTextInput label="Full Name *" value={form.name} onChangeText={set('name')} placeholder="Rahul Sharma" autoComplete="name" />
        <View style={styles.gap} />
        <AppTextInput label="Phone Number *" value={form.phone} onChangeText={set('phone')} placeholder="9876543210" keyboardType="phone-pad" />
        <View style={styles.gap} />
        <AppTextInput label="Email (optional)" value={form.email} onChangeText={set('email')} placeholder="rahul@email.com" keyboardType="email-address" autoCapitalize="none" />
        <View style={styles.gap} />
        <AppTextInput label="Password *" value={form.password} onChangeText={set('password')} placeholder="Min 8 characters" secureTextEntry />
        <View style={styles.gap} />
        <Button title={loading ? 'Creating account...' : 'Create Account'} onPress={handleRegister} loading={loading} />

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.switchLink}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.switchTextBold}>Sign In</Text>
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
