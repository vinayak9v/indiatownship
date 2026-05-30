# IndiaTownship Mobile App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React Native + Expo mobile app (`apps/mobile`) for IndiaTownship — property browsing, search, saved list, and lead submission for Android + iOS.

**Architecture:** Expo Router (file-based navigation) with a tab navigator (Home / Search / Saved / Profile) and stack screens for property detail and auth. JWT tokens stored in Expo SecureStore, offline saved list in AsyncStorage. Shares the same Express API as web/admin — uses `Authorization: Bearer` header instead of cookies.

**Tech Stack:** Expo SDK 51, Expo Router 3, React Native 0.74, expo-secure-store, expo-notifications, @react-native-async-storage/async-storage, expo-image, expo-linking, react-hook-form, `@indiatownship/types` (monorepo workspace package)

---

## File Structure

```
apps/mobile/
├── package.json
├── app.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js               ← Monorepo workspace resolution
├── app/
│   ├── _layout.tsx               ← Root layout: AuthContext provider + fonts
│   ├── login.tsx                 ← Login screen
│   ├── register.tsx              ← Register screen
│   ├── property/
│   │   └── [slug].tsx            ← Property detail (gallery, info, CTAs)
│   └── (tabs)/
│       ├── _layout.tsx           ← Tab bar (Home/Search/Saved/Profile)
│       ├── index.tsx             ← Home screen (featured, luxury, city pick)
│       ├── search.tsx            ← Search + filter screen
│       ├── saved.tsx             ← Saved properties (AsyncStorage + API)
│       └── profile.tsx           ← Auth gate, user info, logout
├── src/
│   ├── theme.ts                  ← Colors, spacing, typography constants
│   ├── lib/
│   │   ├── api.ts                ← Typed API client (Bearer auth)
│   │   ├── auth.ts               ← SecureStore token helpers
│   │   └── storage.ts            ← AsyncStorage saved-property helpers
│   ├── context/
│   │   └── AuthContext.tsx       ← Auth state + login/logout/register actions
│   └── components/
│       ├── PropertyCard.tsx      ← Reusable property card (list + grid)
│       ├── PropertyGallery.tsx   ← Horizontal image gallery
│       ├── InquiryForm.tsx       ← Lead submission (react-hook-form)
│       ├── FilterSheet.tsx       ← Modal filter bottom sheet
│       └── ui/
│           ├── Button.tsx        ← Primary/secondary/outline variants
│           ├── AppTextInput.tsx  ← Styled text input
│           └── Badge.tsx         ← Status/type pill badge
```

---

