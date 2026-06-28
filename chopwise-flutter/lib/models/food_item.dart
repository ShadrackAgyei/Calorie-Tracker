class FoodItem {
  final String id;
  final String name;
  final String? nameLocal;
  final double caloriesPer100g;
  final double proteinPer100g;
  final double carbsPer100g;
  final double fatPer100g;
  final double? fiberPer100g;
  final double typicalServingG;
  final String category;

  const FoodItem({
    required this.id,
    required this.name,
    this.nameLocal,
    required this.caloriesPer100g,
    required this.proteinPer100g,
    required this.carbsPer100g,
    required this.fatPer100g,
    this.fiberPer100g,
    required this.typicalServingG,
    required this.category,
  });

  NutritionResult calcNutrition(double portionG) {
    final factor = portionG / 100;
    return NutritionResult(
      calories: (caloriesPer100g * factor).round(),
      proteinG: (proteinPer100g * factor * 10).round() / 10,
      carbsG: (carbsPer100g * factor * 10).round() / 10,
      fatG: (fatPer100g * factor * 10).round() / 10,
    );
  }
}

class NutritionResult {
  final int calories;
  final double proteinG;
  final double carbsG;
  final double fatG;

  const NutritionResult({
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
  });
}
