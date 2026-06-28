import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_colors.dart';
import '../store/meal_store.dart';
import '../widgets/meal_card.dart';

String _dateStr(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

({String short, String full}) _formatLabel(String dateStr) {
  final d = DateTime.parse('${dateStr}T12:00:00');
  final today = _dateStr(DateTime.now());
  final yesterday = _dateStr(DateTime.now().subtract(const Duration(days: 1)));
  if (dateStr == today) return (short: 'Today', full: 'Today');
  if (dateStr == yesterday) return (short: 'Yesterday', full: 'Yesterday');
  const abbrevs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const full = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return (
    short: abbrevs[d.weekday - 1],
    full: '${full[d.weekday - 1]}, ${months[d.month - 1]} ${d.day}',
  );
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  late final List<String> _dates = List.generate(14, (i) {
    return _dateStr(DateTime.now().subtract(Duration(days: i)));
  });

  late String _selected = _dates[0];

  @override
  Widget build(BuildContext context) {
    final store = context.watch<MealStore>();
    final dailyGoal = store.profile.dailyCalorieGoal;
    final meals = store.getMealsForDate(_selected);
    final totals = store.getDailyTotals(_selected);
    final selectedLabel = _formatLabel(_selected);

    final weekCalories = _dates.take(7).map((d) {
      final t = store.getDailyTotals(d);
      return (date: d, cal: t.calories, label: _formatLabel(d).short);
    }).toList();

    final maxCal = ([...weekCalories.map((w) => w.cal), dailyGoal]).reduce((a, b) => a > b ? a : b);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Text(
                'History',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: -0.5),
              ),
            ),

            Container(
              height: 76,
              color: Colors.white,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                itemCount: _dates.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final d = _dates[i];
                  final isSelected = d == _selected;
                  final cal = store.getDailyTotals(d).calories;
                  final label = _formatLabel(d);
                  return GestureDetector(
                    onTap: () => setState(() => _selected = d),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.green : const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            label.short,
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : const Color(0xFF374151)),
                          ),
                          const SizedBox(height: 1),
                          Text(
                            cal > 0 ? '$cal' : '—',
                            style: TextStyle(fontSize: 11, color: isSelected ? Colors.white.withOpacity(0.8) : AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('This Week', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 96,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: weekCalories.map((w) {
                                final isActive = w.date == _selected;
                                final isToday = w.date == _dates[0];
                                final barH = maxCal > 0 && w.cal > 0 ? (w.cal / maxCal) * 64.0 : 0.0;
                                Color barColor;
                                if (isActive) barColor = AppColors.green;
                                else if (isToday) barColor = const Color(0xFF34D399);
                                else barColor = const Color(0xFFD1FAE5);
                                return Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() => _selected = w.date),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        Text(w.cal > 0 ? '${w.cal}' : '', style: const TextStyle(fontSize: 9, color: AppColors.textMuted)),
                                        const SizedBox(height: 2),
                                        Container(
                                          width: double.infinity,
                                          height: 64,
                                          alignment: Alignment.bottomCenter,
                                          margin: const EdgeInsets.symmetric(horizontal: 2),
                                          decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(4)),
                                          child: AnimatedContainer(
                                            duration: const Duration(milliseconds: 300),
                                            width: double.infinity,
                                            height: barH,
                                            decoration: BoxDecoration(color: barColor, borderRadius: BorderRadius.circular(4)),
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          w.label,
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: isActive ? AppColors.green : AppColors.textMuted,
                                            fontWeight: isActive ? FontWeight.w700 : FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD1FAE5),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: AppColors.green, width: 2),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text('Goal: $dailyGoal kcal', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            ],
                          ),
                        ],
                      ),
                    ),

                    if (totals.calories > 0) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(selectedLabel.full, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                _TotalStat(label: 'Calories', value: totals.calories, unit: 'kcal', color: AppColors.green),
                                _TotalStat(label: 'Protein', value: totals.proteinG.round(), unit: 'g', color: AppColors.green),
                                _TotalStat(label: 'Carbs', value: totals.carbsG.round(), unit: 'g', color: AppColors.yellow),
                                _TotalStat(label: 'Fat', value: totals.fatG.round(), unit: 'g', color: AppColors.red),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],

                    if (meals.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 56),
                        child: Column(
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(32)),
                              child: const Icon(Icons.inbox_outlined, size: 26, color: AppColors.textMuted),
                            ),
                            const SizedBox(height: 14),
                            Text(
                              'No meals logged for ${selectedLabel.full.toLowerCase()}',
                              style: const TextStyle(fontSize: 14, color: AppColors.textMuted),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    else
                      ...meals.map((meal) => MealCard(
                        meal: meal,
                        onDelete: () => context.read<MealStore>().deleteMeal(meal.id),
                      )),

                    SizedBox(height: MediaQuery.of(context).padding.bottom + 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TotalStat extends StatelessWidget {
  final String label;
  final int value;
  final String unit;
  final Color color;

  const _TotalStat({required this.label, required this.value, required this.unit, required this.color});

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