## Task 1: Bootstrap — Package Setup + Config Files

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/metro.config.js`

- [ ] **Step 1: Create `apps/mobile/package.json`**

```json
{
  "name": "@indiatownship/mobile",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@indiatownship/types": "*",
    "@react-native-async-storage/async-storage": "1.23.1",
    "expo": "~51.0.0",
    "expo-image": "~1.12.1",
    "expo-linking": "~6.3.1",
    "expo-notifications": "~0.28.9",
    "expo-router": "~3.5.14",
    "expo-secure-store": "~13.0.2",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-hook-form": "^7.51.0",
    "react-native": "0.74.5",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "3.31.1"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.79",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create `apps/mobile/app.json`**

```json
{
  "expo": {
    "name": "IndiaTownship",
    "slug": "indiatownship",
    "version": "1.0.0",
    "scheme": "indiatownship",
    "platforms": ["ios", "android"],
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "splash": {
      "backgroundColor": "#0A1F44"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0A1F44"
      },
      "package": "com.indiatownship.app"
    },
    "ios": {
      "bundleIdentifier": "com.indiatownship.app",
      "supportsTablet": false
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "color": "#C9A84C"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

- [ ] **Step 3: Create `apps/mobile/tsconfig.json`**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 4: Create `apps/mobile/babel.config.js`**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: { '@': './src' },
        },
      ],
    ],
  };
};
```

- [ ] **Step 5: Create `apps/mobile/metro.config.js`**

This configures Metro to resolve `@indiatownship/types` from the monorepo `packages/` directory.

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo root so Metro sees packages/types
config.watchFolders = [workspaceRoot];

// Look for node_modules in both app dir and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
```

- [ ] **Step 6: Install dependencies**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm install
```

Expected: packages installed, no errors. If `@indiatownship/types` fails to resolve, run `npm install` from workspace root first:
```bash
cd /Users/vinayak/indiatownship && npm install
```

- [ ] **Step 7: Verify Expo CLI works**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npx expo doctor
```

Expected: no critical errors (warnings about EAS are fine to ignore).

- [ ] **Step 8: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/ && git commit -m "feat(mobile): bootstrap Expo app — package, config, metro monorepo setup"
```

---

## Task 2: Theme + UI Primitives

**Files:**
- Create: `apps/mobile/src/theme.ts`
- Create: `apps/mobile/src/components/ui/Button.tsx`
- Create: `apps/mobile/src/components/ui/AppTextInput.tsx`
- Create: `apps/mobile/src/components/ui/Badge.tsx`

- [ ] **Step 1: Create `src/theme.ts`**

```typescript
export const colors = {
  navy: '#0A1F44',
  navyLight: '#1A3560',
  gold: '#C9A84C',
  goldLight: '#D9BE7A',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  red500: '#EF4444',
  red50: '#FEF2F2',
  green500: '#22C55E',
  green100: '#DCFCE7',
  green700: '#15803D',
  blue100: '#DBEAFE',
  blue700: '#1D4ED8',
  yellow100: '#FEF9C3',
  yellow700: '#A16207',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
};
```

- [ ] **Step 2: Create `src/components/ui/Button.tsx`**

```typescript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, fontSize } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? colors.navy : colors.white} size="small" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: colors.navy },
  secondary: { backgroundColor: colors.gray100 },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.navy },
  danger: { backgroundColor: colors.red500 },
  disabled: { opacity: 0.5 },
  text: { fontSize: fontSize.base, fontWeight: '600' },
  primaryText: { color: colors.white },
  secondaryText: { color: colors.navy },
  outlineText: { color: colors.navy },
  dangerText: { color: colors.white },
});
```

- [ ] **Step 3: Create `src/components/ui/AppTextInput.tsx`**

```typescript
import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius, fontSize } from '@/theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function AppTextInput({ label, error, style, ...props }: AppTextInputProps) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined, style]}
        placeholderTextColor={colors.gray400}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label: { fontSize: fontSize.sm, fontWeight: '500', color: colors.gray700, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: fontSize.base,
    color: colors.gray900,
    backgroundColor: colors.white,
  },
  inputError: { borderColor: colors.red500 },
  error: { fontSize: fontSize.xs, color: colors.red500, marginTop: 4 },
});
```

- [ ] **Step 4: Create `src/components/ui/Badge.tsx`**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, fontSize } from '@/theme';

type BadgeVariant = 'buy' | 'rent' | 'new_launch' | 'ongoing' | 'ready_to_move' | 'featured' | 'luxury';

const variantStyles: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
  buy:           { bg: colors.blue100,   text: colors.blue700,   label: 'For Sale' },
  rent:          { bg: colors.yellow100, text: colors.yellow700, label: 'For Rent' },
  new_launch:    { bg: '#EDE9FE',        text: '#6D28D9',        label: 'New Launch' },
  ongoing:       { bg: colors.yellow100, text: colors.yellow700, label: 'Ongoing' },
  ready_to_move: { bg: colors.green100,  text: colors.green700,  label: 'Ready to Move' },
  featured:      { bg: '#FEF3C7',        text: '#92400E',        label: 'Featured' },
  luxury:        { bg: '#FDF2E9',        text: '#92400E',        label: 'Luxury' },
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  const s = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  text: { fontSize: fontSize.xs, fontWeight: '600' },
});
```

- [ ] **Step 5: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors (may warn about missing expo-env.d.ts — run `npx expo start` briefly to generate it if needed).

- [ ] **Step 6: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/src/ && git commit -m "feat(mobile): theme constants and UI primitives (Button, TextInput, Badge)"
```

---

## Task 3: API Client + Storage Helpers

**Files:**
- Create: `apps/mobile/src/lib/api.ts`
- Create: `apps/mobile/src/lib/auth.ts`
- Create: `apps/mobile/src/lib/storage.ts`

- [ ] **Step 1: Create `src/lib/api.ts`**

