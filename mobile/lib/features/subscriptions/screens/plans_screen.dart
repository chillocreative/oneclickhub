import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/plans_provider.dart';

class PlansScreen extends ConsumerStatefulWidget {
  const PlansScreen({super.key});

  @override
  ConsumerState<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends ConsumerState<PlansScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      // Refresh user data to get latest subscription status (e.g. admin-approved)
      ref.read(authProvider.notifier).fetchUser();
      ref.read(plansProvider.notifier).loadPlans();
    });
  }

  void _showGatewaySheet(Map<String, dynamic> plan) {
    final gateways = ref.read(plansProvider).gateways;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Select Payment Method',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 16),
              ...gateways.map((gw) {
                final name = gw['name']?.toString() ?? '';
                final slug = gw['slug']?.toString() ?? '';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: AppCard(
                    onTap: () {
                      Navigator.pop(ctx);
                      _initiatePayment(plan['slug']?.toString() ?? '', slug);
                    },
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.payment, color: AppColors.primary, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: AppColors.textDark,
                              fontSize: 15,
                            ),
                          ),
                        ),
                        const Icon(Icons.chevron_right, color: AppColors.textLight),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }

  Future<void> _initiatePayment(String planSlug, String gateway) async {
    final paymentUrl = await ref
        .read(plansProvider.notifier)
        .initiatePayment(planSlug, gateway);

    if (paymentUrl != null && mounted) {
      final result = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (_) => _PaymentWebViewScreen(paymentUrl: paymentUrl),
        ),
      );
      if (!mounted) return;
      // Always refresh user data after returning from payment
      ref.read(authProvider.notifier).fetchUser();
      ref.read(plansProvider.notifier).loadPlans();
      if (result == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment completed! Your subscription will be activated shortly.'),
            backgroundColor: AppColors.statusActive,
          ),
        );
      } else if (result == false) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment was not completed. Please try again.'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    } else if (mounted) {
      final error = ref.read(plansProvider).error;
      if (error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    }
  }

  Future<void> _confirmCancel() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Cancel Subscription'),
        content: const Text(
          'Are you sure you want to cancel your subscription? You will lose access to freelancer features at the end of your billing period.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Keep Subscription'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.statusRejected),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await ref.read(plansProvider.notifier).cancelSubscription();
      if (success && mounted) {
        ref.read(authProvider.notifier).fetchUser();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Subscription cancelled'),
            backgroundColor: AppColors.statusActive,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(plansProvider);
    final authState = ref.watch(authProvider);
    final subscription = authState.user?.subscription;

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'Subscription ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Plans',
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
      body: state.isLoading
          ? const ShimmerLoading(type: ShimmerType.list)
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async {
                // Refresh both user data and plans
                await ref.read(authProvider.notifier).fetchUser();
                await ref.read(plansProvider.notifier).loadPlans();
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Current subscription banner
                    if (subscription != null && subscription['status'] == 'active') ...[
                      _CurrentSubscriptionBanner(
                        subscription: subscription,
                        onCancel: _confirmCancel,
                        isProcessing: state.isProcessing,
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Plan cards
                    if (state.plans.isEmpty && state.error == null) ...[
                      const SizedBox(height: 40),
                      const Center(
                        child: Column(
                          children: [
                            Icon(Icons.card_membership, size: 48, color: AppColors.textLight),
                            SizedBox(height: 12),
                            Text(
                              'No plans available',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textGrey,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Pull down to refresh',
                              style: TextStyle(fontSize: 13, color: AppColors.textLight),
                            ),
                          ],
                        ),
                      ),
                    ],

                    ...state.plans.map((plan) {
                      final isCurrentPlan = subscription != null &&
                          subscription['plan']?['slug'] == plan['slug'] &&
                          subscription['status'] == 'active';
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _PlanCard(
                          plan: plan,
                          isCurrentPlan: isCurrentPlan,
                          isProcessing: state.isProcessing,
                          onSubscribe: () => _showGatewaySheet(plan),
                        ),
                      );
                    }),

                    if (state.error != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.statusRejectedBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: AppColors.statusRejected, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                state.error!,
                                style: const TextStyle(
                                  color: AppColors.statusRejected,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      GradientButton(
                        text: 'Retry',
                        icon: Icons.refresh,
                        onPressed: () {
                          ref.read(plansProvider.notifier).loadPlans();
                        },
                      ),
                    ],

                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }
}

class _CurrentSubscriptionBanner extends StatelessWidget {
  final Map<String, dynamic> subscription;
  final VoidCallback onCancel;
  final bool isProcessing;

  const _CurrentSubscriptionBanner({
    required this.subscription,
    required this.onCancel,
    required this.isProcessing,
  });

  @override
  Widget build(BuildContext context) {
    final planName = subscription['plan']?['name']?.toString() ?? 'Current Plan';
    final endsAtRaw = subscription['ends_at']?.toString();
    String? endsAt;
    if (endsAtRaw != null) {
      try {
        final dt = DateTime.parse(endsAtRaw);
        endsAt = '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
      } catch (_) {
        endsAt = endsAtRaw;
      }
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: AppColors.activeSubscriptionGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.workspace_premium, color: Colors.white, size: 24),
              const SizedBox(width: 8),
              const Text(
                'Active Subscription',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(30),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: const Text(
                  'Active',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            planName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          if (endsAt != null) ...[
            const SizedBox(height: 4),
            Text(
              'Renews: $endsAt',
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 13,
              ),
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            height: 36,
            child: OutlinedButton(
              onPressed: isProcessing ? null : onCancel,
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Colors.white54),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(100),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              child: isProcessing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Cancel Subscription', style: TextStyle(fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final Map<String, dynamic> plan;
  final bool isCurrentPlan;
  final bool isProcessing;
  final VoidCallback onSubscribe;

  const _PlanCard({
    required this.plan,
    required this.isCurrentPlan,
    required this.isProcessing,
    required this.onSubscribe,
  });

  @override
  Widget build(BuildContext context) {
    final name = plan['name']?.toString() ?? '';
    final formattedPrice = plan['formatted_price']?.toString() ?? '';
    final intervalLabel = plan['interval_label']?.toString() ?? '';
    final features = (plan['features'] as List?) ?? [];
    final isPopular = plan['is_popular'] == true;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isPopular) const SizedBox(height: 8),
              // Plan name & price
              Text(
                name,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    formattedPrice,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: AppColors.primary,
                    ),
                  ),
                  if (intervalLabel.isNotEmpty) ...[
                    const SizedBox(width: 4),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        '/ $intervalLabel',
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textGrey,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 16),

              // Features list
              ...features.map((feature) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: AppColors.statusActive, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          feature.toString(),
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.textDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),

              const SizedBox(height: 16),

              // Subscribe button
              if (isCurrentPlan)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.statusActiveBg,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: const Text(
                    'Current Plan',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.statusActive,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                )
              else
                GradientButton(
                  text: 'Subscribe',
                  width: double.infinity,
                  isLoading: isProcessing,
                  onPressed: onSubscribe,
                ),
            ],
          ),
        ),

        // Popular badge
        if (isPopular)
          Positioned(
            top: -8,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(100),
              ),
              child: const Text(
                'Popular',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _PaymentWebViewScreen extends StatefulWidget {
  final String paymentUrl;

  const _PaymentWebViewScreen({required this.paymentUrl});

  @override
  State<_PaymentWebViewScreen> createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<_PaymentWebViewScreen> {
  late WebViewController _controller;
  bool _isLoading = true;
  double _loadingProgress = 0;
  bool _hasPopped = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _isLoading = true);
          },
          onProgress: (progress) {
            if (mounted) setState(() => _loadingProgress = progress / 100.0);
          },
          onPageFinished: (url) {
            if (mounted) setState(() => _isLoading = false);
            _checkReturnUrl(url);
          },
          onNavigationRequest: (request) {
            // Also check navigation requests to catch redirects early
            _checkReturnUrl(request.url);
            return NavigationDecision.navigate;
          },
        ),
      )
      ..setUserAgent('OneClickHub-Mobile/1.0')
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  void _checkReturnUrl(String url) {
    if (_hasPopped) return;
    // Only detect return when landing on our payment result pages
    // The return_url from Bayarcash redirects to /payment/bayarcash/return
    // which then redirects to /payment/success, /payment/failed, or /payment/pending
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    if (!uri.host.contains('oneclickhub.verranet.com')) return;

    final path = uri.path;
    if (path.startsWith('/payment/bayarcash/return') ||
        path.startsWith('/payment/senangpay/callback') ||
        path.startsWith('/payment/success') ||
        path.startsWith('/payment/failed') ||
        path.startsWith('/payment/pending')) {
      _hasPopped = true;
      final isFailed = path.contains('failed');
      if (mounted) {
        Navigator.pop(context, !isFailed);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Complete Payment',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: AppColors.textDark,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.textGrey),
          onPressed: () => Navigator.pop(context, false),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textGrey),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_isLoading)
            LinearProgressIndicator(
              value: _loadingProgress,
              backgroundColor: Colors.grey[200],
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
              minHeight: 2,
            ),
          Expanded(
            child: WebViewWidget(controller: _controller),
          ),
        ],
      ),
    );
  }
}
