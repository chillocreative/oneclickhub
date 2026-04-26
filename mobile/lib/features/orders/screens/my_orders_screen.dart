import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/datetime_format.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../../../core/widgets/status_badge.dart';
import '../models/order.dart';
import '../providers/orders_provider.dart';

class MyOrdersScreen extends ConsumerStatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  ConsumerState<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends ConsumerState<MyOrdersScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(myOrdersProvider.notifier).loadOrders(refresh: true);
    });
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(myOrdersProvider.notifier).loadMore();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(myOrdersProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'My ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Orders',
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
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.read(myOrdersProvider.notifier).loadOrders(refresh: true);
        },
        child: Column(
          children: [
            _StatusFilterChips(
              selectedStatus: state.statusFilter,
              onSelected: (status) {
                ref.read(myOrdersProvider.notifier).setStatusFilter(status);
              },
            ),
            Expanded(
              child: state.isLoading
                  ? const ShimmerLoading(type: ShimmerType.list)
                  : state.orders.isEmpty
                      ? ListView(
                          children: const [
                            EmptyState(
                              icon: Icons.receipt_long_outlined,
                              title: 'No Orders Yet',
                              description:
                                  'Orders from customers will appear here',
                            ),
                          ],
                        )
                      : _OrdersListView(
                          orders: state.orders,
                          scrollController: _scrollController,
                          isLoadingMore: state.isLoadingMore,
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── STATUS FILTER CHIPS ────────────────────────────────────────────

class _StatusFilterChips extends StatelessWidget {
  final String? selectedStatus;
  final ValueChanged<String?> onSelected;

  const _StatusFilterChips({
    required this.selectedStatus,
    required this.onSelected,
  });

  static const _statuses = [
    (null, 'All'),
    ('pending_payment', 'Pending'),
    ('active', 'Active'),
    ('delivered', 'Delivered'),
    ('completed', 'Completed'),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: _statuses.map((s) {
          final isSelected = selectedStatus == s.$1;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: GestureDetector(
              onTap: () => onSelected(s.$1),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.white,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.primary
                        : Colors.grey.shade200,
                  ),
                ),
                child: Text(
                  s.$2,
                  style: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textGrey,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ─── SHARED ORDERS LIST VIEW ────────────────────────────────────────

class _OrdersListView extends StatelessWidget {
  final List<Order> orders;
  final ScrollController scrollController;
  final bool isLoadingMore;

  const _OrdersListView({
    required this.orders,
    required this.scrollController,
    required this.isLoadingMore,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.all(16),
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: orders.length + (isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= orders.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(
                color: AppColors.primary,
                strokeWidth: 2,
              ),
            ),
          );
        }
        final order = orders[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: _OrderCard(order: order),
        );
      },
    );
  }
}

class _OrderCard extends ConsumerStatefulWidget {
  final Order order;

  const _OrderCard({required this.order});

  @override
  ConsumerState<_OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends ConsumerState<_OrderCard> {
  bool _isBusy = false;

  Future<void> _doAction(String suffix, String successMessage,
      {Map<String, dynamic>? data}) async {
    if (_isBusy) return;
    setState(() => _isBusy = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.post(
        '${ApiConstants.orders}/${widget.order.id}/$suffix',
        data: data,
      );
      ref.read(myOrdersProvider.notifier).loadOrders(refresh: true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(successMessage),
            backgroundColor: AppColors.statusActive,
          ),
        );
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Action failed'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  Future<void> _confirmReject() async {
    final reasonCtrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reject booking'),
        content: TextField(
          controller: reasonCtrl,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Reason (optional)',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: AppColors.statusRejected),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
    if (ok == true) {
      await _doAction(
        'reject',
        'Booking rejected.',
        data: {'reason': reasonCtrl.text.trim()},
      );
    }
  }

  void _onMenuSelected(String value) {
    switch (value) {
      case 'view':
        context.push('/orders/${widget.order.id}');
        break;
      case 'accept':
        _doAction('accept', 'Booking marked as Service Paid.');
        break;
      case 'reject':
        _confirmReject();
        break;
      case 'deliver':
        _doAction('deliver', 'Booking marked as Delivered.');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final canAcceptOrReject =
        order.status == 'pending_payment' || order.status == 'pending_approval';
    final canDeliver = order.status == 'active';
    final firstImage = order.service?.firstImage;
    final customerName = order.customer?.name ?? '';
    final initial = customerName.isNotEmpty
        ? customerName[0].toUpperCase()
        : '?';

    return AppCard(
      onTap: () => context.push('/orders/${order.id}'),
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top: image + price/title + customer/status
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  width: 80,
                  height: 80,
                  child: firstImage != null && firstImage.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: firstImage,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            color: AppColors.primary.withAlpha(20),
                          ),
                          errorWidget: (_, __, ___) => Container(
                            color: AppColors.primary.withAlpha(20),
                            child: const Icon(Icons.work,
                                color: AppColors.primary, size: 28),
                          ),
                        )
                      : Container(
                          color: AppColors.primary.withAlpha(20),
                          child: const Icon(Icons.work,
                              color: AppColors.primary, size: 28),
                        ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.priceDisplay,
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                        color: AppColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (order.service != null)
                      Text(
                        order.service!.title,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textDark,
                          height: 1.3,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: const BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            initial,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            customerName,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textGrey,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        StatusBadge(
                          status: order.status,
                          label: order.statusLabel,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(height: 1, color: const Color(0xFFEFEFEF)),
          // Footer: date + 3-dot menu
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(
                  AppDateTime.formatBooking(order.bookingDate),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textDark,
                  ),
                ),
              ),
              _isBusy
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.primary,
                        ),
                      ),
                    )
                  : PopupMenuButton<String>(
                      onSelected: _onMenuSelected,
                      icon: const Icon(Icons.more_vert,
                          color: AppColors.textGrey),
                      itemBuilder: (ctx) => [
                        const PopupMenuItem(
                          value: 'view',
                          child: Row(
                            children: [
                              Icon(Icons.open_in_new,
                                  size: 18, color: AppColors.textDark),
                              SizedBox(width: 10),
                              Text('View detail'),
                            ],
                          ),
                        ),
                        if (canAcceptOrReject) ...[
                          const PopupMenuItem(
                            value: 'accept',
                            child: Row(
                              children: [
                                Icon(Icons.check_circle_outline,
                                    size: 18, color: AppColors.statusActive),
                                SizedBox(width: 10),
                                Text('Mark Service Paid'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'reject',
                            child: Row(
                              children: [
                                Icon(Icons.close,
                                    size: 18, color: AppColors.statusRejected),
                                SizedBox(width: 10),
                                Text('Reject'),
                              ],
                            ),
                          ),
                        ],
                        if (canDeliver)
                          const PopupMenuItem(
                            value: 'deliver',
                            child: Row(
                              children: [
                                Icon(Icons.local_shipping_outlined,
                                    size: 18, color: AppColors.statusActive),
                                SizedBox(width: 10),
                                Text('Mark Delivered'),
                              ],
                            ),
                          ),
                      ],
                    ),
            ],
          ),
        ],
      ),
    );
  }
}
