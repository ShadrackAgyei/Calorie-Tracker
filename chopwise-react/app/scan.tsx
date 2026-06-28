import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { scanMealPhoto } from '../src/lib/vision';
import { useMealStore } from '../src/store/useMealStore';
import { ScannedItem } from '../src/types';
import { GalleryIcon, WarningIcon, CheckCircleIcon } from '../src/components/icons';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const addMeal = useMealStore((s) => s.addMeal);

  const [phase, setPhase] = useState<'camera' | 'scanning' | 'review'>('camera');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('lunch');
  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is needed to scan your meals.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (!photo) return;
      setPhase('scanning');
      const items = await scanMealPhoto(photo.uri);
      if (items.length === 0) {
        Alert.alert('No food detected', 'Try taking a clearer photo of your meal.');
        setPhase('camera');
        return;
      }
      setScannedItems(items);
      setPhase('review');
    } catch (err) {
      Alert.alert('Scan failed', err instanceof Error ? err.message : 'Check your internet connection and try again.');
      setPhase('camera');
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) return;
    setPhase('scanning');
    try {
      const items = await scanMealPhoto(result.assets[0].uri);
      if (items.length === 0) {
        Alert.alert('No food detected', 'Try a different photo.');
        setPhase('camera');
        return;
      }
      setScannedItems(items);
      setPhase('review');
    } catch (err) {
      Alert.alert('Scan failed', err instanceof Error ? err.message : 'Check your internet connection and try again.');
      setPhase('camera');
    }
  };

  const handleLog = async () => {
    if (scannedItems.length === 0) return;
    await addMeal({
      logged_at: new Date().toISOString(),
      meal_type: mealType,
      items: scannedItems.map((i) => ({
        food_id: i.matched_food_id,
        name: i.name,
        portion_g: i.portion_g,
        calories: i.calories,
        protein_g: i.protein_g,
        carbs_g: i.carbs_g,
        fat_g: i.fat_g,
      })),
      total_calories: scannedItems.reduce((s, i) => s + i.calories, 0),
      total_protein_g: scannedItems.reduce((s, i) => s + i.protein_g, 0),
      total_carbs_g: scannedItems.reduce((s, i) => s + i.carbs_g, 0),
      total_fat_g: scannedItems.reduce((s, i) => s + i.fat_g, 0),
    });
    router.back();
  };

  if (phase === 'scanning') {
    return (
      <View style={styles.scanningContainer}>
        <View style={styles.scanningCard}>
          <ActivityIndicator size="large" color="#007A3D" />
          <Text style={styles.scanningText}>Analysing your meal...</Text>
          <Text style={styles.scanningSubtext}>Identifying foods with AI</Text>
        </View>
      </View>
    );
  }

  if (phase === 'review') {
    const total = scannedItems.reduce((s, i) => s + i.calories, 0);
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.reviewContent}>
          <Text style={styles.reviewTitle}>Scan Results</Text>
          <Text style={styles.reviewTotal}>{total} kcal total</Text>

          {scannedItems.map((item, i) => (
            <View key={i} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultCal}>{item.calories} kcal</Text>
              </View>
              <Text style={styles.resultMacros}>
                {item.portion_g}g · P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
              </Text>
              {item.confidence < 0.7 && (
                <View style={styles.statusRow}>
                  <WarningIcon size={13} color="#D97706" />
                  <Text style={styles.lowConfidence}>Low confidence — please verify</Text>
                </View>
              )}
              {item.matched_food_id && (
                <View style={styles.statusRow}>
                  <CheckCircleIcon size={13} color="#007A3D" />
                  <Text style={styles.dbMatch}>Matched to Ghanaian food database</Text>
                </View>
              )}
            </View>
          ))}

          <Text style={styles.mealTypeLabel}>Meal type</Text>
          <View style={styles.mealTypeRow}>
            {MEAL_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.mealTypeChip, mealType === t && styles.mealTypeChipActive]}
                onPress={() => setMealType(t)}
              >
                <Text style={[styles.mealTypeText, mealType === t && styles.mealTypeTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setPhase('camera')}>
            <Text style={styles.retryText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
            <Text style={styles.logBtnText}>Log Meal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.hint}>Point at your meal</Text>
        </View>
      </CameraView>

      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.galleryBtn} onPress={handlePickFromGallery}>
          <GalleryIcon size={18} color="#fff" />
          <Text style={styles.galleryBtnText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
        <View style={styles.galleryBtnPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { fontSize: 16, textAlign: 'center', color: '#374151', marginBottom: 20 },
  btn: { backgroundColor: '#007A3D', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 16,
  },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 14, fontWeight: '500' },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    backgroundColor: '#111',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#007A3D',
  },
  galleryBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  galleryBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  galleryBtnPlaceholder: { width: 80 },
  scanningContainer: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  scanningCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    width: '100%',
  },
  scanningText: { fontSize: 17, fontWeight: '700', color: '#111827' },
  scanningSubtext: { fontSize: 14, color: '#6B7280' },
  reviewContent: { padding: 16, paddingBottom: 100 },
  reviewTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  reviewTotal: { fontSize: 34, fontWeight: '800', color: '#007A3D', marginBottom: 20, letterSpacing: -0.5 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resultName: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  resultCal: { fontSize: 15, fontWeight: '700', color: '#007A3D' },
  resultMacros: { fontSize: 13, color: '#6B7280' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  lowConfidence: { fontSize: 12, color: '#D97706', fontWeight: '500' },
  dbMatch: { fontSize: 12, color: '#007A3D', fontWeight: '500' },
  mealTypeLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  mealTypeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  mealTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  mealTypeChipActive: { backgroundColor: '#007A3D' },
  mealTypeText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  mealTypeTextActive: { color: '#fff' },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  retryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#007A3D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retryText: { color: '#007A3D', fontWeight: '700', fontSize: 15 },
  logBtn: {
    flex: 2,
    backgroundColor: '#007A3D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