```typescript
import type { IProperty, PropertyFilters, ILead, IUser, UserAlert } from '@indiatownship/types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

// ─── Generic fetch ─────────────────────────────────────────────────────────

let _getToken: (() => Promise<string | null>) | null = null;

/** Register a token getter so api.ts can stay free of SecureStore imports */
export function registerTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }

  // DELETE returns 204 with no body
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ─── Properties ────────────────────────────────────────────────────────────

export interface PropertyListResponse {
  properties: IProperty[];
  total: number;
  page: number;
  totalPages: number;
}

export function getProperties(filters?: Partial<PropertyFilters>): Promise<PropertyListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
  }
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<PropertyListResponse>(`/properties${qs}`);
}

export function getFeaturedProperties(): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/properties/featured');
}

export function getLuxuryProperties(): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/properties/luxury');
}

export function getPropertyBySlug(slug: string): Promise<IProperty> {
  return apiFetch<IProperty>(`/properties/${slug}`);
}

// ─── Leads ─────────────────────────────────────────────────────────────────

export interface CreateLeadPayload {
  property?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: 'mobile';
}

export interface CreateLeadResponse {
  lead: ILead;
  brochureUrl?: string;
}

export function submitLead(payload: CreateLeadPayload): Promise<CreateLeadResponse> {
  return apiFetch<CreateLeadResponse>('/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export function loginApi(credentials: { phone?: string; email?: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function registerApi(data: { name: string; phone: string; password: string; email?: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── User ──────────────────────────────────────────────────────────────────

export function getMe(): Promise<IUser> {
  return apiFetch<IUser>('/users/me');
}

export function getSavedProperties(): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/users/me/saved');
}

export function savePropertyApi(propertyId: string): Promise<IUser> {
  return apiFetch<IUser>(`/users/me/saved/${propertyId}`, { method: 'POST' });
}

export function unsavePropertyApi(propertyId: string): Promise<IUser> {
  return apiFetch<IUser>(`/users/me/saved/${propertyId}`, { method: 'DELETE' });
}

export function addAlertApi(alert: Omit<UserAlert, '_id'>): Promise<IUser> {
  return apiFetch<IUser>('/users/me/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });
}
```

- [ ] **Step 2: Create `src/lib/auth.ts`**

```typescript
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'it_access_token';
const REFRESH_KEY = 'it_refresh_token';

export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
```

- [ ] **Step 3: Create `src/lib/storage.ts`**

AsyncStorage helpers for offline saved property IDs.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = 'it_saved_property_ids';

export async function getLocalSavedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function setLocalSavedIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

export async function addLocalSavedId(id: string): Promise<void> {
  const ids = await getLocalSavedIds();
  if (!ids.includes(id)) {
    await setLocalSavedIds([...ids, id]);
  }
}

export async function removeLocalSavedId(id: string): Promise<void> {
  const ids = await getLocalSavedIds();
  await setLocalSavedIds(ids.filter((i) => i !== id));
}
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/src/lib/ && git commit -m "feat(mobile): API client with Bearer auth, SecureStore helpers, AsyncStorage helpers"
```

---

## Task 4: Auth Context + Login + Register Screens

**Files:**
- Create: `apps/mobile/src/context/AuthContext.tsx`
- Create: `apps/mobile/app/login.tsx`
- Create: `apps/mobile/app/register.tsx`

- [ ] **Step 1: Create `src/context/AuthContext.tsx`**

```typescript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { IUser } from '@indiatownship/types';
import { storeTokens, getAccessToken, clearTokens } from '@/lib/auth';
import { loginApi, registerApi, getMe, registerTokenGetter } from '@/lib/api';

interface AuthState {
  user: IUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  // Register the token getter with the API client once
  useEffect(() => {
    registerTokenGetter(getAccessToken);
  }, []);

