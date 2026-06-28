import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/meal_log.dart';
import '../models/user_profile.dart';

const _mealsKey = 'chopwise_meals';
const _profileKey = 'chopwise_profile';

class MealStore extends ChangeNotifier {
  List<MealLog> _meals = [];
  UserProfile _profile = const UserProfile(name: '', dailyCalorieGoal: 2200);
  bool isLoading = true;

  List<MealLog> get meals => _meals;
  UserProfile get profile => _profile;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();

    final mealsRaw = prefs.getString(_mealsKey);
    if (mealsRaw != null) {
      final list = jsonDecode(mealsRaw) as List;
      _meals = list.map((m) => MealLog.fromJson(m as Map<String, dynamic>)).toList();
    }

    final profileRaw = prefs.getString(_profileKey);
    if (profileRaw != null) {
      _profile = UserProfile.fromJson(jsonDecode(profileRaw) as Map<String, dynamic>);
    }

    isLoading = false;
    notifyListeners();
  }

  Future<void> _saveMeals() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_mealsKey, jsonEncode(_meals.map((m) => m.toJson()).toList()));
  }

  Future<void> _saveProfile() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_profileKey, jsonEncode(_profile.toJson()));
  }

  Future<void> addMeal({
    required String loggedAt,
    required MealType mealType,
    required List<LoggedItem> items,
  }) async {
    final meal = MealLog.create(
      id: const Uuid().v4(),
      loggedAt: loggedAt,
      mealType: mealType,
      items: items,
    );
    _meals = [meal, ..._meals];
    notifyListeners();
    await _saveMeals();
  }

  Future<void> deleteMeal(String id) async {
    _meals = _meals.where((m) => m.id != id).toList();
    notifyListeners();
    await _saveMeals();
  }

  Future<void> setProfile(UserProfile profile) async {
    _profile = profile;
    notifyListeners();
    await _saveProfile();
  }

  List<MealLog> getMealsForDate(String dateStr) {
    return _meals.where((m) => m.loggedAt.startsWith(dateStr)).toList();
  }

  DailyTotals getDailyTotals(String dateStr) {
    final dayMeals = getMealsForDate(dateStr);
    return DailyTotals(
      calories: dayMeals.fold(0, (s, m) => s + m.totalCalories),
      proteinG: dayMeals.fold(0.0, (s, m) => s + m.totalProteinG),
      carbsG: dayMeals.fold(0.0, (s, m) => s + m.totalCarbsG),
      fatG: dayMeals.fold(0.0, (s, m) => s + m.totalFatG),
      goalCalories: _profile.dailyCalorieGoal,
    );
  }
}

class DailyTotals {
  final int calories;
  final double proteinG;
  final double carbsG;
  final double fatG;
  final int goalCalories;

  const DailyTotals({
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    required this.goalCalories,
  });
}
