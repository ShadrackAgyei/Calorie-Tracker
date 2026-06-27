import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealStore } from '../../src/store/useMealStore';
import { MealCard } from '../../src/components/MealCard';
import { PwaInstallBanner } from '../../src/components/PwaInstallBanner';
import { BellIcon, CameraIcon, SearchIcon, FlameIcon, UtensilsIcon } from '../../src/components/icons';

const MEAL_SECTIONS = [
  { key: 'breakfast' as const, label: 'Breakfast', color: '#F59E0B' },
  { key: 'lunch' as const, label: 'Lunch', color: '#10B981' },
  { key: 'dinner' as const, label: 'Dinner', color: '#6366F1' },
  { key: 'snack' as const, label: 'Snack', color: '#EC4899' },
];

type DayItem = { dateStr: string; dayAbbrev: string; dayNum: number };

function buildWeek(): DayItem[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayAbbrev: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
    };
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const mealsAll = useMealStore((s) => s.meals);
  const deleteMeal = useMealStore((s) => s.deleteMeal);
  const profile = useMealStore((s) => s.profile);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const week = useMemo(() => buildWeek(), []);
  const dailyGoal = profile?.daily_calorie_goal ?? 2200;

  const dayMeals = useMemo(
    () => mealsAll.filter((m) => m.logged_at.startsWith(selectedDate)),
    [mealsAll, selectedDate]
  );

  const { consumed, protein, carbs, fat } = useMemo(
    () =>
      dayMeals.reduce(
        (acc, m) => ({
          consumed: acc.consumed + m.total_calories,
          protein: acc.protein + m.total_protein_g,
          carbs: acc.carbs + m.total_carbs_g,
          fat: acc.fat + m.total_fat_g,
        }),
        { consumed: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [dayMeals]
  );

  const remaining = dailyGoal - consumed;
  const progress = Math.min(consumed / dailyGoal, 1);
  const progressColor =
    progress > 1 ? '#EF4444' : progress > 0.85 ? '#F59E0B' : '#007A3D';

  const isToday = selectedDate === today;
  const name = profile?.name;
  const avatarLetter = name ? name[0].toUpperCase() : '?';

  const mealsByType = useMemo(() => {
    const map: Record<string, typeof dayMeals> = {};
    for (const { key } of MEAL_SECTIONS) {
      map[key] = dayMeals.filter((m) => m.meal_type === key);
    }
    return map;
  }, [dayMeals]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.headerBg, { paddingTop: top + 16 }]}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingLeft}>
            <Text style={styles.helloText}>
              {name ? `Hello, ${name}` : 'Hello'}
            </Text>
            <Text style={styles.subtitle}>
              {isToday ? 'Track your nutrition today' : 'Viewing past day'}
            </Text>
          </View>
          <View style={styles.greetingRight}>
            <TouchableOpacity style={styles.bellBtn}>
              <BellIcon size={20} color="#fff" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>
          </View>
        </View>

        <PwaInstallBanner />

        {/* Card */}
        <View style={styles.card}>
          {/* Day picker */}
          <View style={styles.dayRow}>
            {week.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              return (
                <TouchableOpacity
                  key={day.dateStr}
                  onPress={() => setSelectedDate(day.dateStr)}
                  style={[styles.dayPill, isSelected && styles.dayPillActive]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.dayAbbrev, isSelected && styles.dayAbbrevActive]}>
                    {day.dayAbbrev}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>
                    {day.dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Calories row */}
          <View style={styles.calRow}>
            <View style={styles.calLabel}>
              <FlameIcon size={18} color="#6B7280" />
              <Text style={styles.calLabelText}>Calories left</Text>
            </View>
            <Text style={[styles.calNum, remaining < 0 && { color: '#EF4444' }]}>
              {Math.abs(remaining).toLocaleString()}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: progressColor },
              ]}
            />
          </View>

          {/* Macro pills */}
          <View style={styles.macroRow}>
            <MacroPill label="Protein" value={Math.round(protein)} color="#007A3D" />
            <MacroPill label="Carbs" value={Math.round(carbs)} color="#F59E0B" />
            <MacroPill label="Fat" value={Math.round(fat)} color="#EF4444" />
          </View>
        </View>
      </View>

      {/* Quick actions */}
      {isToday && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            onPress={() => router.push('/scan')}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconBox}>
              <CameraIcon size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.primaryBtnText}>Scan Meal</Text>
              <Text style={styles.primaryBtnSub}>AI photo detection</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={() => router.push('/manual-log')}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconBoxSecondary}>
              <SearchIcon size={20} color="#007A3D" />
            </View>
            <View>
              <Text style={styles.secondaryBtnText}>Search Food</Text>
              <Text style={styles.secondaryBtnSub}>Find and log food</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Meals */}
      <View style={styles.mealArea}>
        {dayMeals.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <UtensilsIcon size={28} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>
              {isToday ? 'No meals logged yet' : 'Nothing logged this day'}
            </Text>
            <Text style={styles.emptySub}>
              {isToday
                ? 'Scan your food or search to get started'
                : 'Select today to start logging'}
            </Text>
          </View>
        ) : (
          MEAL_SECTIONS.map(({ key, label, color }) => {
            const meals = mealsByType[key];
            if (meals.length === 0) return null;
            const typeTotal = meals.reduce((s, m) => s + m.total_calories, 0);
            return (
              <View key={key} style={styles.mealSection}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionDot, { backgroundColor: color }]} />
                  <Text style={styles.sectionTitle}>{label}</Text>
                  <Text style={styles.sectionCal}>{typeTotal} kcal</Text>
                </View>
                {meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onDelete={() => deleteMeal(meal.id)} />
                ))}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[pillStyles.pill, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <Text style={[pillStyles.value, { color }]}>{value}g</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  value: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 11, color: '#6B7280', marginTop: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  content: { paddingBottom: 36 },

  headerBg: {
    backgroundColor: '#007A3D',
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingLeft: {},
  helloText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 3,
  },
  greetingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F97316',
    borderWidth: 1.5,
    borderColor: '#007A3D',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 4,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    gap: 4,
    minHeight: 64,
    justifyContent: 'center',
  },
  dayPillActive: {
    backgroundColor: '#007A3D',
  },
  dayAbbrev: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.2,
  },
  dayAbbrevActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  dayNumActive: {
    color: '#fff',
  },

  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calLabelText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  calNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  macroRow: {
    flexDirection: 'row',
    gap: 8,
  },

  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
    marginBottom: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  primaryBtn: { backgroundColor: '#007A3D' },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBoxSecondary: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  primaryBtnSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 1 },
  secondaryBtnText: { color: '#111827', fontWeight: '700', fontSize: 14 },
  secondaryBtnSub: { color: '#9CA3AF', fontSize: 11, marginTop: 1 },

  mealArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  mealSection: { marginBottom: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    letterSpacing: 0.1,
  },
  sectionCal: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
