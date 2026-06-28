enum MealType { breakfast, lunch, dinner, snack }

extension MealTypeExt on MealType {
  String get label {
    switch (this) {
      case MealType.breakfast: return 'Breakfast';
      case MealType.lunch: return 'Lunch';
      case MealType.dinner: return 'Dinner';
      case MealType.snack: return 'Snack';
    }
  }

  String get value {
    return name;
  }

  static MealType fromString(String s) {
    return MealType.values.firstWhere(
      (e) => e.name == s,
      orElse: () => MealType.lunch,
    );
  }
}

class LoggedItem {
  final String? foodId;
  final String name;
  final double portionG;
  final int calories;
  final double proteinG;
  final double carbsG;
  final double fatG;

  const LoggedItem({
    this.foodId,
    required this.name,
    required this.portionG,
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
  });

  Map<String, dynamic> toJson() => {
    'foodId': foodId,
    'name': name,
    'portionG': portionG,
    'calories': calories,
    'proteinG': proteinG,
    'carbsG': carbsG,
    'fatG': fatG,
  };

  factory LoggedItem.fromJson(Map<String, dynamic> j) => LoggedItem(
    foodId: j['foodId'] as String?,
    name: j['name'] as String,
    portionG: (j['portionG'] as num).toDouble(),
    calories: (j['calories'] as num).toInt(),
    proteinG: (j['proteinG'] as num).toDouble(),
    carbsG: (j['carbsG'] as num).toDouble(),
    fatG: (j['fatG'] as num).toDouble(),
  );
}

class MealLog {
  final String id;
  final String loggedAt;
  final MealType mealType;
  final List<LoggedItem> items;
  final int totalCalories;
  final double totalProteinG;
  final double totalCarbsG;
  final double totalFatG;

  const MealLog({
    required this.id,
    required this.loggedAt,
    required this.mealType,
    required this.items,
    required this.totalCalories,
    required this.totalProteinG,
    required this.totalCarbsG,
    required this.totalFatG,
  });

  factory MealLog.create({
    required String id,
    required String loggedAt,
    required MealType mealType,
    required List<LoggedItem> items,
  }) {
    return MealLog(
      id: id,
      loggedAt: loggedAt,
      mealType: mealType,
      items: items,
      totalCalories: items.fold(0, (s, i) => s + i.calories),
      totalProteinG: items.fold(0.0, (s, i) => s + i.proteinG),
      totalCarbsG: items.fold(0.0, (s, i) => s + i.carbsG),
      totalFatG: items.fold(0.0, (s, i) => s + i.fatG),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'loggedAt': loggedAt,
    'mealType': mealType.name,
    'items': items.map((i) => i.toJson()).toList(),
    'totalCalories': totalCalories,
    'totalProteinG': totalProteinG,
    'totalCarbsG': totalCarbsG,
    'totalFatG': totalFatG,
  };

  factory MealLog.fromJson(Map<String, dynamic> j) => MealLog(
    id: j['id'] as String,
    loggedAt: j['loggedAt'] as String,
    mealType: MealTypeExt.fromString(j['mealType'] as String),
    items: (j['items'] as List).map((i) => LoggedItem.fromJson(i as Map<String, dynamic>)).toList(),
    totalCalories: (j['totalCalories'] as num).toInt(),
    totalProteinG: (j['totalProteinG'] as num).toDouble(),
    totalCarbsG: (j['totalCarbsG'] as num).toDouble(),
    totalFatG: (j['totalFatG'] as num).toDouble(),
  );

  String get dateStr => loggedAt.split('T')[0];
}
