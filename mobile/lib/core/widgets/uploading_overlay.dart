import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class UploadingOverlay extends StatelessWidget {
  final bool show;
  final String message;

  const UploadingOverlay({
    super.key,
    required this.show,
    this.message = 'Uploading...',
  });

  @override
  Widget build(BuildContext context) {
    if (!show) return const SizedBox.shrink();

    return Container(
      color: Colors.black.withAlpha(100),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 32),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(25),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 56,
                height: 56,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(AppColors.primary),
                  backgroundColor: AppColors.primary.withAlpha(30),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                message,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Wraps a Scaffold body with the overlay using a Stack.
  static Widget wrap({
    required Widget child,
    required bool show,
    String message = 'Uploading...',
  }) {
    return Stack(
      children: [
        child,
        if (show)
          Positioned.fill(
            child: UploadingOverlay(show: show, message: message),
          ),
      ],
    );
  }
}
