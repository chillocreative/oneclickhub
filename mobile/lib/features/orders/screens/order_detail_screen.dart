import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/datetime_format.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/order.dart';
import '../providers/orders_provider.dart';

class OrderDetailScreen extends ConsumerStatefulWidget {
  final int orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  Order? _order;
  int? _conversationId;
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('${ApiConstants.orders}/${widget.orderId}');
      if (res.data['success'] == true) {
        final data = res.data['data'];
        // Backwards-compat: older builds returned the order directly under data.
        final orderJson = data is Map && data['order'] is Map
            ? data['order'] as Map<String, dynamic>
            : (data as Map<String, dynamic>);
        final convId = data is Map ? data['conversation_id'] : null;
        setState(() {
          _order = Order.fromJson(orderJson);
          _conversationId = convId is int ? convId : null;
          _isLoading = false;
        });
      }
    } on DioException catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.response?.data?['message'] ?? 'Failed to load order';
      });
    }
  }

  bool get _isFreelancer {
    final myId = ref.read(authProvider).user?.id;
    return myId != null && _order?.freelancer?.id == myId;
  }

  bool get _isCustomer {
    final myId = ref.read(authProvider).user?.id;
    return myId != null && _order?.customer?.id == myId;
  }

  Future<void> _post(
    String suffix, {
    Map<String, dynamic>? data,
    String? successMessage,
  }) async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post(
        '${ApiConstants.orders}/${widget.orderId}/$suffix',
        data: data,
      );
      if (res.data['success'] == true && mounted) {
        // Refresh both this screen and the lists behind it.
        ref.read(myOrdersProvider.notifier).loadOrders(refresh: true);
        ref.read(myBookingsProvider.notifier).loadOrders(refresh: true);
        await _load();
        if (mounted && successMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(successMessage),
              backgroundColor: AppColors.statusActive,
            ),
          );
        }
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
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _accept() async {
    final ok = await _confirm(
      title: 'Mark as Service Paid?',
      message:
          'Confirm you have received the bank transfer from the customer. '
          'Once marked, the booking moves to Service Paid and you can begin work.',
      confirmText: 'Mark Service Paid',
    );
    if (ok) {
      await _post('accept', successMessage: 'Booking marked as Service Paid.');
    }
  }

  Future<void> _reject() async {
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
      await _post(
        'reject',
        data: {'reason': reasonCtrl.text.trim()},
        successMessage: 'Booking rejected.',
      );
    }
  }

  Future<void> _deliver() async {
    final ok = await _confirm(
      title: 'Mark as delivered?',
      message:
          'Confirm the service has been delivered. The customer will be '
          'asked to confirm completion and leave a review.',
      confirmText: 'Mark Delivered',
    );
    if (ok) {
      await _post('deliver', successMessage: 'Booking marked as Delivered.');
    }
  }

  Future<void> _complete() async {
    final ratingNotifier = ValueNotifier<int>(5);
    final commentCtrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm completion'),
        content: ValueListenableBuilder<int>(
          valueListenable: ratingNotifier,
          builder: (_, rating, __) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('How was the service?'),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) {
                  final starIndex = i + 1;
                  return IconButton(
                    onPressed: () => ratingNotifier.value = starIndex,
                    icon: Icon(
                      starIndex <= rating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                      size: 28,
                    ),
                  );
                }),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: commentCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Comment (optional)',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
    if (ok == true) {
      await _post(
        'complete',
        data: {
          'rating': ratingNotifier.value,
          'comment': commentCtrl.text.trim(),
        },
        successMessage: 'Thanks! Booking marked as Completed.',
      );
    }
  }

  Future<bool> _confirm({
    required String title,
    required String message,
    required String confirmText,
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(confirmText),
          ),
        ],
      ),
    );
    return result == true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Booking Detail',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.textDark,
          ),
        ),
        iconTheme: const IconThemeData(color: AppColors.textDark),
      ),
      body: _isLoading
          ? const ShimmerLoading(type: ShimmerType.profile)
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!,
                          style: const TextStyle(color: AppColors.textGrey)),
                      const SizedBox(height: 12),
                      GradientButton(text: 'Retry', onPressed: _load),
                    ],
                  ),
                )
              : _buildBody(),
    );
  }

  Widget _buildBody() {
    final order = _order!;
    final bottomInset = MediaQuery.of(context).padding.bottom;
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _load,
      child: ListView(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 32 + bottomInset),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          _buildHeaderCard(order),
          const SizedBox(height: 12),
          _buildStatusTimeline(order),
          const SizedBox(height: 12),
          _buildPartiesCard(order),
          if (_isCustomer && order.status == 'pending_payment') ...[
            const SizedBox(height: 12),
            _buildPaymentInstructions(order),
          ],
          if ((order.customerNotes ?? '').isNotEmpty) ...[
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Customer notes',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    order.customerNotes!,
                    style: const TextStyle(color: AppColors.textGrey, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          if (_conversationId != null)
            OutlinedButton.icon(
              onPressed: () => context.push('/chat/$_conversationId'),
              icon: const Icon(Icons.chat_bubble_outline),
              label: const Text('Open booking chat'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          const SizedBox(height: 12),
          ..._actionButtons(order),
        ],
      ),
    );
  }

  Widget _buildHeaderCard(Order order) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '#${order.orderNumber}',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                    color: AppColors.textDark,
                  ),
                ),
              ),
              _StatusChip(status: order.status, label: order.displayLabel),
            ],
          ),
          if (order.service != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: SizedBox(
                    width: 56,
                    height: 56,
                    child: order.service!.firstImage != null
                        ? CachedNetworkImage(
                            imageUrl: order.service!.firstImage!,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => Container(
                              color: AppColors.primary.withAlpha(20),
                              child: const Icon(Icons.work,
                                  color: AppColors.primary),
                            ),
                          )
                        : Container(
                            color: AppColors.primary.withAlpha(20),
                            child: const Icon(Icons.work,
                                color: AppColors.primary),
                          ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.service!.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        order.priceDisplay,
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.event,
                  color: AppColors.textGrey, size: 16),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  AppDateTime.formatBooking(order.bookingDate),
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTimeline(Order order) {
    final steps = <_TimelineStep>[
      _TimelineStep(
        title: 'Booking Confirmed',
        description: 'Customer confirmed the booking date.',
        reached: true,
      ),
      _TimelineStep(
        title: 'Service Paid',
        description: 'Freelancer confirmed bank transfer received.',
        reached: ['active', 'delivered', 'completed'].contains(order.status),
      ),
      _TimelineStep(
        title: 'Delivered',
        description: 'Freelancer marked the job as delivered.',
        reached: ['delivered', 'completed'].contains(order.status),
      ),
      _TimelineStep(
        title: 'Completed',
        description: 'Customer confirmed completion and rated the service.',
        reached: order.status == 'completed',
      ),
    ];

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Status',
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 12),
          for (var i = 0; i < steps.length; i++)
            _TimelineRow(
              step: steps[i],
              isLast: i == steps.length - 1,
            ),
        ],
      ),
    );
  }

  Widget _buildPartiesCard(Order order) {
    return AppCard(
      child: Column(
        children: [
          if (order.customer != null)
            _personRow(
              role: 'Customer',
              name: order.customer!.name,
              phone: order.customer!.phoneNumber,
            ),
          if (order.customer != null && order.freelancer != null)
            const Divider(height: 24),
          if (order.freelancer != null)
            _personRow(
              role: 'Freelancer',
              name: order.freelancer!.name,
              phone: order.freelancer!.phoneNumber,
            ),
        ],
      ),
    );
  }

  Widget _personRow({
    required String role,
    required String name,
    String? phone,
  }) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Text(
            name.isNotEmpty ? name[0].toUpperCase() : '?',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                role,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textGrey,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                name,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
              ),
              if (phone != null && phone.isNotEmpty)
                Text(
                  phone,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textGrey,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPaymentInstructions(Order order) {
    final banking = order.freelancer?.bankingDetail;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.account_balance,
                  color: AppColors.primary, size: 18),
              SizedBox(width: 8),
              Text(
                'Pay the freelancer',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Make a bank transfer of the amount above and share the receipt '
            'in the booking chat. The freelancer will mark the booking as '
            'Service Paid once it lands.',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textGrey,
              height: 1.4,
            ),
          ),
          if (banking != null && banking.hasDetails) ...[
            const SizedBox(height: 12),
            _bankRow('Bank', banking.bankName ?? '—'),
            _bankRow('Account No.', banking.accountNumber ?? '—', copyable: true),
            _bankRow('Account Name', banking.accountHolderName ?? '—'),
          ] else ...[
            const SizedBox(height: 12),
            const Text(
              'The freelancer hasn\'t added banking details yet. Ask them in '
              'the booking chat.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.statusPendingApproval,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _bankRow(String label, String value, {bool copyable = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textGrey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
          ),
          if (copyable)
            IconButton(
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              icon: const Icon(Icons.copy,
                  size: 16, color: AppColors.primary),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: value));
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('$label copied')),
                );
              },
            ),
        ],
      ),
    );
  }

  List<Widget> _actionButtons(Order order) {
    final widgets = <Widget>[];

    if (_isFreelancer &&
        (order.status == 'pending_payment'
            || order.status == 'pending_approval')) {
      widgets.add(
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _isSubmitting ? null : _reject,
                icon: const Icon(Icons.close),
                label: const Text('Reject'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.statusRejected,
                  side: const BorderSide(color: AppColors.statusRejected),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GradientButton(
                text: 'Mark Service Paid',
                icon: Icons.check_circle,
                isLoading: _isSubmitting,
                onPressed: _accept,
              ),
            ),
          ],
        ),
      );
    } else if (_isFreelancer && order.status == 'active') {
      widgets.add(GradientButton(
        text: 'Mark Delivered',
        icon: Icons.local_shipping_outlined,
        isLoading: _isSubmitting,
        width: double.infinity,
        onPressed: _deliver,
      ));
    } else if (_isCustomer && order.status == 'delivered') {
      widgets.add(GradientButton(
        text: 'Confirm & Rate',
        icon: Icons.check_circle,
        isLoading: _isSubmitting,
        width: double.infinity,
        onPressed: _complete,
      ));
    }

    return widgets;
  }
}

class _TimelineStep {
  final String title;
  final String description;
  final bool reached;
  _TimelineStep({
    required this.title,
    required this.description,
    required this.reached,
  });
}

class _TimelineRow extends StatelessWidget {
  final _TimelineStep step;
  final bool isLast;

  const _TimelineRow({required this.step, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final color = step.reached ? AppColors.statusActive : Colors.grey.shade300;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  color: step.reached ? AppColors.statusActive : Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: color, width: 2),
                ),
                child: step.reached
                    ? const Icon(Icons.check, color: Colors.white, size: 12)
                    : null,
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: color,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    step.title,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: step.reached
                          ? AppColors.textDark
                          : AppColors.textGrey,
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    step.description,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textGrey,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  final String label;

  const _StatusChip({required this.status, required this.label});

  Color get _color => switch (status) {
        'pending_payment' || 'pending_approval' =>
          AppColors.statusPendingApproval,
        'active' => AppColors.primary,
        'delivered' => AppColors.statusActive,
        'completed' => AppColors.statusActive,
        'cancelled' || 'rejected' => AppColors.statusRejected,
        _ => AppColors.textGrey,
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withAlpha(25),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: _color,
        ),
      ),
    );
  }
}
