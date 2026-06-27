import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { searchFoods, calcNutrition } from '../src/data/ghanaian_foods';
import { FoodItem, LoggedItem } from '../src/types';
import { useMealStore } from '../src/store/useMealStore';
import { XIcon } from '../src/components/icons';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function ManualLogScreen() {
  const router = useRouter();
  const addMeal = useMealStore((s) => s.addMeal);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<{ food: FoodItem; portion_g: number } | null>(null);
  const [loggedItems, setLoggedItems] = useState<LoggedItem[]>([]);
  const [mealType, setMealType] = useState<typeof MEAL_TYPES[number]>('lunch');
  const [portionInput, setPortionInput] = useState('');

  const results = searchFoods(query, 15);

  const selectFood = (food: FoodItem) => {
    setSelected({ food, portion_g: food.typical_serving_g });
    setPortionInput(food.typical_serving_g.toString());
    setQuery('');
  };

  const addItem = () => {
    if (!selected) return;
    const portion = parseFloat(portionInput) || selected.food.typical_serving_g;
    const nutrition = calcNutrition(selected.food, portion);
    setLoggedItems((prev) => [
      ...prev,
      {
        food_id: selected.food.id,
        name: selected.food.name,
        portion_g: portion,
        ...nutrition,
      },
    ]);
    setSelected(null);
    setPortionInput('');
  };

  const removeItem = (i: number) => {
    setLoggedItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleLog = async () => {
    if (loggedItems.length === 0) return;
    await addMeal({
      logged_at: new Date().toISOString(),
      meal_type: mealType,
      items: loggedItems,
      total_calories: loggedItems.reduce((s, i) => s + i.calories, 0),
      total_protein_g: loggedItems.reduce((s, i) => s + i.protein_g, 0),
      total_carbs_g: loggedItems.reduce((s, i) => s + i.carbs_g, 0),
      total_fat_g: loggedItems.reduce((s, i) => s + i.fat_g, 0),
    });
    router.back();
  };

  const totalCal = loggedItems.reduce((s, i) => s + i.calories, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Search Ghanaian Foods</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. banku, jollof, kelewele..."
          placeholderTextColor="#B0B7C3"
          autoFocus
        />

        {query.length > 0 && (
          <View style={styles.resultsBox}>
            {results.length === 0 ? (
              <Text style={styles.noResults}>No results — try a different name</Text>
            ) : (
              results.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.resultRow}
                  onPress={() => selectFood(food)}
                >
                  <View style={styles.resultLeft}>
                    <Text style={styles.resultName}>{food.name}</Text>
                    {food.name_local && (
                      <Text style={styles.resultLocal}>{food.name_local}</Text>
                    )}
                  </View>
                  <Text style={styles.resultCal}>
                    {Math.round(food.calories_per_100g * food.typical_serving_g / 100)} kcal
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {selected && (
          <View style={styles.portionCard}>
            <Text style={styles.portionTitle}>{selected.food.name}</Text>
            <Text style={styles.portionHint}>
              Typical serving: {selected.food.typical_serving_g}g
            </Text>
            <View style={styles.portionRow}>
              <TextInput
                style={styles.portionInput}
                value={portionInput}
                onChangeText={setPortionInput}
                keyboardType="numeric"
                placeholder="grams"
                placeholderTextColor="#B0B7C3"
              />
              <Text style={styles.portionUnit}>g</Text>
            </View>
            {portionInput ? (
              (() => {
                const n = calcNutrition(selected.food, parseFloat(portionInput) || 0);
                return (
                  <Text style={styles.portionPreview}>
                    {n.calories} kcal · P {n.protein_g}g · C {n.carbs_g}g · F {n.fat_g}g
                  </Text>
                );
              })()
            ) : null}
            <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
              <Text style={styles.addItemBtnText}>Add to Meal</Text>
            </TouchableOpacity>
          </View>
        )}

        {loggedItems.length > 0 && (
          <View style={styles.mealPreview}>
            <Text style={styles.sectionTitle}>Meal Summary</Text>
            {loggedItems.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetail}>{item.portion_g}g · {item.calories} kcal</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(i)} style={styles.removeBtn} hitSlop={10}>
                  <XIcon size={16} color="#C4C9D4" />
                </TouchableOpacity>
              </View>
            ))}
            <Text style={styles.totalLine}>Total: {totalCal} kcal</Text>
          </View>
        )}

        {loggedItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeRow}>
              {MEAL_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, mealType === t && styles.chipActive]}
                  onPress={() => setMealType(t)}
                >
                  <Text style={[styles.chipText, mealType === t && styles.chipTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {loggedItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logBtn} onPress={handleLog}>
            <Text style={styles.logBtnText}>
              Log {loggedItems.length} item{loggedItems.length > 1 ? 's' : ''} · {totalCal} kcal
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 16, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  resultsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultLeft: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  resultLocal: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  resultCal: { fontSize: 13, color: '#007A3D', fontWeight: '600' },
  noResults: { padding: 14, color: '#9CA3AF', fontSize: 13 },
  portionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#007A3D',
    shadowColor: '#007A3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  portionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  portionHint: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  portionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  portionInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  portionUnit: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  portionPreview: { fontSize: 13, color: '#007A3D', fontWeight: '600', marginBottom: 12 },
  addItemBtn: {
    backgroundColor: '#007A3D',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addItemBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  mealPreview: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  itemDetail: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  removeBtn: { paddingLeft: 8 },
  totalLine: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007A3D',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  mealTypeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: { backgroundColor: '#007A3D' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#fff' },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logBtn: {
    backgroundColor: '#007A3D',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
