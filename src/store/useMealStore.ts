import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { MealLog, LoggedItem, DailyTotals, UserProfile } from '../types';

const OFFLINE_MEALS_KEY = 'foodiegh_offline_meals';
const OFFLINE_PROFILE_KEY = 'chopwise_offline_profile';

async function loadOfflineState() {
  const [mealsRaw, profileRaw] = await Promise.all([
    AsyncStorage.getItem(OFFLINE_MEALS_KEY),
    AsyncStorage.getItem(OFFLINE_PROFILE_KEY),
  ]);

  return {
    meals: mealsRaw ? (JSON.parse(mealsRaw) as MealLog[]) : [],
    profile: profileRaw ? (JSON.parse(profileRaw) as UserProfile) : null,
  };
}

interface MealStore {
  meals: MealLog[];
  profile: UserProfile | null;
  isLoading: boolean;
  userId: string | null;
  isAnonymous: boolean;

  init: () => Promise<void>;
  addMeal: (meal: Omit<MealLog, 'id' | 'user_id'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  setProfile: (profile: Partial<UserProfile>) => Promise<void>;
  getDailyTotals: (date: string) => DailyTotals;
  getMealsForDate: (date: string) => MealLog[];
}

function sumItems(items: LoggedItem[]) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein_g: acc.protein_g + item.protein_g,
      carbs_g: acc.carbs_g + item.carbs_g,
      fat_g: acc.fat_g + item.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

function rowToMealLog(row: Record<string, unknown>): MealLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    logged_at: row.logged_at as string,
    meal_type: row.meal_type as MealLog['meal_type'],
    items: row.items as LoggedItem[],
    photo_url: row.photo_url as string | undefined,
    total_calories: Number(row.total_calories),
    total_protein_g: Number(row.total_protein_g),
    total_carbs_g: Number(row.total_carbs_g),
    total_fat_g: Number(row.total_fat_g),
  };
}

export const useMealStore = create<MealStore>((set, get) => ({
  meals: [],
  profile: null,
  isLoading: true,
  userId: null,
  isAnonymous: true,

  init: async () => {
    set({ isLoading: true });

    try {
      let {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        session = data.session;
      }

      const userId = session?.user?.id ?? null;
      const isAnonymous = session?.user?.is_anonymous ?? true;
      if (!userId) throw new Error('No session available');

      const since = new Date();
      since.setDate(since.getDate() - 90);

      const [mealsRes, profileRes] = await Promise.all([
        supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', since.toISOString().split('T')[0])
          .order('logged_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      ]);

      if (mealsRes.error) throw mealsRes.error;

      const meals: MealLog[] = (mealsRes.data ?? []).map(rowToMealLog);
      const profileRow = profileRes.data;
      const profile: UserProfile | null = profileRow
        ? {
            id: profileRow.id,
            name: profileRow.name ?? undefined,
            email: profileRow.email ?? undefined,
            avatar_url: profileRow.avatar_url ?? undefined,
            weight_kg: profileRow.weight_kg ?? undefined,
            height_cm: profileRow.height_cm ?? undefined,
            age: profileRow.age ?? undefined,
            daily_calorie_goal: profileRow.daily_calorie_goal ?? 2200,
            created_at: profileRow.created_at,
          }
        : null;

      set({ meals, profile, userId, isAnonymous, isLoading: false });
    } catch {
      const offline = await loadOfflineState();
      set({
        ...offline,
        userId: null,
        isAnonymous: true,
        isLoading: false,
      });
    }
  },

  addMeal: async (meal) => {
    const { userId } = get();
    const sums = sumItems(meal.items);

    const newMeal: MealLog = {
      id: crypto.randomUUID(),
      user_id: userId ?? 'local',
      ...meal,
      total_calories: sums.calories,
      total_protein_g: sums.protein_g,
      total_carbs_g: sums.carbs_g,
      total_fat_g: sums.fat_g,
    };

    const updatedMeals = [newMeal, ...get().meals];
    set({ meals: updatedMeals });

    if (userId) {
      const { error } = await supabase.from('meal_logs').insert({
        id: newMeal.id,
        user_id: userId,
        logged_at: newMeal.logged_at,
        meal_type: newMeal.meal_type,
        items: newMeal.items,
        photo_url: newMeal.photo_url ?? null,
        total_calories: newMeal.total_calories,
        total_protein_g: newMeal.total_protein_g,
        total_carbs_g: newMeal.total_carbs_g,
        total_fat_g: newMeal.total_fat_g,
      });
      if (!error) return;
    }

    await AsyncStorage.setItem(OFFLINE_MEALS_KEY, JSON.stringify(updatedMeals));
  },

  deleteMeal: async (id) => {
    const { userId } = get();
    set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }));

    if (userId) {
      const { error } = await supabase.from('meal_logs').delete().eq('id', id).eq('user_id', userId);
      if (!error) return;
    }

    await AsyncStorage.setItem(OFFLINE_MEALS_KEY, JSON.stringify(get().meals));
  },

  setProfile: async (partial) => {
    const { userId, profile } = get();
    const updated: UserProfile = {
      id: userId ?? 'local',
      daily_calorie_goal: 2200,
      created_at: new Date().toISOString(),
      ...profile,
      ...partial,
    };
    set({ profile: updated });

    if (userId) {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        name: updated.name ?? null,
        email: updated.email ?? null,
        avatar_url: updated.avatar_url ?? null,
        weight_kg: updated.weight_kg ?? null,
        height_cm: updated.height_cm ?? null,
        age: updated.age ?? null,
        daily_calorie_goal: updated.daily_calorie_goal,
        updated_at: new Date().toISOString(),
      });
      if (!error) return;
    }

    await AsyncStorage.setItem(OFFLINE_PROFILE_KEY, JSON.stringify(updated));
  },

  getMealsForDate: (date) => {
    return get().meals.filter((m) => m.logged_at.startsWith(date));
  },

  getDailyTotals: (date) => {
    const meals = get().getMealsForDate(date);
    const totals = meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.total_calories,
        protein_g: acc.protein_g + m.total_protein_g,
        carbs_g: acc.carbs_g + m.total_carbs_g,
        fat_g: acc.fat_g + m.total_fat_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
    return {
      ...totals,
      goal_calories: get().profile?.daily_calorie_goal ?? 2200,
    };
  },
}));