  // On mount, try to restore session
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const user = await getMe();
          setState({ user, loading: false });
        } else {
          setState({ user: null, loading: false });
        }
      } catch {
        await clearTokens();
        setState({ user: null, loading: false });
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const data = await loginApi({ phone, password });
    await storeTokens(data.accessToken, data.refreshToken);
    setState({ user: data.user, loading: false });
  }, []);

  const register = useCallback(async (name: string, phone: string, password: string, email?: string) => {
    const data = await registerApi({ name, phone, password, email });
    await storeTokens(data.accessToken, data.refreshToken);
    setState({ user: data.user, loading: false });
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setState({ user: null, loading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await getMe();
      setState((s) => ({ ...s, user }));
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Create `apps/mobile/app/login.tsx`**

```typescript
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
```

- [ ] **Step 3: Create `apps/mobile/app/register.tsx`**

```typescript
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
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/src/context/ apps/mobile/app/login.tsx apps/mobile/app/register.tsx && git commit -m "feat(mobile): AuthContext with SecureStore, login and register screens"
```

---

## Task 5: Navigation Shell

**Files:**
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/index.tsx` (stub)
- Create: `apps/mobile/app/(tabs)/search.tsx` (stub)
- Create: `apps/mobile/app/(tabs)/saved.tsx` (stub)
- Create: `apps/mobile/app/(tabs)/profile.tsx` (stub)
- Create: `apps/mobile/app/property/[slug].tsx` (stub)

- [ ] **Step 1: Create `apps/mobile/app/_layout.tsx`**

```typescript
import { useEffect } from 'react';
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
```

- [ ] **Step 2: Create `apps/mobile/app/(tabs)/_layout.tsx`**

```typescript
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, focused ? styles.labelActive : undefined]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="❤️" label="Saved" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: '#E5E7EB',
    height: 60,
    paddingBottom: 4,
  },
  tabIcon: { alignItems: 'center', paddingTop: 4 },
  emoji: { fontSize: 20 },
  label: { fontSize: 10, color: colors.gray400, marginTop: 2 },
  labelActive: { color: colors.navy, fontWeight: '600' },
});
```

- [ ] **Step 3: Create stub tab screens**

`apps/mobile/app/(tabs)/index.tsx`:
```typescript
import { View, Text } from 'react-native';
export default function HomeScreen() { return <View><Text>Home</Text></View>; }
```

`apps/mobile/app/(tabs)/search.tsx`:
```typescript
import { View, Text } from 'react-native';
export default function SearchScreen() { return <View><Text>Search</Text></View>; }
```

`apps/mobile/app/(tabs)/saved.tsx`:
```typescript
import { View, Text } from 'react-native';
export default function SavedScreen() { return <View><Text>Saved</Text></View>; }
```

`apps/mobile/app/(tabs)/profile.tsx`:
```typescript
import { View, Text } from 'react-native';
export default function ProfileScreen() { return <View><Text>Profile</Text></View>; }
```

`apps/mobile/app/property/[slug].tsx`:
```typescript
import { View, Text } from 'react-native';
export default function PropertyDetailScreen() { return <View><Text>Property Detail</Text></View>; }
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 5: Verify app starts**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && timeout 15 npx expo start --no-dev --non-interactive 2>&1 | head -20
```

Expected: "Metro waiting on..." or "Starting Metro Bundler" — no crash.

- [ ] **Step 6: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/app/ && git commit -m "feat(mobile): navigation shell — root layout, tab bar, stub screens"
```

---

## Task 6: PropertyCard Component + Home Screen

**Files:**
- Create: `apps/mobile/src/components/PropertyCard.tsx`
- Modify: `apps/mobile/app/(tabs)/index.tsx` (full implementation)

- [ ] **Step 1: Create `src/components/PropertyCard.tsx`**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { IProperty } from '@indiatownship/types';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, radius, fontSize, shadow } from '@/theme';

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

interface PropertyCardProps {
  property: IProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  const thumb = property.images[0]?.url;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => router.push(`/property/${property.slug}`)}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        {thumb ? (
          <Image
            source={{ uri: thumb }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>🏠</Text>
          </View>
        )}
        <View style={styles.badgeRow}>
          <Badge variant={property.listingType} />
          {property.isFeatured && <View style={styles.badgeGap}><Badge variant="featured" /></View>}
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.price}>{formatPrice(property.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>{property.title}</Text>
        <Text style={styles.locality} numberOfLines={1}>
          📍 {property.locality}, {property.city.charAt(0).toUpperCase() + property.city.slice(1)}
        </Text>

        {/* Specs */}
        <View style={styles.specs}>
          {property.bedrooms > 0 && (
            <Text style={styles.spec}>🛏 {property.bedrooms} BHK</Text>
          )}
          <Text style={styles.spec}>📐 {property.size} {property.sizeUnit}</Text>
          <Text style={styles.spec} numberOfLines={1}>
            {property.constructionStatus.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 180 },
  imagePlaceholder: { backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 40 },
  badgeRow: { position: 'absolute', top: spacing.sm, left: spacing.sm, flexDirection: 'row' },
  badgeGap: { marginLeft: 4 },
  info: { padding: spacing.md },
  price: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy },
  title: { fontSize: fontSize.base, fontWeight: '600', color: colors.gray900, marginTop: 2, marginBottom: 4 },
  locality: { fontSize: fontSize.sm, color: colors.gray500, marginBottom: spacing.sm },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  spec: { fontSize: fontSize.xs, color: colors.gray500, backgroundColor: colors.gray100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
});
```

- [ ] **Step 2: Replace `apps/mobile/app/(tabs)/index.tsx` with full Home screen**

```typescript
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { IProperty } from '@indiatownship/types';
import { getFeaturedProperties, getLuxuryProperties } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { colors, spacing, fontSize, radius } from '@/theme';

