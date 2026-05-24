import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { submitLead } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { colors, spacing, radius, fontSize } from '@/theme';

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

type FormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', phone: '', email: '', message: '' },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await submitLead({
        property: propertyId,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        message: data.message || undefined,
        source: 'mobile',
      });
      setSubmitted(true);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to submit. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <View style={styles.success}>
        <Text style={styles.successEmoji}>✅</Text>
        <Text style={styles.successTitle}>Inquiry Sent!</Text>
        <Text style={styles.successText}>We'll contact you soon about {propertyTitle}.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Send Inquiry</Text>

      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <AppTextInput label="Your Name *" value={value} onChangeText={onChange} placeholder="Rahul Sharma" error={errors.name?.message} />
        )}
      />
      <View style={styles.gap} />
      <Controller
        control={control}
        name="phone"
        rules={{ required: 'Phone is required' }}
        render={({ field: { onChange, value } }) => (
          <AppTextInput label="Phone Number *" value={value} onChangeText={onChange} placeholder="9876543210" keyboardType="phone-pad" error={errors.phone?.message} />
        )}
      />
      <View style={styles.gap} />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <AppTextInput label="Email (optional)" value={value} onChangeText={onChange} placeholder="rahul@email.com" keyboardType="email-address" autoCapitalize="none" />
        )}
      />
      <View style={styles.gap} />
      <Controller
        control={control}
        name="message"
        render={({ field: { onChange, value } }) => (
          <AppTextInput label="Message" value={value} onChangeText={onChange} placeholder="I'm interested in this property..." multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
        )}
      />
      <View style={styles.gap} />
      <Button title={loading ? 'Sending...' : 'Send Inquiry'} onPress={handleSubmit(onSubmit)} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.base },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.navy, marginBottom: spacing.md },
  gap: { height: spacing.md },
  success: { backgroundColor: colors.green100, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  successEmoji: { fontSize: 40 },
  successTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.green700, marginTop: spacing.md },
  successText: { fontSize: fontSize.sm, color: colors.green700, textAlign: 'center', marginTop: 6 },
});
