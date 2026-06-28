import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MealLog } from '../types';
import { XIcon } from './icons';

interface Props {
  meal: MealLog;
  onDelete?: () => void;
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: '#F59E0B',
  lunch: '#10B981',
  dinner: '#6366F1',
  snack: '#EC4899',
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealCard({ meal, onDelete }: Props) {
  const time = new Date(meal.logged_at).toLocaleTimeString('en-GH', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const accentColor = MEAL_COLORS[meal.meal_type] ?? '#007A3D';

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.mealType}>{MEAL_LABELS[meal.meal_type] ?? meal.meal_type}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.calories}>{meal.total_calories}</Text>
            <Text style={styles.kcal}>kcal</Text>
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={10}>
                <XIcon size={14} color="#C4C9D4" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {meal.items.length > 0 && (
          <View style={styles.items}>
            {meal.items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemCal}>{item.calories} kcal</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.macros}>
          <MacroBadge label="P" value={Math.round(meal.total_protein_g)} color="#007A3D" />
          <MacroBadge label="C" value={Math.round(meal.total_carbs_g)} color="#F59E0B" />
          <MacroBadge label="F" value={Math.round(meal.total_fat_g)} color="#EF4444" />
        </View>
      </View>
    </View>
  );
}

function MacroBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[badgeStyles.badge, { backgroundColor: color + '15' }]}>
      <Text style={[badgeStyles.text, { color }]}>
        {label} {value}g
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: { fontSize: 11, fontWeight: '700' },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: { flex: 1 },
  mealType: { fontSize: 14, fontWeight: '700', color: '#111827' },
  time: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  calories: { fontSize: 20, fontWeight: '800', color: '#111827' },
  kcal: { fontSize: 12, color: '#9CA3AF', marginRight: 6 },
  deleteBtn: { paddingLeft: 2, paddingTop: 2 },
  items: { marginBottom: 8, gap: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 13, color: '#6B7280', flex: 1, marginRight: 8 },
  itemCal: { fontSize: 13, color: '#9CA3AF' },
  macros: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
