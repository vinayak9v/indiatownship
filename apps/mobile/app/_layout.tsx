import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
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
