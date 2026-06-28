import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMealStore } from '../../src/store/useMealStore';
import { CalorieRing } from '../../src/components/CalorieRing';

function macroGoals(calGoal: number) {
  return {
    protein_g: Math.round((calGoal * 0.25) / 4),
    carbs_g: Math.round((calGoal * 0.50) / 4),
    fat_g: Math.round((calGoal * 0.25) / 9),
  };
}

export default function TodayScreen() {
  const today = new Date().toISOString().split('T')[0];
  const meals = useMealStore((s) => s.meals);
  const dailyGoal = useMealStore((s) => s.profile?.daily_calorie_goal ?? 2200);

  const totals = useMemo(() => {
    const dayMeals = meals.filter((m) => m.logged_at.startsWith(today));
    return dayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.total_calories,
        protein_g: acc.protein_g + meal.total_protein_g,
        carbs_g: acc.carbs_g + meal.total_carbs_g,
        fat_g: acc.fat_g + meal.total_fat_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
  }, [meals, today]);

  const goals = macroGoals(dailyGoal);

  const dayLabel = new Date().toLocaleDateString('en-GH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.date}>{dayLabel}</Text>

      {/* Calorie Ring */}
      <View style={styles.ringSection}>
        <CalorieRing consumed={totals.calories} goal={dailyGoal} size={190} />
        <Text style={styles.goalNote}>Daily goal: {dailyGoal} kcal</Text>
      </View>

      {/* Macro Cards */}
      <View style={styles.macroRow}>
        <MacroCard
          label="Protein"
          value={Math.round(totals.protein_g)}
          goal={goals.protein_g}
          color="#007A3D"
          bgColor="#E8F5EE"
        />
        <MacroCard
          label="Carbs"
          value={Math.round(totals.carbs_g)}
          goal={goals.carbs_g}
          color="#F59E0B"
          bgColor="#FEF9EE"
        />
        <MacroCard
          label="Fat"
          value={Math.round(totals.fat_g)}
          goal={goals.fat_g}
          color="#EF4444"
          bgColor="#FEF2F2"
        />
      </View>

      {/* Detailed Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nutrient Breakdown</Text>
        <DetailRow
          label="Protein"
          value={totals.protein_g}
          goal={goals.protein_g}
          color="#007A3D"
          unit="g"
        />
        <DetailRow
          label="Carbohydrates"
          value={totals.carbs_g}
          goal={goals.carbs_g}
          color="#F59E0B"
          unit="g"
        />
        <DetailRow
          label="Fat"
          value={totals.fat_g}
          goal={goals.fat_g}
          color="#EF4444"
          unit="g"
        />
      </View>

      {/* Calorie Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calorie Summary</Text>
        <View style={styles.summaryRow}>
          <SummaryItem label="Eaten" value={totals.calories} unit="kcal" color="#007A3D" />
          <View style={styles.divider} />
          <SummaryItem
            label={dailyGoal - totals.calories >= 0 ? 'Remaining' : 'Over'}
            value={Math.abs(dailyGoal - totals.calories)}
            unit="kcal"
            color={dailyGoal - totals.calories >= 0 ? '#111827' : '#EF4444'}
          />
          <View style={styles.divider} />
          <SummaryItem label="Goal" value={dailyGoal} unit="kcal" color="#9CA3AF" />
        </View>
      </View>
    </ScrollView>
  );
}

function MacroCard({
  label,
  value,
  goal,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  bgColor: string;
}) {
  const progress = Math.min(value / goal, 1);
  return (
    <View style={[macroCardStyles.container, { backgroundColor: bgColor }]}>
      <Text style={[macroCardStyles.value, { color }]}>{value}g</Text>
      <Text style={macroCardStyles.label}>{label}</Text>
      <View style={macroCardStyles.track}>
        <View
          style={[
            macroCardStyles.fill,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={macroCardStyles.goal}>/ {goal}g</Text>
    </View>
  );
}

const macroCardStyles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 8,
  },
  track: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  goal: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

function DetailRow({
  label,
  value,
  goal,
  color,
  unit,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
}) {
  const progress = Math.min(value / goal, 1);
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.header}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.values}>
          <Text style={{ color, fontWeight: '700' }}>{Math.round(value)}{unit}</Text>
          <Text style={detailStyles.goal}> / {goal}{unit}</Text>
        </Text>
      </View>
      <View style={detailStyles.track}>
        <View
          style={[detailStyles.fill, { width: `${progress * 100}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { marginBottom: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  values: { fontSize: 13 },
  goal: { color: '#9CA3AF', fontWeight: '400' },
  track: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});

function SummaryItem({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={summaryStyles.item}>
      <Text style={[summaryStyles.value, { color }]}>{value}</Text>
      <Text style={summaryStyles.unit}>{unit}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center' },
  value: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  label: { fontSize: 12, color: '#6B7280', marginTop: 3, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16, paddingBottom: 40 },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  goalNote: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 10,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
  },
});
