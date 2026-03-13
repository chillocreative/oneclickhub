import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../core/widgets/uploading_overlay.dart';
import '../providers/ssm_provider.dart';

class SsmScreen extends ConsumerStatefulWidget {
  const SsmScreen({super.key});

  @override
  ConsumerState<SsmScreen> createState() => _SsmScreenState();
}

class _SsmScreenState extends ConsumerState<SsmScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(ssmProvider.notifier).loadSsm();
    });
  }

  Future<void> _pickAndUpload() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    );

    if (result != null && result.files.single.path != null) {
      final success = await ref
          .read(ssmProvider.notifier)
          .uploadDocument(result.files.single.path!);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document uploaded for verification'),
            backgroundColor: AppColors.statusActive,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(ssmProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'SSM ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Certificate',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ),
      body: UploadingOverlay.wrap(
        show: state.isUploading,
        child: _buildBody(state),
      ),
    );
  }

  Widget _buildBody(SsmState state) {
    if (state.isLoading) {
      return const ShimmerLoading(type: ShimmerType.profile);
    }

    if (state.ssmData == null) {
      return EmptyState(
        icon: Icons.assignment,
        title: 'No SSM Certificate',
        description: 'Upload your SSM certificate to verify your business and start offering services.',
        actionLabel: 'Upload Document',
        onAction: _pickAndUpload,
      );
    }

    final data = state.ssmData!;
    final status = (data['status'] ?? '').toString().toLowerCase();

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Status card
          AppCard(
            child: Column(
              children: [
                // Status icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: _getStatusColor(status).withAlpha(20),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Icon(
                    _getStatusIcon(status),
                    color: _getStatusColor(status),
                    size: 28,
                  ),
                ),
                const SizedBox(height: 16),

                // Status badge
                StatusBadge(status: status),
                const SizedBox(height: 12),

                // Status message
                Text(
                  _getStatusMessage(status),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  _getStatusDescription(status),
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textGrey,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          // Company details (shown when verified)
          if (status == 'verified') ...[
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Company Details',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _DetailRow(
                    icon: Icons.business,
                    label: 'Company Name',
                    value: data['company_name']?.toString() ?? '-',
                  ),
                  const SizedBox(height: 12),
                  _DetailRow(
                    icon: Icons.numbers,
                    label: 'Registration Number',
                    value: data['registration_number']?.toString() ?? '-',
                  ),
                  if (data['expiry_date'] != null) ...[
                    const SizedBox(height: 12),
                    _DetailRow(
                      icon: Icons.calendar_today,
                      label: 'Expiry Date',
                      value: data['expiry_date'].toString(),
                    ),
                  ],
                ],
              ),
            ),
          ],

          // Admin notes (shown when failed)
          if (status == 'failed' && data['admin_notes'] != null) ...[
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.info_outline, color: AppColors.statusRejected, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Rejection Reason',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.statusRejected,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    data['admin_notes'].toString(),
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textGrey,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Re-upload button (shown when failed)
          if (status == 'failed') ...[
            const SizedBox(height: 16),
            GradientButton(
              text: 'Re-upload Document',
              icon: Icons.upload_file,
              isLoading: state.isUploading,
              width: double.infinity,
              onPressed: _pickAndUpload,
            ),
          ],

          // Upload in progress indicator
          if (state.isUploading) ...[
            const SizedBox(height: 16),
            const Center(
              child: Column(
                children: [
                  CircularProgressIndicator(color: AppColors.primary),
                  SizedBox(height: 8),
                  Text('Uploading document...', style: TextStyle(color: AppColors.textGrey)),
                ],
              ),
            ),
          ],

          // Error message
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

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return AppColors.statusPendingApproval;
      case 'verified':
        return AppColors.statusActive;
      case 'failed':
        return AppColors.statusRejected;
      default:
        return AppColors.textGrey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'pending':
        return Icons.hourglass_top;
      case 'verified':
        return Icons.verified;
      case 'failed':
        return Icons.cancel;
      default:
        return Icons.assignment;
    }
  }

  String _getStatusMessage(String status) {
    switch (status) {
      case 'pending':
        return 'Verification In Progress';
      case 'verified':
        return 'SSM Verified';
      case 'failed':
        return 'Verification Failed';
      default:
        return 'SSM Certificate';
    }
  }

  String _getStatusDescription(String status) {
    switch (status) {
      case 'pending':
        return 'Your document is being reviewed by our admin team. This usually takes 1-2 business days.';
      case 'verified':
        return 'Your business has been verified. You can now offer freelance services.';
      case 'failed':
        return 'Your document could not be verified. Please check the reason below and re-upload.';
      default:
        return '';
    }
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(15),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.primary, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textLight,
                ),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDark,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
