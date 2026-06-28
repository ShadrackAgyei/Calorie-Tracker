insert into public.foods
  (id, name, name_local, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, typical_serving_g, category, source)
values
  -- STAPLES
  ('banku',          'Banku',                        'Banku',        103, 2.4, 22.8, 0.4, 1.2, 400, 'staple',    'wafct'),
  ('fufu',           'Fufu (cassava & plantain)',     'Fufuo',        118, 0.9, 28.4, 0.2, 1.5, 500, 'staple',    'recipe'),
  ('tz',             'Tuo Zaafi (TZ)',                'Tuo Zaafi',    110, 3.1, 23.9, 0.5, 1.8, 400, 'staple',    'recipe'),
  ('kenkey',         'Kenkey (Ga or Fante)',          'Komi / Dokono',115, 2.6, 25.8, 0.6, 1.4, 350, 'staple',    'recipe'),
  ('jollof_rice',    'Jollof Rice',                   'Jollof',       140, 3.2, 27.8, 2.4, 0.8, 350, 'rice',      'recipe'),
  ('waakye',         'Waakye (rice & beans)',         'Waakye',       132, 5.4, 25.6, 1.2, 2.8, 350, 'rice',      'recipe'),
  ('ampesi',         'Ampesi (boiled yam/plantain)',  null,           118, 1.5, 27.6, 0.2, 2.1, 400, 'staple',    'wafct'),
  ('omo_tuo',        'Omo Tuo (rice balls)',          null,           130, 2.4, 28.4, 0.4, null,400, 'staple',    'recipe'),

  -- SOUPS & STEWS
  ('light_soup',         'Light Soup (tomato & pepper)',          null,               42,  3.8, 4.2, 1.6, null, 300, 'soup',  'recipe'),
  ('groundnut_soup',     'Groundnut Soup',                        'Nkatie Nkwan',     148, 6.8, 6.4,11.2, null, 300, 'soup',  'recipe'),
  ('palmnut_soup',       'Palm Nut Soup',                         'Abenkwan',         168, 5.2, 5.8,14.2, null, 300, 'soup',  'recipe'),
  ('okro_soup',          'Okro Soup',                             null,               72,  4.6, 5.2, 3.8, 2.4, 250, 'soup',  'recipe'),
  ('kontomire_stew',     'Kontomire Stew (cocoyam leaf stew)',    'Kontomire',        88,  4.2, 4.8, 5.8, 3.2, 200, 'stew',  'recipe'),
  ('garden_egg_stew',    'Garden Egg Stew',                       null,               82,  3.2, 6.8, 4.8, null, 150, 'stew',  'recipe'),
  ('tomato_stew',        'Tomato Stew',                           null,               78,  2.8, 6.4, 4.4, null, 150, 'stew',  'recipe'),

  -- PROTEINS
  ('tilapia_grilled',  'Tilapia (grilled)',   null, 128, 26.0,  0,   2.6, null, 250, 'protein', 'wafct'),
  ('tilapia_fried',    'Tilapia (fried)',     null, 196, 22.4,  4.2, 9.8, null, 250, 'protein', 'recipe'),
  ('chicken_grilled',  'Chicken (grilled)',   null, 165, 31.0,  0,   3.6, null, 200, 'protein', 'wafct'),
  ('beef_stew',        'Beef (stewed)',       null, 188, 26.4,  2.8, 8.0, null, 150, 'protein', 'wafct'),
  ('egg_boiled',       'Egg (boiled)',        null, 155, 13.0,  1.1,10.6, null,  55, 'protein', 'wafct'),
  ('sardines_tinned',  'Sardines (tinned)',   null, 208, 24.6,  0,  11.4, null, 100, 'protein', 'wafct'),

  -- SNACKS & STREET FOOD
  ('kelewele',         'Kelewele (spiced fried plantain)', null, 192, 1.4, 32.4, 6.8, 2.2, 150, 'snack', 'recipe'),
  ('plantain_fried',   'Fried Plantain (ripe)',            null, 172, 1.2, 30.0, 5.4, null, 150, 'snack', 'wafct'),
  ('koose',            'Koose / Akara (black-eyed pea fritter)', null, 218, 8.8, 22.4, 10.8, null, 100, 'snack', 'recipe'),
  ('bofrot',           'Bofrot / Togbei (doughnut)',       null, 348, 5.8, 52.4, 13.2, null, 60,  'snack', 'recipe'),
  ('chin_chin',        'Chin Chin',                        null, 468, 8.2, 62.4, 20.4, null, 50,  'snack', 'recipe'),
  ('plantain_chips',   'Plantain Chips',                   null, 520, 2.4, 64.8, 26.4, null, 50,  'snack', 'recipe'),

  -- BREAKFAST
  ('hausa_koko',  'Hausa Koko (millet porridge)',    null, 56, 1.8, 11.4, 0.6, null, 400, 'breakfast', 'recipe'),
  ('tom_brown',   'Tom Brown (roasted corn porridge)',null, 62, 2.2, 13.0, 0.8, null, 350, 'breakfast', 'recipe'),
  ('rice_water',  'Rice Water / Akafa',              null, 38, 0.6,  8.4, 0.1, null, 300, 'breakfast', 'recipe'),
  ('bread_tea',   'Bread (tea bread slice)',         null, 265, 8.8, 50.4, 3.2, null, 40,  'breakfast', 'wafct'),

  -- DRINKS
  ('sobolo',      'Sobolo / Zobo (hibiscus drink)',  null, 38, 0.2,  9.2, 0,   null, 300, 'drink', 'recipe'),
  ('alvaro',      'Alvaro (pineapple drink)',        null, 44, 0,   10.8, 0,   null, 330, 'drink', 'recipe'),
  ('milo_sachet', 'Milo (made with milk)',           null, 68, 3.4, 10.2, 1.8, null, 250, 'drink', 'recipe')
on conflict (id) do nothing;