const CITIES = [
  { key: 'indore', label: 'Indore', emoji: '🏙️' },
  { key: 'bhopal', label: 'Bhopal', emoji: '🕌' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured] = useState<IProperty[]>([]);
  const [luxury, setLuxury] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeaturedProperties().catch(() => []),
      getLuxuryProperties().catch(() => []),
    ]).then(([f, l]) => {
      setFeatured(f);
      setLuxury(l);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>India<Text style={styles.logoGold}>Township</Text></Text>
          <Text style={styles.tagline}>Find your dream property</Text>
        </View>

        {/* City search buttons */}
        <Text style={styles.sectionTitle}>Browse by City</Text>
        <View style={styles.cityRow}>
          {CITIES.map((city) => (
            <View key={city.key} style={styles.cityHalf}>
              <TouchableOpacity
                style={styles.cityCard}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { city: city.key } })}
              >
                <Text style={styles.cityEmoji}>{city.emoji}</Text>
                <Text style={styles.cityLabel}>{city.label}</Text>
                <Text style={styles.citySubLabel}>Buy · Rent · Plots</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Featured Properties */}
        {loading ? (
          <ActivityIndicator color={colors.navy} style={styles.loader} />
        ) : (
          <>
            {featured.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Featured Projects</Text>
                {featured.slice(0, 3).map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </View>
            )}

            {luxury.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Luxury Properties</Text>
                {luxury.slice(0, 3).map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </View>
            )}

            {featured.length === 0 && luxury.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🏠</Text>
                <Text style={styles.emptyText}>No properties yet.</Text>
                <Text style={styles.emptySubText}>Check back soon!</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: spacing['3xl'] },
  header: { marginBottom: spacing.lg },
  logo: { fontSize: fontSize['2xl'], fontWeight: '800', color: colors.navy },
  logoGold: { color: colors.gold },
  tagline: { fontSize: fontSize.sm, color: colors.gray500, marginTop: 2 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.navy, marginBottom: spacing.md, marginTop: spacing.lg },
  cityRow: { flexDirection: 'row', gap: spacing.md },
  cityHalf: { flex: 1 },
  cityCard: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    padding: spacing.base,
    alignItems: 'center',
  },
  cityEmoji: { fontSize: 32, marginBottom: 6 },
  cityLabel: { fontSize: fontSize.base, fontWeight: '700', color: colors.white },
  citySubLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  loader: { marginTop: spacing['3xl'] },
  emptyState: { alignItems: 'center', paddingTop: spacing['3xl'] },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray700, marginTop: spacing.md },
  emptySubText: { fontSize: fontSize.sm, color: colors.gray400, marginTop: 4 },
});
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/src/components/PropertyCard.tsx apps/mobile/app/\(tabs\)/index.tsx && git commit -m "feat(mobile): PropertyCard component and Home screen with featured/luxury sections"
```

---

## Task 7: Search Screen + Filter Sheet

**Files:**
- Create: `apps/mobile/src/components/FilterSheet.tsx`
- Modify: `apps/mobile/app/(tabs)/search.tsx` (full implementation)

- [ ] **Step 1: Create `src/components/FilterSheet.tsx`**

```typescript
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
```

- [ ] **Step 2: Replace `apps/mobile/app/(tabs)/search.tsx` with full Search screen**

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { IProperty, City } from '@indiatownship/types';
import { getProperties } from '@/lib/api';
import { PropertyCard } from '@/components/PropertyCard';
import { FilterSheet, Filters, DEFAULT_FILTERS } from '@/components/FilterSheet';
import { colors, spacing, fontSize, radius } from '@/theme';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ city?: string }>();

  const [properties, setProperties] = useState<IProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    city: (params.city as City) ?? '',
  });

  const load = useCallback(async (f: Filters, p: number, append = false) => {
    setLoading(true);
    try {
      const res = await getProperties({
        city: f.city || undefined,
        listingType: f.listingType || undefined,
        propertyType: f.propertyType || undefined,
        minPrice: f.minPrice ? Number(f.minPrice) : undefined,
        maxPrice: f.maxPrice ? Number(f.maxPrice) : undefined,
        bedrooms: f.bedrooms ? Number(f.bedrooms) : undefined,
        page: p,
        limit: 20,
        sort: 'newest',
      });
      setTotal(res.total);
      setProperties((prev) => append ? [...prev, ...res.properties] : res.properties);
    } catch {
      // keep previous results on network error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    load(filters, 1, false);
  }, [filters, load]);

  function handleApplyFilters(f: Filters) {
    setFilters(f);
  }

  function handleLoadMore() {
    if (loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    load(filters, nextPage, true);
  }

  const activeFilterCount = [filters.city, filters.listingType, filters.propertyType, filters.bedrooms]
    .filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Properties</Text>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Text style={[styles.filterText, activeFilterCount > 0 && styles.filterTextActive]}>
            🔧 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>{total} properties found</Text>

      <FlatList
        data={properties}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No properties found.</Text>
              <Text style={styles.emptySubText}>Try changing your filters.</Text>
            </View>
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator color={colors.navy} style={styles.loader} /> : null}
      />

      <FilterSheet
        visible={showFilter}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setShowFilter(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy },
  filterBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.gray200 },
  filterBtnActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: fontSize.sm, color: colors.gray700 },
  filterTextActive: { color: colors.white, fontWeight: '600' },
  count: { fontSize: fontSize.xs, color: colors.gray500, paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.base, paddingBottom: spacing['3xl'] },
  empty: { alignItems: 'center', paddingTop: spacing['3xl'] },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.gray700, marginTop: spacing.md },
  emptySubText: { fontSize: fontSize.sm, color: colors.gray400, marginTop: 4 },
  loader: { marginVertical: spacing.base },
});
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/src/components/FilterSheet.tsx apps/mobile/app/\(tabs\)/search.tsx && git commit -m "feat(mobile): Search screen with filter bottom sheet"
```

