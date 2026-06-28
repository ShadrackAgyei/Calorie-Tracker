class UserProfile {
  final String name;
  final double? weightKg;
  final double? heightCm;
  final int? age;
  final int dailyCalorieGoal;

  const UserProfile({
    required this.name,
    this.weightKg,
    this.heightCm,
    this.age,
    required this.dailyCalorieGoal,
  });

  UserProfile copyWith({
    String? name,
    double? weightKg,
    double? heightCm,
    int? age,
    int? dailyCalorieGoal,
    bool clearWeight = false,
    bool clearHeight = false,
    bool clearAge = false,
  }) {
    return UserProfile(
      name: name ?? this.name,
      weightKg: clearWeight ? null : (weightKg ?? this.weightKg),
      heightCm: clearHeight ? null : (heightCm ?? this.heightCm),
      age: clearAge ? null : (age ?? this.age),
      dailyCalorieGoal: dailyCalorieGoal ?? this.dailyCalorieGoal,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'weightKg': weightKg,
    'heightCm': heightCm,
    'age': age,
    'dailyCalorieGoal': dailyCalorieGoal,
  };

  factory UserProfile.fromJson(Map<String, dynamic> j) => UserProfile(
    name: j['name'] as String? ?? '',
    weightKg: (j['weightKg'] as num?)?.toDouble(),
    heightCm: (j['heightCm'] as num?)?.toDouble(),
    age: j['age'] as int?,
    dailyCalorieGoal: (j['dailyCalorieGoal'] as num?)?.toInt() ?? 2200,
  );

  double? get bmi {
    if (weightKg == null || heightCm == null || heightCm == 0) return null;
    return weightKg! / ((heightCm! / 100) * (heightCm! / 100));
  }
}
