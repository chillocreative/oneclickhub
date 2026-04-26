import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final String? label;

  const StatusBadge({super.key, required this.status, this.label});

  @override
  Widget build(BuildContext context) {
    final colors = _getStatusColors(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: colors.$2,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        label ?? _bookingLabel(status),
        style: TextStyle(
          color: colors.$1,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.3,
        ),
      ),
    );
  }

  /// Booking-flow display labels that line up with the new customer-facing
  /// statuses (Booking Confirmed → Service Paid → Delivered → Completed).
  static String _bookingLabel(String status) => switch (status.toLowerCase()) {
        'pending_payment' => 'Booking Confirmed',
        'pending_approval' => 'Awaiting Confirmation',
        'active' => 'Service Paid',
        'delivered' => 'Delivered',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
        'rejected' => 'Rejected',
        _ => _formatStatus(status),
      };

  static (Color, Color) _getStatusColors(String status) {
    switch (status.toLowerCase()) {
      case 'pending_payment':
        return (AppColors.statusPendingPayment, AppColors.statusPendingPaymentBg);
      case 'pending_approval':
        return (AppColors.statusPendingApproval, AppColors.statusPendingApprovalBg);
      case 'active':
        return (AppColors.statusActive, AppColors.statusActiveBg);
      case 'delivered':
        return (AppColors.statusDelivered, AppColors.statusDeliveredBg);
      case 'completed':
        return (AppColors.statusCompleted, AppColors.statusCompletedBg);
      case 'cancelled':
        return (AppColors.statusCancelled, AppColors.statusCancelledBg);
      case 'rejected':
        return (AppColors.statusRejected, AppColors.statusRejectedBg);
      case 'pending':
        return (AppColors.statusPendingApproval, AppColors.statusPendingApprovalBg);
      case 'verified':
        return (AppColors.statusActive, AppColors.statusActiveBg);
      case 'failed':
        return (AppColors.statusRejected, AppColors.statusRejectedBg);
      default:
        return (AppColors.textGrey, const Color(0xFFF3F4F6));
    }
  }

  static String _formatStatus(String status) {
    return status.replaceAll('_', ' ').split(' ').map((w) {
      if (w.isEmpty) return w;
      return '${w[0].toUpperCase()}${w.substring(1)}';
    }).join(' ');
  }

  /// Public helper so callers can compute the booking-flow label without
  /// rendering the badge.
  static String labelFor(String status, {String? override}) =>
      override ?? _bookingLabel(status);
}