---

## Task 8: Property Detail Screen + Inquiry Form

**Files:**
- Create: `apps/mobile/src/components/InquiryForm.tsx`
- Create: `apps/mobile/src/components/PropertyGallery.tsx`
- Modify: `apps/mobile/app/property/[slug].tsx` (full implementation)

- [ ] **Step 1: Create `src/components/PropertyGallery.tsx`**

```typescript
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import type { PropertyImage } from '@indiatownship/types';
import { colors, radius } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_SIZE = 64;

interface PropertyGalleryProps {
  images: PropertyImage[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [selected, setSelected] = useState(0);
  if (!images.length) return null;

  return (
    <View>
      {/* Main image */}
      <Image
        source={{ uri: images[selected].url }}
        style={styles.main}
        contentFit="cover"
        transition={200}
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <FlatList
          data={images}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelected(index)}
              style={[styles.thumbWrap, index === selected && styles.thumbActive]}
            >
              <Image
                source={{ uri: item.url }}
                style={styles.thumb}
                contentFit="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { width: SCREEN_WIDTH, height: 240 },
  thumbs: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  thumbWrap: { borderRadius: radius.sm, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: colors.navy },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE },
});
```

- [ ] **Step 2: Create `src/components/InquiryForm.tsx`**

```typescript
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
```

- [ ] **Step 3: Replace `apps/mobile/app/property/[slug].tsx` with full Property Detail screen**

```typescript
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, Alert, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { IProperty } from '@indiatownship/types';
import { getPropertyBySlug } from '@/lib/api';
import { PropertyGallery } from '@/components/PropertyGallery';
import { InquiryForm } from '@/components/InquiryForm';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing, fontSize, radius, shadow } from '@/theme';

// Update with actual admin WhatsApp number
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
                <Badge variant={property.constructionStatus} />
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
```

- [ ] **Step 4: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/src/components/PropertyGallery.tsx apps/mobile/src/components/InquiryForm.tsx apps/mobile/app/property/ && git commit -m "feat(mobile): property detail with gallery, tap-to-call, WhatsApp, inquiry form"
```

---

## Task 9: Saved Screen + Profile Screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/saved.tsx` (full implementation)
- Modify: `apps/mobile/app/(tabs)/profile.tsx` (full implementation)

