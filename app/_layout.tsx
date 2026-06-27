import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMealStore } from '../src/store/useMealStore';

export default function RootLayout() {
  const init = useMealStore((s) => s.init);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) return;
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    if (document.readyState === 'complete') {
      register();
      return;
    }
    window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="scan"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Scan Meal',
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#111827',
              headerTitleStyle: { fontWeight: '700', fontSize: 16 },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="manual-log"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Log a Meal',
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#111827',
              headerTitleStyle: { fontWeight: '700', fontSize: 16 },
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#E9EEEB' : '#F5F6F8',
    alignItems: 'center',
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    backgroundColor: '#F5F6F8',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0,
    shadowRadius: 28,
  },
});
