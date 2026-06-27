import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert, Image,
  ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useMealStore } from '../../src/store/useMealStore';
import { useGoogleSignIn, signOut } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { CameraIcon, XIcon } from '../../src/components/icons';

function calcBMI(weight?: number, height?: number): number | null {
  if (!weight || !height || height === 0) return null;
  return weight / Math.pow(height / 100, 2);
}

function bmiInfo(bmi: number): { label: string; color: string; bg: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6', bg: '#EFF6FF' };
  if (bmi < 25)   return { label: 'Normal weight', color: '#16A34A', bg: '#F0FDF4' };
  if (bmi < 30)   return { label: 'Overweight', color: '#F59E0B', bg: '#FFFBEB' };
  return           { label: 'Obese', color: '#EF4444', bg: '#FEF2F2' };
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

async function imageUriToBytes(uri: string): Promise<Uint8Array> {
  if (Platform.OS === 'web') {
    const blob = await fetch(uri).then((response) => response.blob());
    return new Uint8Array(await blob.arrayBuffer());
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });
  return base64ToUint8Array(base64);
}

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();
  const profile = useMealStore((s) => s.profile);
  const setProfile = useMealStore((s) => s.setProfile);
  const isAnonymous = useMealStore((s) => s.isAnonymous);
  const userId = useMealStore((s) => s.userId);
  const { signInWithGoogle, ready: googleReady } = useGoogleSignIn();

  const [name, setName]     = useState(profile?.name ?? '');
  const [weight, setWeight] = useState(profile?.weight_kg?.toString() ?? '');
  const [height, setHeight] = useState(profile?.height_cm?.toString() ?? '');
  const [age, setAge]       = useState(profile?.age?.toString() ?? '');
  const [goal, setGoal]     = useState(profile?.daily_calorie_goal?.toString() ?? '2200');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setWeight(profile.weight_kg?.toString() ?? '');
      setHeight(profile.height_cm?.toString() ?? '');
      setAge(profile.age?.toString() ?? '');
      setGoal(profile.daily_calorie_goal?.toString() ?? '2200');
    }
  }, [profile]);

  const liveWeight = parseFloat(weight) || undefined;
  const liveHeight = parseFloat(height) || undefined;
  const bmi = calcBMI(liveWeight, liveHeight);
  const bmi_ = bmi ? bmiInfo(bmi) : null;

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-GH', { month: 'long', year: 'numeric' })
    : null;

  const avatarUrl = profile?.avatar_url;
  const avatarLetter = name ? name[0].toUpperCase() : (profile?.email?.[0]?.toUpperCase() ?? '?');

  const save = async () => {
    await setProfile({
      name: name.trim() || undefined,
      weight_kg: weight ? parseFloat(weight) : undefined,
      height_cm: height ? parseFloat(height) : undefined,
      age: age ? parseInt(age) : undefined,
      daily_calorie_goal: parseInt(goal) || 2200,
    });
    Alert.alert('Saved', 'Profile updated.');
  };

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo library access to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });

    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setUploadingAvatar(true);

    try {
      if (userId) {
        // Upload to Supabase Storage
        const bytes = await imageUriToBytes(uri);
        const path = `${userId}/avatar.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
          await setProfile({ avatar_url: publicUrl });
        } else {
          // Storage not configured — save local URI so it at least shows this session
          await setProfile({ avatar_url: uri });
        }
      } else {
        await setProfile({ avatar_url: uri });
      }
    } catch {
      await setProfile({ avatar_url: uri });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'You will lose access to your synced data on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        {/* Sign out button — top right, always visible */}
        {!isAnonymous && (
          <TouchableOpacity style={styles.signOutHeaderBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <Text style={styles.signOutHeaderText}>Sign out</Text>
          </TouchableOpacity>
        )}

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleAvatarPress}
          activeOpacity={0.85}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
          )}
          {uploadingAvatar ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <View style={styles.cameraOverlay}>
              <CameraIcon size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.headerName}>{name || 'Your Name'}</Text>
        {profile?.email && !isAnonymous && (
          <Text style={styles.headerSub}>{profile.email}</Text>
        )}
        {memberSince && (
          <Text style={styles.headerSub}>Member since {memberSince}</Text>
        )}
      </View>

      <View style={styles.body}>
        {/* Sign in prompt for anonymous users */}
        {isAnonymous && (
          <View style={styles.signInBanner}>
            <View style={styles.signInBannerText}>
              <Text style={styles.signInBannerTitle}>Back up your data</Text>
              <Text style={styles.signInBannerSub}>Sign in to sync across devices and never lose your history.</Text>
            </View>
            <TouchableOpacity
              style={styles.signInBannerBtn}
              onPress={signInWithGoogle}
              disabled={!googleReady}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBannerBtnText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BMI */}
        {bmi && bmi_ && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Body Mass Index</Text>
            <View style={styles.bmiTopRow}>
              <View style={[styles.bmiValueBox, { backgroundColor: bmi_.bg }]}>
                <Text style={[styles.bmiValue, { color: bmi_.color }]}>{bmi.toFixed(1)}</Text>
                <Text style={[styles.bmiCat, { color: bmi_.color }]}>{bmi_.label}</Text>
              </View>
              <View style={styles.bmiStats}>
                <BmiStat label="Weight" value={`${liveWeight} kg`} />
                <BmiStat label="Height" value={`${liveHeight} cm`} />
                {age ? <BmiStat label="Age" value={`${age} yrs`} /> : null}
              </View>
            </View>
            <View style={styles.bmiBarRow}>
              {[
                { color: '#3B82F6', flex: 18 },
                { color: '#16A34A', flex: 32 },
                { color: '#F59E0B', flex: 25 },
                { color: '#EF4444', flex: 25 },
              ].map((seg, i, arr) => (
                <View
                  key={i}
                  style={[
                    styles.bmiSeg,
                    { flex: seg.flex, backgroundColor: seg.color },
                    i === 0 && styles.bmiSegLeft,
                    i === arr.length - 1 && styles.bmiSegRight,
                  ]}
                />
              ))}
              <View
                style={[
                  styles.bmiPin,
                  { left: `${Math.min(Math.max(((bmi - 15) / 25) * 100, 2), 96)}%` },
                ]}
              />
            </View>
            <View style={styles.bmiBarLabels}>
              {['Under', 'Normal', 'Over', 'Obese'].map((l) => (
                <Text key={l} style={styles.bmiBarLabel}>{l}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Personal info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Info</Text>
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Field label="Age" value={age} onChangeText={setAge} placeholder="e.g. 28" keyboardType="numeric" />
          <Field label="Weight" value={weight} onChangeText={setWeight} placeholder="e.g. 72" keyboardType="numeric" unit="kg" />
          <Field label="Height" value={height} onChangeText={setHeight} placeholder="e.g. 168" keyboardType="numeric" unit="cm" />
        </View>

        {/* Calorie goal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Calorie Goal</Text>
          <Text style={styles.hint}>
            Typical range: 1,500–3,000 kcal depending on your size and activity level.
          </Text>
          <Field label="Daily target" value={goal} onChangeText={setGoal} placeholder="2200" keyboardType="numeric" unit="kcal" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Sign out (full button, only for signed-in users) */}
        {!isAnonymous && (
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ChopWise · Built for Ghana</Text>
          <Text style={styles.footerSub}>Nutrition data: FAO/INFOODS WAFCT 2019</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function BmiStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 15, color: '#111827', fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType = 'default', unit,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  unit?: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={fieldStyles.row}>
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C4C9D4"
          keyboardType={keyboardType}
        />
        {unit && <Text style={fieldStyles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
  unit: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },

  header: {
    backgroundColor: '#007A3D',
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  signOutHeaderBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  signOutHeaderText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },

  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
    marginTop: 8,
    position: 'relative',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#005C2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerName: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 },

  body: { paddingHorizontal: 16, marginTop: -20, paddingBottom: 8 },

  signInBanner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#007A3D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  signInBannerText: { marginBottom: 12 },
  signInBannerTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 3 },
  signInBannerSub: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  signInBannerBtn: {
    backgroundColor: '#007A3D',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  signInBannerBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 16 },

  bmiTopRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  bmiValueBox: {
    flex: 1, borderRadius: 14, padding: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  bmiValue: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  bmiCat: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  bmiStats: { flex: 1, justifyContent: 'center' },

  bmiBarRow: {
    height: 12, flexDirection: 'row',
    borderRadius: 6, overflow: 'visible',
    position: 'relative', marginBottom: 6,
  },
  bmiSeg: { height: '100%' },
  bmiSegLeft: { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  bmiSegRight: { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
  bmiPin: {
    position: 'absolute', top: -3,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#111827', borderWidth: 3, borderColor: '#fff',
    marginLeft: -9,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  bmiBarLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  bmiBarLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },

  hint: { fontSize: 13, color: '#9CA3AF', marginBottom: 14, lineHeight: 18 },

  saveBtn: {
    backgroundColor: '#007A3D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#007A3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  signOutBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutBtnText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  footer: { alignItems: 'center', gap: 4, paddingBottom: 8 },
  footerText: { fontSize: 13, color: '#9CA3AF' },
  footerSub: { fontSize: 11, color: '#C4C9D4', textAlign: 'center' },
});
