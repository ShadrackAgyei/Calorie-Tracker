import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_colors.dart';
import '../models/user_profile.dart';
import '../store/meal_store.dart';

({String label, Color color, Color bg}) _bmiInfo(double bmi) {
  if (bmi < 18.5) return (label: 'Underweight', color: const Color(0xFF3B82F6), bg: const Color(0xFFEFF6FF));
  if (bmi < 25) return (label: 'Normal weight', color: const Color(0xFF16A34A), bg: const Color(0xFFF0FDF4));
  if (bmi < 30) return (label: 'Overweight', color: AppColors.yellow, bg: const Color(0xFFFFFBEB));
  return (label: 'Obese', color: AppColors.red, bg: const Color(0xFFFEF2F2));
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _heightCtrl = TextEditingController();
  final _goalCtrl = TextEditingController();
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final profile = context.read<MealStore>().profile;
      _nameCtrl.text = profile.name;
      _ageCtrl.text = profile.age?.toString() ?? '';
      _weightCtrl.text = profile.weightKg?.toString() ?? '';
      _heightCtrl.text = profile.heightCm?.toString() ?? '';
      _goalCtrl.text = profile.dailyCalorieGoal.toString();
      _initialized = true;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _ageCtrl.dispose();
    _weightCtrl.dispose();
    _heightCtrl.dispose();
    _goalCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final store = context.read<MealStore>();
    await store.setProfile(UserProfile(
      name: _nameCtrl.text.trim(),
      age: int.tryParse(_ageCtrl.text),
      weightKg: double.tryParse(_weightCtrl.text),
      heightCm: double.tryParse(_heightCtrl.text),
      dailyCalorieGoal: int.tryParse(_goalCtrl.text) ?? 2200,
    ));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile saved'), backgroundColor: AppColors.green),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    context.watch<MealStore>();
    final name = _nameCtrl.text;
    final avatarLetter = name.isNotEmpty ? name[0].toUpperCase() : '?';

    final liveWeight = double.tryParse(_weightCtrl.text);
    final liveHeight = double.tryParse(_heightCtrl.text);
    double? bmiVal;
    if (liveWeight != null && liveHeight != null && liveHeight > 0) {
      bmiVal = liveWeight / ((liveHeight / 100) * (liveHeight / 100));
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              color: AppColors.green,
              width: double.infinity,
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 16,
                bottom: 36,
                left: 24,
                right: 24,
              ),
              child: Column(
                children: [
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(48),
                      border: Border.all(color: Colors.white.withOpacity(0.4), width: 3),
                    ),
                    child: Center(
                      child: Text(
                        avatarLetter,
                        style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    name.isNotEmpty ? name : 'Your Name',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: -0.2),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: Transform.translate(
                offset: const Offset(0, -20),
                child: Column(
                  children: [
                    if (bmiVal != null) ...[
                      _BmiCard(bmi: bmiVal, weightKg: liveWeight, heightCm: liveHeight, age: int.tryParse(_ageCtrl.text)),
                      const SizedBox(height: 14),
                    ],

                    _card(
                      title: 'Personal Info',
                      child: Column(
                        children: [
                          _Field(label: 'Full Name', controller: _nameCtrl, placeholder: 'Your name', onChanged: (_) => setState(() {})),
                          _Field(label: 'Age', controller: _ageCtrl, placeholder: 'e.g. 28', isNumeric: true),
                          _Field(label: 'Weight', controller: _weightCtrl, placeholder: 'e.g. 72', isNumeric: true, unit: 'kg'),
                          _Field(label: 'Height', controller: _heightCtrl, placeholder: 'e.g. 168', isNumeric: true, unit: 'cm', onChanged: (_) => setState(() {})),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    _card(
                      title: 'Daily Calorie Goal',
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Typical range: 1,500–3,000 kcal depending on your size and activity level.',
                            style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
                          ),
                          const SizedBox(height: 14),
                          _Field(label: 'Daily target', controller: _goalCtrl, placeholder: '2200', isNumeric: true, unit: 'kcal'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 4,
                          shadowColor: AppColors.green.withOpacity(0.4),
                        ),
                        child: const Text('Save Changes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(height: 24),

                    const Column(
                      children: [
                        Text('ChopWise · Built for Ghana', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                        SizedBox(height: 4),
                        Text('Nutrition data: FAO/INFOODS WAFCT 2019', style: TextStyle(fontSize: 11, color: Color(0xFFC4C9D4)), textAlign: TextAlign.center),
                      ],
                    ),

                    SizedBox(height: MediaQuery.of(context).padding.bottom + 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _card({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _BmiCard extends StatelessWidget {
  final double bmi;
  final double? weightKg;
  final double? heightCm;
  final int? age;

  const _BmiCard({required this.bmi, this.weightKg, this.heightCm, this.age});

  @override
  Widget build(BuildContext context) {
    final info = _bmiInfo(bmi);
    final pinPct = ((bmi - 15) / 25).clamp(0.02, 0.96);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Body Mass Index', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: info.bg, borderRadius: BorderRadius.circular(14)),
                  child: Column(
                    children: [
                      Text(bmi.toStringAsFixed(1), style: TextStyle(fontSize: 36, fontWeight: FontWeight.w800, color: info.color, letterSpacing: -1)),
                      const SizedBox(height: 2),
                      Text(info.label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: info.color)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (weightKg != null) _BmiStat(label: 'Weight', value: '${weightKg}kg'),
                    if (heightCm != null) _BmiStat(label: 'Height', value: '${heightCm}cm'),
                    if (age != null) _BmiStat(label: 'Age', value: '${age} yrs'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          LayoutBuilder(builder: (context, constraints) {
            return Stack(
              clipBehavior: Clip.none,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: Row(
                    children: [
                      Flexible(flex: 18, child: Container(height: 12, color: const Color(0xFF3B82F6))),
                      Flexible(flex: 32, child: Container(height: 12, color: const Color(0xFF16A34A))),
                      Flexible(flex: 25, child: Container(height: 12, color: AppColors.yellow)),
                      Flexible(flex: 25, child: Container(height: 12, color: AppColors.red)),
                    ],
                  ),
                ),
                Positioned(
                  left: constraints.maxWidth * pinPct - 9,
                  top: -3,
                  child: Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: AppColors.textPrimary,
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(color: Colors.white, width: 3),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4, offset: const Offset(0, 2))],
                    ),
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 6),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Under', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              Text('Normal', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              Text('Over', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              Text('Obese', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}

class _BmiStat extends StatelessWidget {
  final String label;
  final String value;
  const _BmiStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          Text(value, style: const TextStyle(fontSize: 15, color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String? placeholder;
  final bool isNumeric;
  final String? unit;
  final ValueChanged<String>? onChanged;

  const _Field({
    required this.label,
    required this.controller,
    this.placeholder,
    this.isNumeric = false,
    this.unit,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border, width: 1.5),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    keyboardType: isNumeric ? TextInputType.number : TextInputType.text,
                    onChanged: onChanged,
                    style: const TextStyle(fontSize: 15, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: placeholder,
                      hintStyle: const TextStyle(color: Color(0xFFC4C9D4)),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),
                if (unit != null)
                  Padding(
                    padding: const EdgeInsets.only(right: 14),
                    child: Text(unit!, style: const TextStyle(fontSize: 13, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
