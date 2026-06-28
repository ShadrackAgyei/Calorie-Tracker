import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealStore } from '../../src/store/useMealStore';
import { MealCard } from '../../src/components/MealCard';
import { InboxIcon } from '../../src/components/icons';

function getDates(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
}

function formatLabel(dateStr: string): { short: string; full: string } {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];

  if (dateStr === today) return { short: 'Today', full: 'Today' };
  if (dateStr === yStr) return { short: 'Yesterday', full: 'Yesterday' };
  return {
    short: d.toLocaleDateString('en-GH', { weekday: 'short' }),
    full: d.toLocaleDateString('en-GH', { weekday: 'long', month: 'short', day: 'numeric' }),
  };
}

export default function HistoryScreen() {
  const { top } = useSafeAreaInsets();
  const dates = getDates(14);
  const [selected, setSelected] = useState(dates[0]);
  const getMealsForDate = useMealStore((s) => s.getMealsForDate);
  const getDailyTotals = useMealStore((s) => s.getDailyTotals);
  const deleteMeal = useMealStore((s) => s.deleteMeal);
  const dailyGoal = useMealStore((s) => s.profile?.daily_calorie_goal ?? 2200);

  const meals = getMealsForDate(selected);
  const totals = getDailyTotals(selected);
  const selectedLabel = formatLabel(selected);

  const weekCalories = useMemo(() => {
    return dates.slice(0, 7).map((d) => ({
      date: d,
      cal: getDailyTotals(d).calories,
      label: formatLabel(d).short,
    }));
  }, [dates]);

  const maxCal = Math.max(...weekCalories.map((w) => w.cal), dailyGoal);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Text style={styles.pageTitle}>History</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.datePicker}
        contentContainerStyle={styles.datePickerContent}
      >
        {dates.map((d) => {
          const dayMeals = getMealsForDate(d);
          const isSelected = d === selected;
          const label = formatLabel(d);
          return (
            <TouchableOpacity
              key={d}
              onPress={() => setSelected(d)}
              style={[styles.dateChip, isSelected && styles.dateChipActive]}
            >
              <Text style={[styles.dateChipLabel, isSelected && styles.dateChipLabelActive]}>
                {label.short}
              </Text>
              {dayMeals.length > 0 ? (
                <Text style={[styles.dateChipCal, isSelected && styles.dateChipCalActive]}>
                  {getDailyTotals(d).calories}
                </Text>
              ) : (
                <Text style={[styles.dateChipCal, isSelected && styles.dateChipCalActive]}>—</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.barChart}>
            {weekCalories.map(({ date, cal, label }) => {
              const height = maxCal > 0 ? (cal / maxCal) * 64 : 0;
              const isToday = date === dates[0];
              const isActive = date === selected;
              return (
                <TouchableOpacity
                  key={date}
                  style={styles.barCol}
                  onPress={() => setSelected(date)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.barCal}>{cal > 0 ? cal : ''}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height,
                          backgroundColor: isActive
                            ? '#007A3D'
                            : isToday
                            ? '#34D399'
                            : '#D1FAE5',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isActive && { color: '#007A3D', fontWeight: '700' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.goalLine}>
            <View style={styles.goalDot} />
            <Text style={styles.goalLineText}>Goal: {dailyGoal} kcal</Text>
          </View>
        </View>

        {totals.calories > 0 && (
          <View style={styles.totalBanner}>
            <Text style={styles.totalDate}>{selectedLabel.full}</Text>
            <View style={styles.totalStats}>
              <TotalStat label="Calories" value={totals.calories} unit="kcal" color="#007A3D" />
              <TotalStat label="Protein" value={Math.round(totals.protein_g)} unit="g" color="#007A3D" />
              <TotalStat label="Carbs" value={Math.round(totals.carbs_g)} unit="g" color="#F59E0B" />
              <TotalStat label="Fat" value={Math.round(totals.fat_g)} unit="g" color="#EF4444" />
            </View>
          </View>
        )}

        {meals.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <InboxIcon size={26} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>
              No meals logged for {selectedLabel.full.toLowerCase()}
            </Text>
          </View>
        ) : (
          meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={() => deleteMeal(meal.id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TotalStat({
  label, value, unit, color,
}: {
  label: string; value: number; unit: string; color: string;
}) {
  return (
    <View style={totalStatStyles.item}>
      <Text style={[totalStatStyles.value, { color }]}>{value}</Text>
      <Text style={totalStatStyles.unit}>{unit}</Text>
      <Text style={totalStatStyles.label}>{label}</Text>
    </View>
  );
}

const totalStatStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '800' },
  unit: { fontSize: 11, color: '#9CA3AF' },
  label: { fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    letterSpacing: -0.5,
  },
  datePicker: {
    maxHeight: 76,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  datePickerContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    minWidth: 64,
  },
  dateChipActive: { backgroundColor: '#007A3D' },
  dateChipLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  dateChipLabelActive: { color: '#fff' },
  dateChipCal: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  dateChipCalActive: { color: 'rgba(255,255,255,0.8)' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 96,
    marginBottom: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barCal: { fontSize: 9, color: '#9CA3AF', marginBottom: 2 },
  barTrack: {
    width: '100%',
    height: 64,
    justifyContent: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  barFill: { width: '100%', borderRadius: 4, minHeight: 2 },
  barLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 4, fontWeight: '600' },
  goalLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#007A3D',
  },
  goalLineText: { fontSize: 12, color: '#6B7280' },
  totalBanner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  totalDate: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  totalStats: { flexDirection: 'row' },
  empty: { alignItems: 'center', paddingVertical: 56 },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
});
