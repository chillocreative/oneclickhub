import 'package:dio/dio.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/section_header.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../../../core/widgets/stat_card.dart';
import '../../auth/providers/auth_provider.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get(ApiConstants.dashboard);
      if (response.data['success'] == true) {
        setState(() {
          _dashboardData = response.data['data'];
          _isLoading = false;
        });
      }
    } on DioException {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            ClipOval(
              child: Image.asset(
                'assets/images/logo.png',
                width: 36,
                height: 36,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 10),
            RichText(
              text: const TextSpan(
                children: [
                  TextSpan(
                    text: 'ONECLICK',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                  TextSpan(
                    text: 'HUB',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.textGrey),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (!mounted) return;
              context.go('/auth/login');
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadDashboard,
        child: _isLoading
            ? const ShimmerLoading(type: ShimmerType.dashboard)
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (user?.isFreelancer == true)
                      _FreelancerDashboard(
                        data: _dashboardData,
                        user: user!,
                      ),
                    if (user?.isCustomer == true)
                      _CustomerDashboard(
                        data: _dashboardData,
                        userName: user?.name ?? 'User',
                      ),
                    if (user?.isAdmin == true)
                      _AdminDashboard(data: _dashboardData),
                  ],
                ),
              ),
      ),
    );
  }
}

// ─── FREELANCER DASHBOARD ───────────────────────────────────────────

class _FreelancerDashboard extends StatelessWidget {
  final Map<String, dynamic>? data;
  final dynamic user;

  const _FreelancerDashboard({required this.data, required this.user});

  @override
  Widget build(BuildContext context) {
    if (data == null) return const SizedBox.shrink();

    final subscription = user.subscription as Map<String, dynamic>?;
    final hasActiveSub = subscription?['status'] == 'active';
    final planName = subscription?['plan']?['name'] ?? 'No Plan';
    final daysLeft = subscription?['days_left'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'Manage Your\n',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textDark,
                  height: 1.2,
                ),
              ),
              TextSpan(
                text: 'Services',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Track and manage your freelance services',
          style: TextStyle(color: AppColors.textGrey, fontSize: 14),
        ),
        const SizedBox(height: 16),

        // New Service button
        GradientButton(
          text: 'New Service',
          icon: Icons.add,
          onPressed: () => context.push('/my-services/create'),
        ),
        const SizedBox(height: 24),

