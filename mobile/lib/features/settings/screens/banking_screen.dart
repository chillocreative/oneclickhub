import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../providers/banking_provider.dart';

class BankingScreen extends ConsumerStatefulWidget {
  const BankingScreen({super.key});

  @override
  ConsumerState<BankingScreen> createState() => _BankingScreenState();
}

class _BankingScreenState extends ConsumerState<BankingScreen> {
  bool _isEditing = false;
  late TextEditingController _bankNameController;
  late TextEditingController _accountNumberController;
  late TextEditingController _accountHolderController;

  @override
  void initState() {
    super.initState();
    _bankNameController = TextEditingController();
    _accountNumberController = TextEditingController();
    _accountHolderController = TextEditingController();
    Future.microtask(() {
      ref.read(bankingProvider.notifier).loadBanking();
    });
  }

  @override
  void dispose() {
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _accountHolderController.dispose();
    super.dispose();
  }

  void _populateFields(Map<String, dynamic> data) {
    _bankNameController.text = data['bank_name'] ?? '';
    _accountNumberController.text = data['account_number'] ?? '';
    _accountHolderController.text = data['account_holder_name'] ?? '';
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bankingProvider);

    if (state.bankingData != null && !_isEditing) {
      _populateFields(state.bankingData!);
    }

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'Banking ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Details',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
        actions: [
          if (!_isEditing && state.bankingData != null)
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
              onPressed: () => setState(() => _isEditing = true),
            ),
          if (_isEditing)
            IconButton(
              icon: const Icon(Icons.close, color: AppColors.textGrey),
              onPressed: () {
                setState(() => _isEditing = false);
                if (state.bankingData != null) {
                  _populateFields(state.bankingData!);
                }
              },
            ),
        ],
      ),
      body: _buildBody(state),
    );
  }

  Widget _buildBody(BankingState state) {
    if (state.isLoading) {
      return const ShimmerLoading(type: ShimmerType.profile);
    }

    if (state.bankingData == null && !_isEditing) {
      return EmptyState(
        icon: Icons.account_balance,
        title: 'No Banking Details',
        description: 'Add your banking details to receive payments from your freelance services.',
        actionLabel: 'Add Banking Details',
        onAction: () => setState(() => _isEditing = true),
      );
    }

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header icon
                Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.account_balance,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                _BankingField(
                  label: 'Bank Name',
                  controller: _bankNameController,
                  enabled: _isEditing,
                  icon: Icons.business,
                ),
                const SizedBox(height: 12),

                _BankingField(
                  label: 'Account Number',
                  controller: _accountNumberController,
                  enabled: _isEditing,
                  icon: Icons.numbers,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 12),

                _BankingField(
                  label: 'Account Holder Name',
                  controller: _accountHolderController,
                  enabled: _isEditing,
                  icon: Icons.person_outline,
                ),

                if (_isEditing) ...[
                  const SizedBox(height: 20),
                  GradientButton(
                    text: 'Save Details',
                    isLoading: state.isSaving,
                    width: double.infinity,
                    onPressed: () async {
                      final success = await ref
                          .read(bankingProvider.notifier)
                          .updateBanking({
                        'bank_name': _bankNameController.text,
                        'account_number': _accountNumberController.text,
                        'account_holder_name': _accountHolderController.text,
                      });
                      if (success && mounted) {
                        setState(() => _isEditing = false);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Banking details updated'),
                            backgroundColor: AppColors.statusActive,
                          ),
                        );
                      }
                    },
                  ),
                ],

                if (state.error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    state.error!,
                    style: const TextStyle(
                      color: AppColors.statusRejected,
                      fontSize: 13,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BankingField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool enabled;
  final IconData icon;
  final TextInputType? keyboardType;

  const _BankingField({
    required this.label,
    required this.controller,
    required this.enabled,
    required this.icon,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      enabled: enabled,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.textGrey, size: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade100),
        ),
        filled: !enabled,
        fillColor: enabled ? null : Colors.grey.shade50,
      ),
    );
  }
}
