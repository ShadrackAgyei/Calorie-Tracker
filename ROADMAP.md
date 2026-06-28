# Ghanaian Calorie Tracker — Project Roadmap

## Vision
The first calorie tracking app built specifically for Ghanaian cuisine. Users take a photo of their meal and instantly get calories and macros — for banku, fufu, TZ, waakye, jollof, light soup, kenkey, kelewele, kontomire stew, and every other Ghanaian dish that apps like Cal AI and MyFitnessPal completely ignore.

**Target user:** People in Ghana, Android-first.

---

## Why this exists
Every mainstream calorie app (MyFitnessPal, Cronometer, Cal AI) is built on US/Western food data. There is no systematic database of prepared Ghanaian dishes with nutrition info. The FAO West Africa Food Composition Table (WAFCT 2019) covers ~1,000 raw West African ingredients but has no entries for composite dishes. We fill that gap.

---

## Data Strategy

### What we start with
- **FAO/INFOODS WAFCT 2019** — free, open license, 1,028 foods including West African ingredients (cassava, yam, plantain, cocoyam, banku base, kontomire, okra, groundnuts, fish). This is the ingredient-level foundation.

### What we build
A **Ghanaian Recipe Nutrition Database** of ~80–150 prepared dishes:
- Research standard recipes for each dish (jollof, waakye, TZ, light soup, groundnut soup, palm nut soup, okro soup, ampesi, kelewele, koose, bofrot, etc.)
- Calculate per-dish and per-serving nutrition from WAFCT ingredient values
- Document realistic Ghanaian portion sizes (a "plate of jollof" ≠ a Western cup measure)
- Validate via community (Ghanaian food groups, social media) and eventually dietitian review

### Day 1 (before recipe DB is complete)
- AI Vision (Claude Haiku) estimates calories from photos with Ghanaian cuisine context prompt
- Every user correction is saved as training data
- Recipe DB values replace AI estimates dish-by-dish as we build them

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Mobile | React Native | One codebase for Android + iOS, JS ecosystem |
| Backend | Supabase (free tier) | Auth, Postgres DB, file storage, realtime |
| AI Vision | Claude Haiku Vision | ~$0.01/scan, best cost/quality ratio |
| Nutrition DB | Custom (WAFCT-based) + AI fallback | Proprietary Ghanaian data is the moat |
| Hosting | Supabase + Vercel serverless | Free tiers cover early scale |

---

## Phases

### Phase 0 — Data Foundation (Weeks 1–4, runs in parallel with app)
- [ ] Import and parse FAO WAFCT 2019 into Supabase
- [ ] List 80 core Ghanaian dishes
- [ ] Research standard recipes and calculate nutrition per dish
- [ ] Build `foods` table schema with Ghanaian portion sizes
- [ ] Validate 10–20 dishes against CSIR-FRI 2001 reference values

### Phase 1 — MVP App (Weeks 3–10)
- [ ] React Native project setup (Expo, Android emulator)
- [ ] Supabase: auth, user profiles, meals table
- [ ] Camera screen → Claude Haiku Vision → structured calorie result
- [ ] Manual food search from Ghanaian DB
- [ ] Daily dashboard (calorie ring, macro bars, meal list)
- [ ] Meal history view
- [ ] User profile (weight, height, calorie goal)
- [ ] Android APK build for beta testing

### Phase 2 — Data Quality & Growth (Months 3–6)
- [ ] In-app "Report a correction" → feeds improvement pipeline
- [ ] Community photo collection campaign (WhatsApp, Facebook groups)
- [ ] Image annotation pipeline (Roboflow)
- [ ] Fine-tune YOLOv11 on Ghanaian food dataset
- [ ] Deploy on-device model (TFLite) — reduces API cost to near zero
- [ ] Reach out to CSIR-FRI Ghana for data partnership

### Phase 3 — Expansion (Months 6–12)
- [ ] Restaurant partnerships (menu with verified nutrition)
- [ ] Meal plans by Ghanaian dietitians
- [ ] Barcode scanner for packaged Ghanaian goods
- [ ] Twi/Ga language support
- [ ] Diaspora expansion (UK, US Ghanaian communities)
- [ ] Freemium monetization

---

## App Screens (MVP)

```
Bottom tabs:
  [Camera]     Scan meal → AI result → confirm/edit → log
  [Today]      Calorie ring, macro bars, today's meals
  [History]    Past days/weeks
  [Profile]    Goals, weight, settings
```

---

## AI Vision Prompt (Core)

```
You are a Ghanaian food and nutrition expert. The user has photographed their meal.
Identify every food item visible. Estimate portion sizes using reference objects
(plate edges, spoon, cup, hand if visible). This is Ghanaian cuisine context —
expect banku, fufu, TZ, jollof, waakye, soups, stews, fried plantain, etc.

Return JSON only:
[{
  "name": "banku",
  "portion_g": 300,
  "calories": 310,
  "protein_g": 6,
  "carbs_g": 68,
  "fat_g": 1,
  "confidence": 0.92
}]
```

---

## Cost Model

| Stage | Users | Scans/day | AI cost/month |
|---|---|---|---|
| Beta | 100 | 2 | ~$6 |
| Early growth | 1,000 | 2 | ~$60 |
| Scale | 10,000 | 2 | ~$600 → switch to on-device |

On-device YOLOv11 model (Phase 2) reduces API usage by ~80%, dropping costs to ~$120/month at 10K users.

---

## Key Resources
- FAO WAFCT 2019: https://www.fao.org/infoods/infoods/tables-and-databases/africa/en/
- CSIR-Food Research Institute Ghana: https://foodresearchgh.org/
- Ghana Food-Based Dietary Guidelines 2023: https://mofa.gov.gh/site/images/pdf/Ghana_Food_Based_Dietary_Guidelines_2023.pdf
- Roboflow (image annotation): https://roboflow.com/
- Supabase: https://supabase.com/
