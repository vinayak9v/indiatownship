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
