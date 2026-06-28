import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealStore } from '../src/store/useMealStore';
import { AUTH_SEEN_KEY } from './auth';

export default function RootLayout() {
  const init = useMealStore((s) => s.init);
  const isLoading = useMealStore((s) => s.isLoading);
  const isAnonymous = useMealStore((s) => s.isAnonymous);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      init();
    }
  }, []);

  // After the store finishes loading, decide whether to show the auth screen
  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.getItem(AUTH_SEEN_KEY).then((seen) => {
      if (!seen && isAnonymous) {
        router.replace('/auth');
      }
      setAuthChecked(true);
    });
  }, [isLoading]);

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
        {(isLoading || !authChecked) && (
          <View style={styles.splash}>
            <ActivityIndicator size="large" color="#007A3D" />
          </View>
        )}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
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
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
