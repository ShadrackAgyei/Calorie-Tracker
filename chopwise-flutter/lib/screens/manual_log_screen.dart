import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_colors.dart';
import '../data/ghanaian_foods.dart';
import '../models/food_item.dart';
import '../models/meal_log.dart';
import '../store/meal_store.dart';

class ManualLogScreen extends StatefulWidget {
  const ManualLogScreen({super.key});

  @override
  State<ManualLogScreen> createState() => _ManualLogScreenState();
}

class _ManualLogScreenState extends State<ManualLogScreen> {
  final _queryController = TextEditingController();
  final _portionController = TextEditingController();
  FoodItem? _selected;
  final List<LoggedItem> _loggedItems = [];
  MealType _mealType = MealType.lunch;

  @override
  void dispose() {
    _queryController.dispose();
    _portionController.dispose();
    super.dispose();
  }

  List<FoodItem> get _results => searchFoods(_queryController.text, limit: 15);

  void _selectFood(FoodItem food) {
    setState(() {
      _selected = food;
      _portionController.text = food.typicalServingG.toStringAsFixed(0);
      _queryController.clear();
    });
  }

  void _addItem() {
    if (_selected == null) return;
    final portion = double.tryParse(_portionController.text) ?? _selected!.typicalServingG;
    final n = _selected!.calcNutrition(portion);
    setState(() {
      _loggedItems.add(LoggedItem(
        foodId: _selected!.id,
        name: _selected!.name,
        portionG: portion,
        calories: n.calories,
        proteinG: n.proteinG,
        carbsG: n.carbsG,
        fatG: n.fatG,
      ));
      _selected = null;
      _portionController.clear();
    });
  }

  Future<void> _handleLog() async {
    if (_loggedItems.isEmpty) return;
    final store = context.read<MealStore>();
    await store.addMeal(
      loggedAt: DateTime.now().toIso8601String(),
      mealType: _mealType,
      items: _loggedItems,
    );
    if (mounted) Navigator.of(context).pop();
  }

  int get _totalCal => _loggedItems.fold(0, (s, i) => s + i.calories);

  NutritionResult? get _preview {
    if (_selected == null || _portionController.text.isEmpty) return null;
    final p = double.tryParse(_portionController.text) ?? 0;
    return _selected!.calcNutrition(p);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.green,
        foregroundColor: Colors.white,
        title: const Text('Search Food', style: TextStyle(fontWeight: FontWeight.w700)),
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionLabel('Search Ghanaian Foods'),
                  TextField(
                    controller: _queryController,
                    autofocus: true,
                    onChanged: (_) => setState(() {}),
                    style: const TextStyle(fontSize: 15, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'e.g. banku, jollof, kelewele...',
                      hintStyle: const TextStyle(color: Color(0xFFB0B7C3)),
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.green, width: 1.5),
                      ),
                    ),
                  ),

                  if (_queryController.text.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: _results.isEmpty
                          ? const Padding(
                              padding: EdgeInsets.all(14),
                              child: Text(
                                'No results — try a different name',
                                style: TextStyle(fontSize: 13, color: AppColors.textMuted),
                              ),
                            )
                          : Column(
                              children: _results.asMap().entries.map((e) {
                                final food = e.value;
                                final isLast = e.key == _results.length - 1;
                                final servingCal = (food.caloriesPer100g * food.typicalServingG / 100).round();
                                return GestureDetector(
                                  onTap: () => _selectFood(food),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
                                    decoration: BoxDecoration(
                                      border: isLast ? null : const Border(
                                        bottom: BorderSide(color: Color(0xFFF3F4F6)),
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(food.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                              if (food.nameLocal != null)
                                                Text(food.nameLocal!, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                            ],
                                          ),
                                        ),
                                        Text(
                                          '$servingCal kcal',
                                          style: const TextStyle(fontSize: 13, color: AppColors.green, fontWeight: FontWeight.w600),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                    ),
                  ],

                  if (_selected != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.green, width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.green.withOpacity(0.06),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selected!.name,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Typical serving: ${_selected!.typicalServingG.toStringAsFixed(0)}g',
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _portionController,
                                  keyboardType: TextInputType.number,
                                  onChanged: (_) => setState(() {}),
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                  decoration: InputDecoration(
                                    hintText: 'grams',
                                    hintStyle: const TextStyle(color: Color(0xFFB0B7C3)),
                                    filled: true,
                                    fillColor: const Color(0xFFF9FAFB),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                      borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                      borderSide: const BorderSide(color: AppColors.border, width: 1.5),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10),
                                      borderSide: const BorderSide(color: AppColors.green, width: 1.5),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text('g', style: TextStyle(fontSize: 16, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
                            ],
                          ),
                          if (_preview != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              '${_preview!.calories} kcal · P ${_preview!.proteinG}g · C ${_preview!.carbsG}g · F ${_preview!.fatG}g',
                              style: const TextStyle(fontSize: 13, color: AppColors.green, fontWeight: FontWeight.w600),
                            ),
                          ],
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _addItem,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.green,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                elevation: 0,
                              ),
                              child: const Text('Add to Meal', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  if (_loggedItems.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    _sectionLabel('Meal Summary'),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6, offset: const Offset(0, 1)),
                        ],
                      ),
                      child: Column(
                        children: [
                          ..._loggedItems.asMap().entries.map((e) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(e.value.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                      Text('${e.value.portionG.toStringAsFixed(0)}g · ${e.value.calories} kcal', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                    ],
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => setState(() => _loggedItems.removeAt(e.key)),
                                  child: const Icon(Icons.close, size: 16, color: Color(0xFFC4C9D4)),
                                ),
                              ],
                            ),
                          )),
                          const Divider(height: 1, color: Color(0xFFF3F4F6)),
                          const SizedBox(height: 10),
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'Total: $_totalCal kcal',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.green),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    _sectionLabel('Meal Type'),
                    Wrap(
                      spacing: 8,
                      children: MealType.values.map((t) {
                        final isActive = _mealType == t;
                        return GestureDetector(
                          onTap: () => setState(() => _mealType = t),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: isActive ? AppColors.green : const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              t.label,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: isActive ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],

                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),

          if (_loggedItems.isNotEmpty)
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFF0F0F0))),
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _handleLog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: Text(
                    'Log ${_loggedItems.length} item${_loggedItems.length > 1 ? 's' : ''} · $_totalCal kcal',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, top: 8),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: Color(0xFF374151),
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
