import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/lib/supabase';
import { useGoogleSignIn } from '../src/lib/auth';
import { useMealStore } from '../src/store/useMealStore';

const GREEN = '#007A3D';
export const AUTH_SEEN_KEY = 'chopwise_auth_seen';

export default function AuthScreen() {
  const router = useRouter();
  const init = useMealStore((s) => s.init);
  const isAnonymous = useMealStore((s) => s.isAnonymous);
  const { signInWithGoogle, ready: googleReady } = useGoogleSignIn();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Watch for Google sign-in completing on native (hook handles the actual auth)
  const prevAnonymous = useRef(isAnonymous);
  useEffect(() => {
    if (prevAnonymous.current && !isAnonymous) {
      AsyncStorage.setItem(AUTH_SEEN_KEY, '1').then(() => router.replace('/(tabs)'));
    }
    prevAnonymous.current = isAnonymous;
  }, [isAnonymous]);

  function clearForm() {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  }

  const handleSignIn = async () => {
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      await init();
      await AsyncStorage.setItem(AUTH_SEEN_KEY, '1');
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() || undefined } },
      });
      if (authError) throw authError;
      if (data.session) {
        await init();
        await AsyncStorage.setItem(AUTH_SEEN_KEY, '1');
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Check your email',
          `A confirmation link was sent to ${email.trim()}. Click it to activate your account, then sign in.`,
          [{ text: 'OK', onPress: () => setTab('signin') }],
        );
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // Web: redirects away — no further action needed here
      // Native: handled by the useEffect above watching isAnonymous
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google sign in failed.');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(AUTH_SEEN_KEY, '1');
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.appName}>ChopWise</Text>
          <Text style={styles.tagline}>Ghana's calorie tracker</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {(['signin', 'signup'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => { setTab(t); clearForm(); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          {tab === 'signup' && (
            <Field
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder={tab === 'signup' ? 'Min. 6 characters' : 'Your password'}
            secureTextEntry
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={tab === 'signin' ? handleSignIn : handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, (!googleReady || loading) && styles.googleBtnDisabled]}
            onPress={handleGoogle}
            disabled={!googleReady || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Continue without account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C4C9D4"
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'none'}
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 48 },

  header: { alignItems: 'center', paddingTop: 72, paddingBottom: 36 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: GREEN,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 8,
  },
  logoLetter: { fontSize: 38, fontWeight: '900', color: '#fff' },
  appName: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#6B7280', marginTop: 5 },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12, padding: 4,
    marginBottom: 24,
  },
  tabBtn: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#111827' },

  form: {},
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#111827',
  },

  errorText: {
    fontSize: 13, color: '#EF4444',
    marginBottom: 10, textAlign: 'center',
  },

  primaryBtn: {
    backgroundColor: GREEN, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 4, marginBottom: 20,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerLabel: { fontSize: 13, color: '#9CA3AF', marginHorizontal: 12 },

  googleBtn: {
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', backgroundColor: '#fff',
  },
  googleBtnDisabled: { opacity: 0.5 },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  skipBtn: { alignItems: 'center', marginTop: 28 },
  skipText: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'underline' },
});
