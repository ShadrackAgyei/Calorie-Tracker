import 'package:flutter/material.dart';
import '../app_colors.dart';
import '../models/meal_log.dart';

const _mealColors = {
  MealType.breakfast: AppColors.breakfast,
  MealType.lunch: AppColors.lunch,
  MealType.dinner: AppColors.dinner,
  MealType.snack: AppColors.snack,
};

class MealCard extends StatelessWidget {
  final MealLog meal;
  final VoidCallback? onDelete;

  const MealCard({super.key, required this.meal, this.onDelete});

  @override
  Widget build(BuildContext context) {
    final accentColor = _mealColors[meal.mealType] ?? AppColors.green;
    final time = TimeOfDay.fromDateTime(DateTime.parse(meal.loggedAt));
    final timeStr = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 6,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            width: 4,
            decoration: BoxDecoration(
              color: accentColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(14),
                bottomLeft: Radius.circular(14),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              meal.mealType.label,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 1),
                            Text(
                              timeStr,
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '${meal.totalCalories}',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 2),
                          const Text(
                            'kcal',
                            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                          if (onDelete != null) ...[
                            const SizedBox(width: 6),
                            GestureDetector(
                              onTap: onDelete,
                              child: const Icon(
                                Icons.close,
                                size: 16,
                                color: Color(0xFFC4C9D4),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                  if (meal.items.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    ...meal.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.name,
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '${item.calories} kcal',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    )),
                  ],
                  const SizedBox(height: 8),
                  const Divider(height: 1, color: Color(0xFFF3F4F6)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _MacroBadge(label: 'P', value: meal.totalProteinG.round(), color: AppColors.green),
                      const SizedBox(width: 6),
                      _MacroBadge(label: 'C', value: meal.totalCarbsG.round(), color: AppColors.yellow),
                      const SizedBox(width: 6),
                      _MacroBadge(label: 'F', value: meal.totalFatG.round(), color: AppColors.red),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MacroBadge extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _MacroBadge({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '$label ${value}g',
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}
