import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_colors.dart';
import '../store/meal_store.dart';
import '../widgets/calorie_ring.dart';

String _todayStr() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
}

List<String> _getLast7Days() {
  final now = DateTime.now();
  return List.generate(7, (i) {
    final d = now.subtract(Duration(days: 6 - i));
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  });
}

String _shortDay(String dateStr) {
  final d = DateTime.parse('${dateStr}T12:00:00');
  const abbrevs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return abbrevs[d.weekday - 1];
}

({int proteinG, int carbsG, int fatG}) _macroGoals(int calGoal) {
  return (
    proteinG: ((calGoal * 0.25) / 4).round(),
    carbsG: ((calGoal * 0.50) / 4).round(),
    fatG: ((calGoal * 0.25) / 9).round(),
  );
}

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<MealStore>();
    final today = _todayStr();
    final dailyGoal = store.profile.dailyCalorieGoal;
    final days = _getLast7Days();

    final weekData = days.map((date) {
      final t = store.getDailyTotals(date);
      return (
        date: date,
        cal: t.calories,
        protein: t.proteinG.round(),
        carbs: t.carbsG.round(),
        fat: t.fatG.round(),
        logged: t.calories > 0,
      );
    }).toList();

    final todayData = weekData.last;
    final goals = _macroGoals(dailyGoal);

    final daysLogged = weekData.where((d) => d.logged).length;
    final totalCal = weekData.fold(0, (s, d) => s + d.cal);
    final avgCal = daysLogged > 0 ? (totalCal / daysLogged).round() : 0;

    int streak = 0;
    for (int i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].logged) streak++;
      else break;
    }

    final maxCal = ([...weekData.map((d) => d.cal), dailyGoal]).reduce((a, b) => a > b ? a : b);
    final totalMacros = todayData.protein + todayData.carbs + todayData.fat;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Analytics',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: -0.5),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  _StatCard(
                    label: 'Day Streak',
                    value: '$streak',
                    sub: 'days logged',
                    color: const Color(0xFFF97316),
                    icon: const Icon(Icons.local_fire_department, size: 16, color: Color(0xFFF97316)),
                  ),
                  const SizedBox(width: 10),
                  _StatCard(
                    label: 'Avg / Day',
                    value: avgCal.toString(),
                    sub: 'kcal this week',
                    color: AppColors.green,
                    icon: const Icon(Icons.bar_chart, size: 16, color: AppColors.green),
                  ),
                  const SizedBox(width: 10),
                  _StatCard(
                    label: 'Days Logged',
                    value: '$daysLogged/7',
                    sub: 'this week',
                    color: const Color(0xFF6366F1),
                    icon: const Icon(Icons.check_box_outlined, size: 16, color: Color(0xFF6366F1)),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              _Card(
                title: 'Today',
                child: Row(
                  children: [
                    CalorieRing(consumed: todayData.cal, goal: dailyGoal, size: 160),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _RingDetail(label: 'Eaten', value: todayData.cal, unit: 'kcal', color: AppColors.green),
                          _RingDetail(label: 'Remaining', value: (dailyGoal - todayData.cal).clamp(0, 9999), unit: 'kcal', color: AppColors.textSecondary),
                          _RingDetail(label: 'Goal', value: dailyGoal, unit: 'kcal', color: AppColors.textMuted),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('7-Day Calories', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        Text('Goal: $dailyGoal kcal', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 130,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: weekData.map((d) {
                          final isToday = d.date == today;
                          final barH = maxCal > 0 ? (d.cal > 0 ? (d.cal / maxCal).clamp(0.04, 1.0) : 0.0) : 0.0;
                          final overGoal = d.cal > dailyGoal;
                          Color barColor;
                          if (overGoal) barColor = AppColors.red;
                          else if (isToday) barColor = AppColors.green;
                          else barColor = const Color(0xFF86EFAC);

                          return Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (d.cal > 0)
                                  Text('${d.cal}', style: const TextStyle(fontSize: 9, color: AppColors.textMuted))
                                else
                                  const SizedBox(height: 13),
                                const SizedBox(height: 2),
                                Expanded(
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 2),
                                    child: Stack(
                                      alignment: Alignment.bottomCenter,
                                      children: [
                                        Container(
                                          width: double.infinity,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF9FAFB),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                        ),
                                        FractionallySizedBox(
                                          heightFactor: barH,
                                          child: Container(
                                            width: double.infinity,
                                            decoration: BoxDecoration(
                                              color: barColor,
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _shortDay(d.date),
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isToday ? AppColors.green : AppColors.textMuted,
                                    fontWeight: isToday ? FontWeight.w800 : FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              _Card(
                title: "Today's Macros",
                child: Column(
                  children: [
                    _MacroDetail(label: 'Protein', value: todayData.protein, goal: goals.proteinG, color: AppColors.green, totalMacros: totalMacros),
                    _MacroDetail(label: 'Carbohydrates', value: todayData.carbs, goal: goals.carbsG, color: AppColors.yellow, totalMacros: totalMacros),
                    _MacroDetail(label: 'Fat', value: todayData.fat, goal: goals.fatG, color: AppColors.red, totalMacros: totalMacros),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              _Card(
                title: 'Weekly Averages',
                child: Row(
                  children: [
                    _AvgBox(label: 'Protein', value: daysLogged > 0 ? (weekData.fold(0, (s, d) => s + d.protein) / daysLogged).round() : 0, unit: 'g', color: AppColors.green),
                    _AvgBox(label: 'Carbs', value: daysLogged > 0 ? (weekData.fold(0, (s, d) => s + d.carbs) / daysLogged).round() : 0, unit: 'g', color: AppColors.yellow),
                    _AvgBox(label: 'Fat', value: daysLogged > 0 ? (weekData.fold(0, (s, d) => s + d.fat) / daysLogged).round() : 0, unit: 'g', color: AppColors.red),
                    _AvgBox(label: 'Calories', value: avgCal, unit: 'kcal', color: const Color(0xFF6366F1)),
                  ],
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final String title;
  final Widget child;

  const _Card({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String sub;
  final Color color;
  final Widget icon;

  const _StatCard({required this.label, required this.value, required this.sub, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border(top: BorderSide(color: color, width: 3)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))],
        ),
        child: Column(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
              child: Center(child: icon),
            ),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF374151))),
            const SizedBox(height: 2),
            Text(sub, style: const TextStyle(fontSize: 10, color: AppColors.textMuted), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _RingDetail extends StatelessWidget {
  final String label;
  final int value;
  final String unit;
  final Color color;

  const _RingDetail({required this.label, required this.value, required this.unit, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('$value', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
              const SizedBox(width: 4),
              Text(unit, style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
            ],
          ),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _MacroDetail extends StatelessWidget {
  final String label;
  final int value;
  final int goal;
  final Color color;
  final int totalMacros;

  const _MacroDetail({required this.label, required this.value, required this.goal, required this.color, required this.totalMacros});

  @override
  Widget build(BuildContext context) {
    final progress = goal > 0 ? (value / goal).clamp(0.0, 1.0) : 0.0;
    final pct = totalMacros > 0 ? (value / totalMacros * 100).round() : 0;
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
              Row(
                children: [
                  Text('$pct%', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color)),
                  const SizedBox(width: 8),
                  Text.rich(TextSpan(children: [
                    TextSpan(text: '${value}g', style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)),
                    TextSpan(text: ' / ${goal}g', style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
                  ])),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: const Color(0xFFF3F4F6),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 7,
            ),
          ),
        ],
      ),
    );
  }
}

class _AvgBox extends StatelessWidget {
  final String label;
  final int value;
  final String unit;
  final Color color;

  const _AvgBox({required this.label, required this.value, required this.unit, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text('$value', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
          Text(unit, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
