import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_colors.dart';
import '../models/meal_log.dart';
import '../store/meal_store.dart';
import '../widgets/meal_card.dart';

class _DayItem {
  final String dateStr;
  final String dayAbbrev;
  final int dayNum;
  _DayItem(this.dateStr, this.dayAbbrev, this.dayNum);
}

List<_DayItem> _buildWeek() {
  final now = DateTime.now();
  return List.generate(7, (i) {
    final d = now.subtract(Duration(days: 3 - i));
    final dateStr = '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    const abbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return _DayItem(dateStr, abbrevs[d.weekday % 7], d.day);
  });
}

String _todayStr() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
}

const _mealSections = [
  (key: MealType.breakfast, label: 'Breakfast', color: AppColors.breakfast),
  (key: MealType.lunch, label: 'Lunch', color: AppColors.lunch),
  (key: MealType.dinner, label: 'Dinner', color: AppColors.dinner),
  (key: MealType.snack, label: 'Snack', color: AppColors.snack),
];

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _week = _buildWeek();
  late String _selectedDate = _todayStr();

  @override
  Widget build(BuildContext context) {
    final store = context.watch<MealStore>();
    final today = _todayStr();
    final isToday = _selectedDate == today;
    final dailyGoal = store.profile.dailyCalorieGoal;
    final name = store.profile.name;
    final dayMeals = store.getMealsForDate(_selectedDate);

    int consumed = 0, protein = 0, carbs = 0, fat = 0;
    for (final m in dayMeals) {
      consumed += m.totalCalories;
      protein += m.totalProteinG.round();
      carbs += m.totalCarbsG.round();
      fat += m.totalFatG.round();
    }

    final remaining = dailyGoal - consumed;
    final progress = dailyGoal > 0 ? (consumed / dailyGoal).clamp(0.0, 1.0) : 0.0;
    Color progressColor;
    if (consumed > dailyGoal) {
      progressColor = AppColors.red;
    } else if (progress > 0.85) {
      progressColor = AppColors.yellow;
    } else {
      progressColor = AppColors.green;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              color: AppColors.green,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 16,
                left: 20,
                right: 20,
                bottom: 28,
              ),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name.isNotEmpty ? 'Hello, $name' : 'Hello',
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              isToday ? 'Track your nutrition today' : 'Viewing past day',
                              style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.72)),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          Stack(
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
                              ),
                              Positioned(
                                top: 7,
                                right: 7,
                                child: Container(
                                  width: 7,
                                  height: 7,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF97316),
                                    borderRadius: BorderRadius.circular(3.5),
                                    border: Border.all(color: AppColors.green, width: 1.5),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 10),
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
                            ),
                            child: Center(
                              child: Text(
                                name.isNotEmpty ? name[0].toUpperCase() : '?',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: _week.map((day) {
                            final isSelected = day.dateStr == _selectedDate;
                            return Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedDate = day.dateStr),
                                child: Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 2),
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: isSelected ? AppColors.green : const Color(0xFFF3F4F6),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                        day.dayAbbrev,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: isSelected ? Colors.white.withOpacity(0.8) : AppColors.textMuted,
                                          letterSpacing: 0.2,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${day.dayNum}',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: isSelected ? Colors.white : AppColors.textPrimary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.local_fire_department_outlined, size: 18, color: AppColors.textSecondary),
                                const SizedBox(width: 6),
                                const Text('Calories left', style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
                              ],
                            ),
                            Text(
                              '${remaining.abs()}',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                                color: remaining < 0 ? AppColors.red : AppColors.textPrimary,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: progress,
                            backgroundColor: const Color(0xFFF3F4F6),
                            valueColor: AlwaysStoppedAnimation<Color>(progressColor),
                            minHeight: 8,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            _MacroPill(label: 'Protein', value: protein, color: AppColors.green),
                            const SizedBox(width: 8),
                            _MacroPill(label: 'Carbs', value: carbs, color: AppColors.yellow),
                            const SizedBox(width: 8),
                            _MacroPill(label: 'Fat', value: fat, color: AppColors.red),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (isToday)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
                child: Row(
                  children: [
                    Expanded(
                      child: _ActionButton(
                        icon: Icons.camera_alt_outlined,
                        title: 'Scan Meal',
                        subtitle: 'AI photo detection',
                        isPrimary: true,
                        onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('AI scan coming soon!')),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _ActionButton(
                        icon: Icons.search,
                        title: 'Search Food',
                        subtitle: 'Find and log food',
                        isPrimary: false,
                        onTap: () => Navigator.of(context).pushNamed('/manual-log'),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
              child: dayMeals.isEmpty
                  ? _EmptyState(isToday: isToday)
                  : Column(
                      children: _mealSections.map((section) {
                        final meals = dayMeals.where((m) => m.mealType == section.key).toList();
                        if (meals.isEmpty) return const SizedBox.shrink();
                        final typeTotal = meals.fold(0, (s, m) => s + m.totalCalories);
                        return Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      color: section.color,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      section.label,
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                    ),
                                  ),
                                  Text(
                                    '$typeTotal kcal',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                            ...meals.map((meal) => MealCard(
                              meal: meal,
                              onDelete: () => context.read<MealStore>().deleteMeal(meal.id),
                            )),
                            const SizedBox(height: 6),
                          ],
                        );
                      }).toList(),
                    ),
            ),
          ),

          SliverToBoxAdapter(child: SizedBox(height: MediaQuery.of(context).padding.bottom + 16)),
        ],
      ),
    );
  }
}

class _MacroPill extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _MacroPill({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text('${value}g', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: color)),
            const SizedBox(height: 1),
            Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isPrimary;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isPrimary,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isPrimary ? AppColors.green : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: isPrimary ? null : Border.all(color: AppColors.border, width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: isPrimary ? Colors.white.withOpacity(0.2) : AppColors.greenLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 20, color: isPrimary ? Colors.white : AppColors.green),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: isPrimary ? Colors.white : AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 1),
                Text(subtitle, style: TextStyle(color: isPrimary ? Colors.white.withOpacity(0.65) : AppColors.textMuted, fontSize: 11)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final bool isToday;
  const _EmptyState({required this.isToday});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 32),
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(36),
            ),
            child: const Icon(Icons.restaurant_outlined, size: 28, color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),
          Text(
            isToday ? 'No meals logged yet' : 'Nothing logged this day',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF374151)),
          ),
          const SizedBox(height: 6),
          Text(
            isToday ? 'Scan your food or search to get started' : 'Select today to start logging',
            style: const TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
