import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { ScannedItem } from '../types';
import { findFoodByName, calcNutrition } from '../data/ghanaian_foods';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

async function imageToBase64(imageUri: string) {
  if (Platform.OS !== 'web') {
    return {
      base64: await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      }),
      mimeType: 'image/jpeg',
    };
  }

  const blob = await fetch(imageUri).then((response) => response.blob());
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return {
    base64: window.btoa(binary),
    mimeType: blob.type || 'image/jpeg',
  };
}

export async function scanMealPhoto(imageUri: string): Promise<ScannedItem[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Meal scanning is not configured.');
  }

  const { base64, mimeType } = await imageToBase64(imageUri);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35_000);

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/scan-meal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Scan timed out. Check your internet connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let message = `Meal scan failed: ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error && typeof payload.error === 'string') {
        message = payload.error;
      }
    } catch {
      // Keep the HTTP status message if the response is not JSON.
    }
    throw new Error(message);
  }

  const json = await response.json();
  const items: ScannedItem[] = Array.isArray(json) ? json : [];

  return items.map((item) => {
    const match = findFoodByName(item.name);
    if (match) {
      const nutrition = calcNutrition(match, item.portion_g);
      return {
        ...item,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fat_g: nutrition.fat_g,
        matched_food_id: match.id,
      };
    }
    return item;
  });
}