        // Subscription card
        AppCard(
          padding: const EdgeInsets.all(20),
          color: Colors.transparent,
          child: Container(
            decoration: BoxDecoration(
              gradient: hasActiveSub
                  ? AppColors.activeSubscriptionGradient
                  : AppColors.inactiveSubscriptionGradient,
              borderRadius: BorderRadius.circular(32),
            ),
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hasActiveSub ? 'Active Plan' : 'No Active Plan',
                        style: TextStyle(
                          color: Colors.white.withAlpha(200),
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        planName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      if (hasActiveSub) ...[
                        const SizedBox(height: 4),
                        Text(
                          '$daysLeft days remaining',
                          style: TextStyle(
                            color: Colors.white.withAlpha(200),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(50),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: GestureDetector(
                    onTap: () => context.push('/plans'),
                    child: Text(
                      hasActiveSub ? 'Manage' : 'Subscribe',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Stats grid (3 cols)
        Row(
          children: [
            Expanded(
              child: StatCard(
                icon: Icons.work_outline,
                iconColor: AppColors.primary,
                iconBgColor: const Color(0xFFFFF0E0),
                value: '${data!['total_services'] ?? 0}',
                label: 'Total Services',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatCard(
                icon: Icons.check_circle_outline,
                iconColor: AppColors.statusActive,
                iconBgColor: AppColors.statusActiveBg,
                value: '${data!['active_services'] ?? data!['total_services'] ?? 0}',
                label: 'Active',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatCard(
                icon: Icons.visibility_outlined,
                iconColor: AppColors.statusPendingApproval,
                iconBgColor: AppColors.statusPendingApprovalBg,
                value: '${data!['total_views'] ?? 0}',
                label: 'Views',
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Recent Services
        SectionHeader(
          title: 'Recent Services',
          actionLabel: 'View All',
          onAction: () => context.push('/my-services'),
        ),
        _buildRecentServices(context),
      ],
    );
  }

  Widget _buildRecentServices(BuildContext context) {
    final services = data?['recent_services'] as List? ?? [];
    if (services.isEmpty) {
      return AppCard(
        child: EmptyState(
          icon: Icons.work_outline,
          title: 'No Services Yet',
          description: 'Create your first service to start earning',
          actionLabel: 'Create Service',
          onAction: () => context.push('/my-services/create'),
        ),
      );
    }

    return Column(
      children: services.take(3).map((s) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: AppCard(
            onTap: () {
              if (s['slug'] != null) context.push('/services/${s['slug']}');
            },
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(15),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.work, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s['title'] ?? 'Service',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textDark,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        s['category']?['name'] ?? '',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textGrey,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.textLight),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ─── CUSTOMER DASHBOARD ─────────────────────────────────────────────

class _CustomerDashboard extends StatelessWidget {
  final Map<String, dynamic>? data;
  final String userName;

  const _CustomerDashboard({required this.data, required this.userName});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Greeting
        RichText(
          text: TextSpan(
            children: [
              const TextSpan(
                text: 'Welcome,\n',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textDark,
                  height: 1.2,
                ),
              ),
              TextSpan(
                text: userName,
                style: const TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Browse Services card (gradient)
        AppCard(
          onTap: () => context.go('/services'),
          padding: EdgeInsets.zero,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(32),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(50),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.search, color: Colors.white, size: 24),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Browse Services',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Find the perfect freelancer for your needs',
                  style: TextStyle(
                    color: Colors.white.withAlpha(200),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),

        // My Bookings + Favorites row
        Row(
          children: [
            Expanded(
              child: AppCard(
                onTap: () => context.go('/bookings'),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.receipt_long,
                          color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'My Bookings',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${data?['active_bookings'] ?? 0} active',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textGrey,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child:
                          const Icon(Icons.favorite, color: Colors.grey, size: 22),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Favorites',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Coming soon',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────

class _AdminDashboard extends StatelessWidget {
  final Map<String, dynamic>? data;

  const _AdminDashboard({required this.data});

  @override
  Widget build(BuildContext context) {
    final stats = data?['stats'] as Map<String, dynamic>? ?? {};
    final orderAnalytics =
        data?['order_analytics'] as List? ?? [];
    final serviceCategories =
        data?['service_categories'] as List? ?? [];
    final topFreelancers =
        data?['top_freelancers'] as List? ?? [];
    final topCategories =
        data?['top_categories'] as List? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header with Online badge
        Row(
          children: [
            Expanded(
              child: RichText(
                text: const TextSpan(
                  children: [
                    TextSpan(
                      text: 'Admin\n',
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textDark,
                        height: 1.2,
                      ),
                    ),
                    TextSpan(
                      text: 'Dashboard',
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.statusActiveBg,
                borderRadius: BorderRadius.circular(100),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.statusActive,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'Online',
                    style: TextStyle(
                      color: AppColors.statusActive,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // 6 stat cards in 2 rows of 3
        Row(
          children: [
            Expanded(
              child: StatCard(
                icon: Icons.people_outline,
                iconColor: AppColors.primary,
                iconBgColor: const Color(0xFFFFF0E0),
                value: '${stats['freelancers'] ?? 0}',
                label: 'Freelancers',
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: StatCard(
                icon: Icons.person_outline,
                iconColor: AppColors.statusPendingApproval,
                iconBgColor: AppColors.statusPendingApprovalBg,
                value: '${stats['customers'] ?? 0}',
                label: 'Customers',
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: StatCard(
                icon: Icons.attach_money,
                iconColor: AppColors.statusActive,
                iconBgColor: AppColors.statusActiveBg,
                value: 'RM ${_formatNum(stats['revenue'])}',
                label: 'Revenue',
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: StatCard(
                icon: Icons.receipt_long_outlined,
                iconColor: AppColors.statusDelivered,
                iconBgColor: AppColors.statusDeliveredBg,
                value: '${stats['orders'] ?? 0}',
                label: 'Orders',
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: StatCard(
                icon: Icons.card_membership,
                iconColor: AppColors.statusCompleted,
                iconBgColor: AppColors.statusCompletedBg,
                value: '${stats['active_subscriptions'] ?? 0}',
                label: 'Active Subs',
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: StatCard(
                icon: Icons.assignment_outlined,
                iconColor: AppColors.statusPendingPayment,
                iconBgColor: AppColors.statusPendingPaymentBg,
                value: '${stats['pending_ssm'] ?? 0}',
                label: 'Pending SSM',
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Order Analytics Bar Chart
        if (orderAnalytics.isNotEmpty) ...[
          const SectionHeader(title: 'Order Analytics'),
          AppCard(
            child: SizedBox(
              height: 220,
              child: _OrderBarChart(data: orderAnalytics),
            ),
          ),
          const SizedBox(height: 20),
        ],

        // Service Categories Pie Chart (dark card)
        if (serviceCategories.isNotEmpty) ...[
          const SectionHeader(title: 'Service Categories'),
          _CategoryPieChart(data: serviceCategories),
          const SizedBox(height: 20),
        ],

        // Top Freelancers
        if (topFreelancers.isNotEmpty) ...[
          const SectionHeader(title: 'Top Freelancers'),
          AppCard(
            child: Column(
              children: topFreelancers
                  .take(5)
                  .toList()
                  .asMap()
                  .entries
                  .map((entry) => _buildFreelancerRow(entry.key, entry.value))
                  .toList(),
            ),
          ),
          const SizedBox(height: 20),
        ],

        // Top Order Categories
        if (topCategories.isNotEmpty) ...[
          const SectionHeader(title: 'Top Order Categories'),
          AppCard(
            child: Column(
              children: topCategories
                  .take(5)
                  .toList()
                  .asMap()
                  .entries
                  .map((entry) => _buildCategoryProgress(
                      entry.value, topCategories))
                  .toList(),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ],
    );
  }

  Widget _buildFreelancerRow(int index, Map<String, dynamic> freelancer) {
    final name = freelancer['name'] ?? 'Unknown';
    final initials = name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
    final earnings = freelancer['earnings'] ?? freelancer['total_earnings'] ?? 0;
    final rating = freelancer['rating'] ?? 0;

    return Padding(
      padding: EdgeInsets.only(bottom: index < 4 ? 12 : 0),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                initials,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textDark,
                    fontSize: 14,
                  ),
                ),
                Text(
                  'RM ${_formatNum(earnings)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textGrey,
                  ),
                ),
              ],
            ),
          ),
          if (rating > 0)
            Row(
              children: [
                const Icon(Icons.star, color: Color(0xFFFFB800), size: 16),
                const SizedBox(width: 2),
                Text(
                  rating.toStringAsFixed(1),
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: AppColors.textDark,
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildCategoryProgress(
      Map<String, dynamic> cat, List<dynamic> all) {
    final name = cat['name'] ?? '';
    final count = (cat['count'] ?? cat['orders_count'] ?? 0) as num;
    final maxCount = all.fold<num>(0, (m, c) {
      final v = (c['count'] ?? c['orders_count'] ?? 0) as num;
      return v > m ? v : m;
    });
    final progress = maxCount > 0 ? count / maxCount : 0.0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textDark,
                ),
              ),
              Text(
                '$count orders',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textGrey,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.toDouble(),
              backgroundColor: Colors.grey.shade100,
              color: AppColors.primary,
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  String _formatNum(dynamic val) {
    if (val == null) return '0';
    if (val is int) return val.toString();
    if (val is double) return val.toStringAsFixed(0);
    return val.toString();
  }
}

// ─── ORDER BAR CHART ────────────────────────────────────────────────

class _OrderBarChart extends StatelessWidget {
  final List<dynamic> data;

  const _OrderBarChart({required this.data});

  @override
  Widget build(BuildContext context) {
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: _maxY(),
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: BarTouchTooltipData(
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              return BarTooltipItem(
                '${rod.toY.toInt()} orders',
                const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                if (idx >= 0 && idx < data.length) {
                  final label = data[idx]['label'] ?? data[idx]['date'] ?? '';
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      _shortLabel(label.toString()),
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textGrey,
                      ),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ),
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
        ),
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        barGroups: data.asMap().entries.map((entry) {
          final count =
              (entry.value['count'] ?? entry.value['total'] ?? 0) as num;
          return BarChartGroupData(
            x: entry.key,
            barRods: [
              BarChartRodData(
                toY: count.toDouble(),
                gradient: AppColors.primaryGradient,
                width: 24,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(8),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  double _maxY() {
    double max = 0;
    for (final d in data) {
      final v = (d['count'] ?? d['total'] ?? 0) as num;
      if (v > max) max = v.toDouble();
    }
    return max == 0 ? 10 : max * 1.2;
  }

  String _shortLabel(String label) {
    if (label.length <= 3) return label;
    // Try to parse date and return short day name
    try {
      final parts = label.split('-');
      if (parts.length >= 2) return parts.last;
    } catch (_) {}
    return label.substring(0, 3);
  }
}

// ─── CATEGORY PIE CHART (DARK CARD) ────────────────────────────────

class _CategoryPieChart extends StatelessWidget {
  final List<dynamic> data;

  const _CategoryPieChart({required this.data});

  static const _colors = [
    Color(0xFFFF6600),
    Color(0xFFFFB800),
    Color(0xFF22C55E),
    Color(0xFF3B82F6),
    Color(0xFF8B5CF6),
    Color(0xFFEF4444),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
  ];

  @override
  Widget build(BuildContext context) {
    final total = data.fold<num>(
        0, (sum, c) => sum + (c['count'] ?? c['services_count'] ?? 0));

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.adminDarkCard,
        borderRadius: BorderRadius.circular(32),
      ),
      child: Column(
        children: [
          SizedBox(
            height: 200,
            child: Stack(
              alignment: Alignment.center,
              children: [
                PieChart(
                  PieChartData(
                    sectionsSpace: 3,
                    centerSpaceRadius: 55,
                    sections: data.asMap().entries.map((entry) {
                      final count = (entry.value['count'] ??
                              entry.value['services_count'] ??
                              0) as num;
                      return PieChartSectionData(
                        color: _colors[entry.key % _colors.length],
                        value: count.toDouble(),
                        title: '',
                        radius: 35,
                      );
                    }).toList(),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '$total',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      'Total',
                      style: TextStyle(
                        color: Colors.white.withAlpha(150),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: data.asMap().entries.map((entry) {
              final name = entry.value['name'] ?? '';
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: _colors[entry.key % _colors.length],
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    name,
                    style: TextStyle(
                      color: Colors.white.withAlpha(200),
                      fontSize: 12,
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
