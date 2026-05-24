import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { registerForPushNotifications } from '@/lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Request notification permission on app start
    registerForPushNotifications().catch(() => {
      // Permission denied — no push notifications, that's fine
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="register" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen
            name="property/[slug]"
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: 'Back',
              headerTintColor: '#0A1F44',
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