- [ ] **Step 1: Replace `apps/mobile/app/(tabs)/saved.tsx` with full Saved screen**

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { IProperty } from '@indiatownship/types';
import { useAuth } from '@/context/AuthContext';
import { getSavedProperties, getProperties } from '@/lib/api';
import { getLocalSavedIds } from '@/lib/storage';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize } from '@/theme';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Logged in: fetch from API
        const saved = await getSavedProperties().catch(() => []);
        setProperties(saved);
      } else {
        // Logged out: fetch by local IDs
        const ids = await getLocalSavedIds();
        if (ids.length === 0) {
          setProperties([]);
        } else {
          // Fetch all and filter by saved IDs
          const res = await getProperties({ limit: 100 }).catch(() => ({ properties: [] as IProperty[], total: 0, page: 1, totalPages: 1 }));
          setProperties(res.properties.filter((p) => ids.includes(p._id)));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.navy} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Properties</Text>
      </View>
      <FlatList
        data={properties}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyTitle}>No saved properties</Text>
            <Text style={styles.emptyText}>Tap ❤️ on any property to save it here.</Text>
            <View style={styles.gap} />
            <Button title="Browse Properties" onPress={() => router.push('/(tabs)/search')} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy },
  list: { paddingHorizontal: spacing.base, paddingBottom: 80 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.base },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.navy, marginTop: spacing.lg },
  emptyText: { fontSize: fontSize.sm, color: colors.gray500, textAlign: 'center', marginTop: 6 },
  gap: { height: spacing.lg },
});
```

- [ ] **Step 2: Replace `apps/mobile/app/(tabs)/profile.tsx` with full Profile screen**

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/app/\(tabs\)/saved.tsx apps/mobile/app/\(tabs\)/profile.tsx && git commit -m "feat(mobile): Saved screen with AsyncStorage+API, Profile screen with auth gate"
```

---

## Task 10: Push Notifications + Build Verification

**Files:**
- Create: `apps/mobile/src/lib/notifications.ts`
- Verify: Full build passes

- [ ] **Step 1: Create `src/lib/notifications.ts`**

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request permission and return the Expo push token.
 * Returns null if permission denied or on web.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  });

  return token;
}
```

- [ ] **Step 2: Register push token in root layout after auth**

Modify `apps/mobile/app/_layout.tsx` to call `registerForPushNotifications` after the user logs in:

```typescript
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
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npm run type-check
```

Expected: 0 errors. If you see errors about `EXPO_PUBLIC_EAS_PROJECT_ID` being undefined, that's expected — it's only set in production EAS builds.

- [ ] **Step 4: Run expo doctor**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && npx expo doctor
```

Expected: no critical errors. Warnings about EAS not being configured are fine.

- [ ] **Step 5: Verify Metro bundler starts cleanly**

```bash
cd /Users/vinayak/indiatownship/apps/mobile && timeout 20 npx expo start --no-dev --non-interactive 2>&1 | head -30
```

Expected: "Metro waiting on exp://..." or similar — no crash, no module resolution errors.

- [ ] **Step 6: Add .env.local.example**

Create `apps/mobile/.env.local.example`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/v1
EXPO_PUBLIC_WHATSAPP_NUMBER=919876543210
EXPO_PUBLIC_ADMIN_PHONE=9876543210
EXPO_PUBLIC_EAS_PROJECT_ID=your_eas_project_id
```

- [ ] **Step 7: Final commit**

```bash
cd /Users/vinayak/indiatownship && git add apps/mobile/ && git commit -m "feat(mobile): push notifications setup and build verified — Plan 4 complete"
```

---

## Self-Review Checklist

- [ ] Tab navigator: Home / Search / Saved / Profile
- [ ] Home shows featured + luxury properties from API
- [ ] Search has filter sheet: city, listing type, property type, bedrooms
- [ ] Property detail: gallery, price, specs, amenities, description
- [ ] Tap-to-call opens phone dialer
- [ ] WhatsApp CTA opens WhatsApp with property details pre-filled
- [ ] Inquiry form submits to `POST /leads` with `source: 'mobile'`
- [ ] Saved screen: loads from AsyncStorage (guest) or API (logged in)
- [ ] Profile screen shows auth gate when logged out
- [ ] Login/Register screens store JWT in SecureStore
- [ ] Push notification permission requested on app start
- [ ] `npm run type-check` passes with 0 errors
- [ ] `npx expo doctor` passes with no critical errors
- [ ] Metro starts without module resolution errors
