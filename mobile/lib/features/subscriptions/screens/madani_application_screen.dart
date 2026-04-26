import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../auth/providers/auth_provider.dart';

/// Customer-facing form for the Madani sponsored plan. All names are
/// stored in upper-case (the backend re-applies `mb_strtoupper` for
/// safety) so the application matches the user's IC.
class MadaniApplicationScreen extends ConsumerStatefulWidget {
  const MadaniApplicationScreen({super.key});

  @override
  ConsumerState<MadaniApplicationScreen> createState() =>
      _MadaniApplicationScreenState();
}

class _MadaniApplicationScreenState
    extends ConsumerState<MadaniApplicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _ic = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  bool _busy = false;
  String? _error;
  Map<String, dynamic>? _existing;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    if (user != null) {
      _name.text = user.name.toUpperCase();
      _phone.text = user.phoneNumber;
      _address.text = user.address ?? '';
    }
    _loadExisting();
  }

  Future<void> _loadExisting() async {
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/madani-applications/me');
      if (res.data['success'] == true && res.data['data'] != null) {
        setState(() {
          _existing = Map<String, dynamic>.from(res.data['data']);
        });
      }
    } catch (_) {
      // ignore — first-time applicants have nothing to load
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _ic.dispose();
    _phone.dispose();
    _address.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post('/madani-applications', data: {
        'full_name': _name.text.trim().toUpperCase(),
        'ic_number': _ic.text.trim(),
        'phone_number': _phone.text.trim(),
        'address': _address.text.trim(),
      });
      if (res.data['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Application submitted. We will let you know once approved.'),
            backgroundColor: AppColors.statusActive,
          ),
        );
        context.pop();
      }
    } on DioException catch (e) {
      final errors = e.response?.data?['errors'];
      String msg = e.response?.data?['message']?.toString() ?? 'Submission failed';
      if (errors is Map) {
        msg = errors.values.expand((v) => v is List ? v : [v]).join('\n');
      }
      setState(() => _error = msg);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String? _required(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Required' : null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Madani Application',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.textDark,
          ),
        ),
        iconTheme: const IconThemeData(color: AppColors.textDark),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Madani — fully sponsored',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Your subscription will be borne by the Government of Malaysia. '
                        'Submit the form below; an admin will review your application.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textGrey,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                if (_existing != null) ...[
                  const SizedBox(height: 16),
                  _StatusBadge(status: _existing!['status']?.toString() ?? 'pending'),
                ],
                const SizedBox(height: 20),
                _label('Full name (as per IC)'),
                TextFormField(
                  controller: _name,
                  textCapitalization: TextCapitalization.characters,
                  inputFormatters: [
                    TextInputFormatter.withFunction(
                      (_, n) => TextEditingValue(
                        text: n.text.toUpperCase(),
                        selection: n.selection,
                      ),
                    ),
                  ],
                  validator: _required,
                  decoration: _decoration('e.g. AHMAD BIN ABDULLAH'),
                ),
                const SizedBox(height: 14),
                _label('IC number'),
                TextFormField(
                  controller: _ic,
                  keyboardType: TextInputType.number,
                  validator: _required,
                  decoration: _decoration('e.g. 800101015555'),
                ),
                const SizedBox(height: 14),
                _label('Phone number'),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  validator: _required,
                  decoration: _decoration('e.g. 0123456789'),
                ),
                const SizedBox(height: 14),
                _label('Address'),
                TextFormField(
                  controller: _address,
                  maxLines: 3,
                  validator: _required,
                  decoration: _decoration('Full residential address'),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: const TextStyle(color: AppColors.statusRejected),
                  ),
                ],
                const SizedBox(height: 24),
                GradientButton(
                  text: 'Submit application',
                  icon: Icons.send,
                  isLoading: _busy,
                  width: double.infinity,
                  onPressed: _submit,
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _label(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(
          s,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.textDark,
          ),
        ),
      );

  InputDecoration _decoration(String hint) => InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
      );
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final (color, label) = switch (status) {
      'approved' => (AppColors.statusActive, 'Application approved — your plan is active.'),
      'rejected' => (AppColors.statusRejected, 'Application rejected. Re-submit if you have new info.'),
      _ => (AppColors.statusPendingApproval, 'Application pending review.'),
    };
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
