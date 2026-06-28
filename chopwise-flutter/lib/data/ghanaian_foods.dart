import '../models/food_item.dart';

const List<FoodItem> ghanaianFoods = [
  FoodItem(id: 'banku', name: 'Banku', nameLocal: 'Banku', caloriesPer100g: 103, proteinPer100g: 2.4, carbsPer100g: 22.8, fatPer100g: 0.4, fiberPer100g: 1.2, typicalServingG: 400, category: 'staple'),
  FoodItem(id: 'fufu', name: 'Fufu (cassava & plantain)', nameLocal: 'Fufuo', caloriesPer100g: 118, proteinPer100g: 0.9, carbsPer100g: 28.4, fatPer100g: 0.2, fiberPer100g: 1.5, typicalServingG: 500, category: 'staple'),
  FoodItem(id: 'tz', name: 'Tuo Zaafi (TZ)', nameLocal: 'Tuo Zaafi', caloriesPer100g: 110, proteinPer100g: 3.1, carbsPer100g: 23.9, fatPer100g: 0.5, fiberPer100g: 1.8, typicalServingG: 400, category: 'staple'),
  FoodItem(id: 'kenkey', name: 'Kenkey (Ga or Fante)', nameLocal: 'Komi / Dokono', caloriesPer100g: 115, proteinPer100g: 2.6, carbsPer100g: 25.8, fatPer100g: 0.6, fiberPer100g: 1.4, typicalServingG: 350, category: 'staple'),
  FoodItem(id: 'jollof_rice', name: 'Jollof Rice', nameLocal: 'Jollof', caloriesPer100g: 140, proteinPer100g: 3.2, carbsPer100g: 27.8, fatPer100g: 2.4, fiberPer100g: 0.8, typicalServingG: 350, category: 'rice'),
  FoodItem(id: 'waakye', name: 'Waakye (rice & beans)', nameLocal: 'Waakye', caloriesPer100g: 132, proteinPer100g: 5.4, carbsPer100g: 25.6, fatPer100g: 1.2, fiberPer100g: 2.8, typicalServingG: 350, category: 'rice'),
  FoodItem(id: 'ampesi', name: 'Ampesi (boiled yam/plantain)', caloriesPer100g: 118, proteinPer100g: 1.5, carbsPer100g: 27.6, fatPer100g: 0.2, fiberPer100g: 2.1, typicalServingG: 400, category: 'staple'),
  FoodItem(id: 'omo_tuo', name: 'Omo Tuo (rice balls)', caloriesPer100g: 130, proteinPer100g: 2.4, carbsPer100g: 28.4, fatPer100g: 0.4, typicalServingG: 400, category: 'staple'),
  FoodItem(id: 'light_soup', name: 'Light Soup (tomato & pepper)', caloriesPer100g: 42, proteinPer100g: 3.8, carbsPer100g: 4.2, fatPer100g: 1.6, typicalServingG: 300, category: 'soup'),
  FoodItem(id: 'groundnut_soup', name: 'Groundnut Soup', nameLocal: 'Nkatie Nkwan', caloriesPer100g: 148, proteinPer100g: 6.8, carbsPer100g: 6.4, fatPer100g: 11.2, typicalServingG: 300, category: 'soup'),
  FoodItem(id: 'palmnut_soup', name: 'Palm Nut Soup', nameLocal: 'Abenkwan', caloriesPer100g: 168, proteinPer100g: 5.2, carbsPer100g: 5.8, fatPer100g: 14.2, typicalServingG: 300, category: 'soup'),
  FoodItem(id: 'okro_soup', name: 'Okro Soup', caloriesPer100g: 72, proteinPer100g: 4.6, carbsPer100g: 5.2, fatPer100g: 3.8, fiberPer100g: 2.4, typicalServingG: 250, category: 'soup'),
  FoodItem(id: 'kontomire_stew', name: 'Kontomire Stew', nameLocal: 'Kontomire', caloriesPer100g: 88, proteinPer100g: 4.2, carbsPer100g: 4.8, fatPer100g: 5.8, fiberPer100g: 3.2, typicalServingG: 200, category: 'stew'),
  FoodItem(id: 'garden_egg_stew', name: 'Garden Egg Stew', caloriesPer100g: 82, proteinPer100g: 3.2, carbsPer100g: 6.8, fatPer100g: 4.8, typicalServingG: 150, category: 'stew'),
  FoodItem(id: 'tomato_stew', name: 'Tomato Stew', caloriesPer100g: 78, proteinPer100g: 2.8, carbsPer100g: 6.4, fatPer100g: 4.4, typicalServingG: 150, category: 'stew'),
  FoodItem(id: 'tilapia_grilled', name: 'Tilapia (grilled)', caloriesPer100g: 128, proteinPer100g: 26.0, carbsPer100g: 0, fatPer100g: 2.6, typicalServingG: 250, category: 'protein'),
  FoodItem(id: 'tilapia_fried', name: 'Tilapia (fried)', caloriesPer100g: 196, proteinPer100g: 22.4, carbsPer100g: 4.2, fatPer100g: 9.8, typicalServingG: 250, category: 'protein'),
  FoodItem(id: 'chicken_grilled', name: 'Chicken (grilled)', caloriesPer100g: 165, proteinPer100g: 31.0, carbsPer100g: 0, fatPer100g: 3.6, typicalServingG: 200, category: 'protein'),
  FoodItem(id: 'beef_stew', name: 'Beef (stewed)', caloriesPer100g: 188, proteinPer100g: 26.4, carbsPer100g: 2.8, fatPer100g: 8.0, typicalServingG: 150, category: 'protein'),
  FoodItem(id: 'egg_boiled', name: 'Egg (boiled)', caloriesPer100g: 155, proteinPer100g: 13.0, carbsPer100g: 1.1, fatPer100g: 10.6, typicalServingG: 55, category: 'protein'),
  FoodItem(id: 'sardines_tinned', name: 'Sardines (tinned)', caloriesPer100g: 208, proteinPer100g: 24.6, carbsPer100g: 0, fatPer100g: 11.4, typicalServingG: 100, category: 'protein'),
  FoodItem(id: 'kelewele', name: 'Kelewele (spiced fried plantain)', caloriesPer100g: 192, proteinPer100g: 1.4, carbsPer100g: 32.4, fatPer100g: 6.8, fiberPer100g: 2.2, typicalServingG: 150, category: 'snack'),
  FoodItem(id: 'plantain_fried', name: 'Fried Plantain (ripe)', caloriesPer100g: 172, proteinPer100g: 1.2, carbsPer100g: 30.0, fatPer100g: 5.4, typicalServingG: 150, category: 'snack'),
  FoodItem(id: 'koose', name: 'Koose / Akara (black-eyed pea fritter)', caloriesPer100g: 218, proteinPer100g: 8.8, carbsPer100g: 22.4, fatPer100g: 10.8, typicalServingG: 100, category: 'snack'),
  FoodItem(id: 'bofrot', name: 'Bofrot / Togbei (doughnut)', caloriesPer100g: 348, proteinPer100g: 5.8, carbsPer100g: 52.4, fatPer100g: 13.2, typicalServingG: 60, category: 'snack'),
  FoodItem(id: 'chin_chin', name: 'Chin Chin', caloriesPer100g: 468, proteinPer100g: 8.2, carbsPer100g: 62.4, fatPer100g: 20.4, typicalServingG: 50, category: 'snack'),
  FoodItem(id: 'plantain_chips', name: 'Plantain Chips', caloriesPer100g: 520, proteinPer100g: 2.4, carbsPer100g: 64.8, fatPer100g: 26.4, typicalServingG: 50, category: 'snack'),
  FoodItem(id: 'hausa_koko', name: 'Hausa Koko (millet porridge)', caloriesPer100g: 56, proteinPer100g: 1.8, carbsPer100g: 11.4, fatPer100g: 0.6, typicalServingG: 400, category: 'breakfast'),
  FoodItem(id: 'tom_brown', name: 'Tom Brown (roasted corn porridge)', caloriesPer100g: 62, proteinPer100g: 2.2, carbsPer100g: 13.0, fatPer100g: 0.8, typicalServingG: 350, category: 'breakfast'),
  FoodItem(id: 'rice_water', name: 'Rice Water / Akafa', caloriesPer100g: 38, proteinPer100g: 0.6, carbsPer100g: 8.4, fatPer100g: 0.1, typicalServingG: 300, category: 'breakfast'),
  FoodItem(id: 'bread_tea', name: 'Bread (tea bread slice)', caloriesPer100g: 265, proteinPer100g: 8.8, carbsPer100g: 50.4, fatPer100g: 3.2, typicalServingG: 40, category: 'breakfast'),
  FoodItem(id: 'sobolo', name: 'Sobolo / Zobo (hibiscus drink)', caloriesPer100g: 38, proteinPer100g: 0.2, carbsPer100g: 9.2, fatPer100g: 0, typicalServingG: 300, category: 'drink'),
  FoodItem(id: 'alvaro', name: 'Alvaro (pineapple drink)', caloriesPer100g: 44, proteinPer100g: 0, carbsPer100g: 10.8, fatPer100g: 0, typicalServingG: 330, category: 'drink'),
  FoodItem(id: 'milo_sachet', name: 'Milo (made with milk)', caloriesPer100g: 68, proteinPer100g: 3.4, carbsPer100g: 10.2, fatPer100g: 1.8, typicalServingG: 250, category: 'drink'),
];

List<FoodItem> searchFoods(String query, {int limit = 20}) {
  final q = query.toLowerCase().trim();
  if (q.isEmpty) return ghanaianFoods.take(limit).toList();
  return ghanaianFoods
      .where((f) =>
          f.name.toLowerCase().contains(q) ||
          (f.nameLocal?.toLowerCase().contains(q) ?? false) ||
          f.category.toLowerCase().contains(q))
      .take(limit)
      .toList();
}
