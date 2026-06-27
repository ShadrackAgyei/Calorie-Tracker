export interface FoodItem {
  id: string;
  name: string;
  name_local?: string; // Twi or Ga name
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  typical_serving_g: number;
  category: string;
  source: 'wafct' | 'recipe' | 'ai' | 'user';
}

export interface ScannedItem {
  name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: number;
  matched_food_id?: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  logged_at: string; // ISO date string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: LoggedItem[];
  photo_url?: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
}

export interface LoggedItem {
  food_id?: string;
  name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  daily_calorie_goal: number;
  created_at: string;
}

export interface DailyTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  goal_calories: number;
}
