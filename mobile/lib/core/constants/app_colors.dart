import 'package:flutter/material.dart';

class AppColors {
  // Primary orange palette (matches web #FF6600)
  static const Color primary = Color(0xFFFF6600);
  static const Color primaryLight = Color(0xFFFF8533);
  static const Color primaryDark = Color(0xFFE55C00);

  // Secondary
  static const Color secondary = Color(0xFFFFB800);

  // Gradient colors
  static const Color gradientStart = Color(0xFFFF6600);
  static const Color gradientEnd = Color(0xFFFFB800);

  // Background warm tones
  static const Color backgroundWarm = Color(0xFFFFFBF7);
  static const Color backgroundCard = Color(0xFFFFFFFF);

  // Status badge colors (matching web app exactly)
  static const Color statusPendingPayment = Color(0xFFEAB308);
  static const Color statusPendingPaymentBg = Color(0xFFFEF9C3);
  static const Color statusPendingApproval = Color(0xFF3B82F6);
  static const Color statusPendingApprovalBg = Color(0xFFDBEAFE);
  static const Color statusActive = Color(0xFF22C55E);
  static const Color statusActiveBg = Color(0xFFDCFCE7);
  static const Color statusDelivered = Color(0xFF8B5CF6);
  static const Color statusDeliveredBg = Color(0xFFEDE9FE);
  static const Color statusCompleted = Color(0xFF10B981);
  static const Color statusCompletedBg = Color(0xFFD1FAE5);
  static const Color statusCancelled = Color(0xFF6B7280);
  static const Color statusCancelledBg = Color(0xFFF3F4F6);
  static const Color statusRejected = Color(0xFFEF4444);
  static const Color statusRejectedBg = Color(0xFFFEE2E2);

  // Admin dark card
  static const Color adminDarkCard = Color(0xFF2B313F);

  // Text
  static const Color textDark = Color(0xFF1A1A2E);
  static const Color textGrey = Color(0xFF6B7280);
  static const Color textLight = Color(0xFF9CA3AF);

  // Splash screen gradient
  static const Color splashTopLeft = Color(0xFFFFF0E0);
  static const Color splashCenter = Color(0xFFFFFFFF);
  static const Color splashBottomRight = Color(0xFFFFF8E8);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFFF6600), Color(0xFFFFB800)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient welcomeGradient = LinearGradient(
    colors: [Color(0xFFFF6600), Color(0xFFFF8533)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Subscription gradients
  static const LinearGradient activeSubscriptionGradient = LinearGradient(
    colors: [Color(0xFF22C55E), Color(0xFF16A34A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient inactiveSubscriptionGradient = LinearGradient(
    colors: [Color(0xFFFF6600), Color(0xFFFFB800)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
