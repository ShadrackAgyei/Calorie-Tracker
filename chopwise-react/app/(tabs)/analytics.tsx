import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealStore } from '../../src/store/useMealStore';
import { CalorieRing } from '../../src/components/CalorieRing';
import { FlameIcon, BarChartIcon, CheckSquareIcon } from '../../src/components/icons';

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

function shortDay(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

function macroGoals(calGoal: number) {
  return {
    protein_g: Math.round((calGoal * 0.25) / 4),
    carbs_g: Math.round((calGoal * 0.50) / 4),
    fat_g: Math.round((calGoal * 0.25) / 9),
  };
}

export default function AnalyticsScreen() {
  const { top } = useSafeAreaInsets();
  const today = new Date().toISOString().split('T')[0];
  const meals = useMealStore((s) => s.meals);
  const dailyGoal = useMealStore((s) => s.profile?.daily_calorie_goal ?? 2200);
  const days = useMemo(() => getLast7Days(), []);

  const weekData = useMemo(() =>
    days.map((date) => {
      const dayMeals = meals.filter((m) => m.logged_at.startsWith(date));
      const cal = dayMeals.reduce((s, m) => s + m.total_calories, 0);
      const protein = dayMeals.reduce((s, m) => s + m.total_protein_g, 0);
      const carbs = dayMeals.reduce((s, m) => s + m.total_carbs_g, 0);
      const fat = dayMeals.reduce((s, m) => s + m.total_fat_g, 0);
      return { date, cal, protein, carbs, fat, logged: dayMeals.length > 0 };
    }), [meals, days]);

  const todayData = weekData[weekData.length - 1];
  const goals = macroGoals(dailyGoal);

  const daysLogged = weekData.filter((d) => d.logged).length;
  const totalCal = weekData.reduce((s, d) => s + d.cal, 0);
  const avgCal = daysLogged > 0 ? Math.round(totalCal / daysLogged) : 0;

  const streak = useMemo(() => {
    let count = 0;
    for (let i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].logged) count++;
      else break;
    }
    return count;
  }, [weekData]);

  const maxCal = Math.max(...weekData.map((d) => d.cal), dailyGoal);
  const totalMacros = todayData.protein + todayData.carbs + todayData.fat;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: top + 16 }]}>
      <Text style={styles.pageTitle}>Analytics</Text>

      <View style={styles.statsRow}>
        <StatCard
          label="Day Streak"
          value={`${streak}`}
          sub="days logged"
          color="#F97316"
          icon={<FlameIcon size={16} color="#F97316" />}
        />
        <StatCard
          label="Avg / Day"
          value={`${avgCal.toLocaleString()}`}
          sub="kcal this week"
          color="#007A3D"
          icon={<BarChartIcon size={16} color="#007A3D" />}
        />
        <StatCard
          label="Days Logged"
          value={`${daysLogged}/7`}
          sub="this week"
          color="#6366F1"
          icon={<CheckSquareIcon size={16} color="#6366F1" />}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <View style={styles.ringRow}>
          <CalorieRing consumed={todayData.cal} goal={dailyGoal} size={160} />
          <View style={styles.ringRight}>
            <RingDetail label="Eaten" value={todayData.cal} unit="kcal" color="#007A3D" />
            <RingDetail
              label="Remaining"
              value={Math.max(0, dailyGoal - todayData.cal)}
              unit="kcal"
              color="#6B7280"
            />
            <RingDetail label="Goal" value={dailyGoal} unit="kcal" color="#9CA3AF" />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>7-Day Calories</Text>
          <Text style={styles.cardSub}>Goal: {dailyGoal.toLocaleString()} kcal</Text>
        </View>
        <View style={styles.barChart}>
          {weekData.map(({ date, cal }) => {
            const isToday = date === today;
            const barH = maxCal > 0 ? Math.max((cal / maxCal) * 100, cal > 0 ? 4 : 0) : 0;
            const overGoal = cal > dailyGoal;
            return (
              <View key={date} style={styles.barCol}>
                <Text style={styles.barCalLabel}>{cal > 0 ? cal : ''}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.goalMarker,
                      { bottom: (dailyGoal / maxCal) * 100 },
                    ]}
                  />
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${barH}%`,
                        backgroundColor: overGoal
                          ? '#EF4444'
                          : isToday
                          ? '#007A3D'
                          : '#86EFAC',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barDayLabel, isToday && styles.barDayToday]}>
                  {shortDay(date)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Macros</Text>
        <MacroDetail
          label="Protein"
          value={Math.round(todayData.protein)}
          goal={goals.protein_g}
          color="#007A3D"
          totalMacros={totalMacros}
        />
        <MacroDetail
          label="Carbohydrates"
          value={Math.round(todayData.carbs)}
          goal={goals.carbs_g}
          color="#F59E0B"
          totalMacros={totalMacros}
        />
        <MacroDetail
          label="Fat"
          value={Math.round(todayData.fat)}
          goal={goals.fat_g}
          color="#EF4444"
          totalMacros={totalMacros}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Averages</Text>
        <View style={styles.avgRow}>
          <AvgBox
            label="Protein"
            value={daysLogged > 0 ? Math.round(weekData.reduce((s, d) => s + d.protein, 0) / daysLogged) : 0}
            unit="g"
            color="#007A3D"
          />
          <AvgBox
            label="Carbs"
            value={daysLogged > 0 ? Math.round(weekData.reduce((s, d) => s + d.carbs, 0) / daysLogged) : 0}
            unit="g"
            color="#F59E0B"
          />
          <AvgBox
            label="Fat"
            value={daysLogged > 0 ? Math.round(weekData.reduce((s, d) => s + d.fat, 0) / daysLogged) : 0}
            unit="g"
            color="#EF4444"
          />
          <AvgBox
            label="Calories"
            value={avgCal}
            unit="kcal"
            color="#6366F1"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode;
}) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <View style={[statStyles.iconBox, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.sub}>{sub}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '700', color: '#374151' },
  sub: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
});

function RingDetail({
  label, value, unit, color,
}: {
  label: string; value: number; unit: string; color: string;
}) {
  return (
    <View style={ringDetailStyles.row}>
      <Text style={[ringDetailStyles.value, { color }]}>{value.toLocaleString()}</Text>
      <Text style={ringDetailStyles.unit}> {unit}</Text>
      <Text style={ringDetailStyles.label}>{label}</Text>
    </View>
  );
}
const ringDetailStyles = StyleSheet.create({
  row: { marginBottom: 12 },
  value: { fontSize: 20, fontWeight: '800' },
  unit: { fontSize: 13, color: '#9CA3AF' },
  label: { fontSize: 12, color: '#6B7280', marginTop: 1 },
});

function MacroDetail({
  label, value, goal, color, totalMacros,
}: {
  label: string; value: number; goal: number; color: string; totalMacros: number;
}) {
  const progress = Math.min(value / goal, 1);
  const pct = totalMacros > 0 ? Math.round((value / totalMacros) * 100) : 0;
  return (
    <View style={macroStyles.row}>
      <View style={macroStyles.header}>
        <Text style={macroStyles.label}>{label}</Text>
        <View style={macroStyles.right}>
          <Text style={[macroStyles.pct, { color }]}>{pct}%</Text>
          <Text style={macroStyles.values}>
            <Text style={{ color, fontWeight: '700' }}>{value}g</Text>
            <Text style={macroStyles.goal}> / {goal}g</Text>
          </Text>
        </View>
      </View>
      <View style={macroStyles.track}>
        <View style={[macroStyles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}
const macroStyles = StyleSheet.create({
  row: { marginBottom: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pct: { fontSize: 13, fontWeight: '700' },
  values: { fontSize: 13 },
  goal: { color: '#9CA3AF' },
  track: { height: 7, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

function AvgBox({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <View style={avgStyles.box}>
      <Text style={[avgStyles.value, { color }]}>{value}</Text>
      <Text style={avgStyles.unit}>{unit}</Text>
      <Text style={avgStyles.label}>{label}</Text>
    </View>
  );
}
const avgStyles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '800' },
  unit: { fontSize: 11, color: '#9CA3AF' },
  label: { fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 16 },
  cardSub: { fontSize: 12, color: '#9CA3AF' },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ringRight: { flex: 1 },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    gap: 6,
  },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barCalLabel: { fontSize: 9, color: '#9CA3AF', marginBottom: 2 },
  barTrack: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  goalMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: '#D1FAE5',
  },
  barFill: { width: '100%', borderRadius: 6, minHeight: 2 },
  barDayLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 4, fontWeight: '600' },
  barDayToday: { color: '#007A3D', fontWeight: '800' },
  avgRow: { flexDirection: 'row' },
});
