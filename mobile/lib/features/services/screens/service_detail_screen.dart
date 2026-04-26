import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../../auth/providers/auth_provider.dart';
import 'create_service_screen.dart';

class ServiceDetailScreen extends ConsumerStatefulWidget {
  final String slug;

  const ServiceDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<ServiceDetailScreen> createState() =>
      _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends ConsumerState<ServiceDetailScreen> {
  bool _isLoading = true;
  bool _isStartingChat = false;
  Map<String, dynamic>? _service;
  List<String> _availableDates = [];
  List<String> _bookedDates = [];
  String? _error;
  int _currentImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadService();
  }

  Future<void> _loadService() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dio = ref.read(dioProvider);
      final response =
          await dio.get('${ApiConstants.services}/${widget.slug}');
      if (response.data['success'] == true) {
        final data = response.data['data'];
        setState(() {
          _service = data['service'];
          _availableDates = (data['available_dates'] as List? ?? [])
              .map((d) => d.toString())
              .toList();
          _bookedDates = (data['booked_dates'] as List? ?? [])
              .map((d) => d.toString())
              .toList();
          _isLoading = false;
        });
      }
    } on DioException catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.response?.data?['message'] ?? 'Failed to load service';
      });
    }
  }

  bool get _isOwner {
    final userId = ref.read(authProvider).user?.id;
    return userId != null && _service?['user_id'] == userId;
  }

  Future<void> _startChatWithFreelancer() async {
    final freelancerId = _service?['user_id'];
    final serviceId = _service?['id'];
    if (freelancerId == null || _isStartingChat) return;

    setState(() => _isStartingChat = true);
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post(
        ApiConstants.chatStart,
        data: {
          'user_id': freelancerId,
          if (serviceId != null) 'service_id': serviceId,
        },
      );
      if (res.data['success'] == true && mounted) {
        final conversationId = res.data['data']['id'];
        context.push('/chat/$conversationId');
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Could not start chat'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isStartingChat = false);
    }
  }

  void _showAvailabilityCalendar() {
    final alwaysAvailable = _service?['always_available'] == true;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => _AvailabilityCalendarSheet(
        service: _service!,
        availableDates: _availableDates,
        bookedDates: _bookedDates,
        alwaysAvailable: alwaysAvailable,
        onDateConfirmed: _onDateConfirmed,
      ),
    );
  }

  Future<void> _onDateConfirmed(DateTime date) async {
    final serviceId = _service?['id'];
    final priceFrom = _service?['price_from'];
    if (serviceId == null) return;

    final dateStr = DateFormat('yyyy-MM-dd').format(date);
    final agreedPrice = (priceFrom is num) ? priceFrom.toDouble() : 0.0;

    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post(
        ApiConstants.orders,
        data: {
          'service_id': serviceId,
          'booking_date': dateStr,
          'agreed_price': agreedPrice,
        },
      );
      if (res.data['success'] != true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.data['message']?.toString()
                  ?? 'Could not create booking'),
              backgroundColor: AppColors.statusRejected,
            ),
          );
        }
        return;
      }

      // The new booking response wraps the order under `data` and adds a
      // sibling `conversation_id`. Older builds returned the order directly,
      // so fall back to scanning either shape before giving up.
      final data = res.data['data'];
      final conversationId = _extractConversationId(data);

      if (!mounted) return;

      if (conversationId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Booking saved but the chat could not be opened. '
              'Tap Chat from the freelancer card to continue.',
            ),
            backgroundColor: AppColors.statusPendingApproval,
          ),
        );
        // Refresh availability so the booked date is now disabled.
        _loadService();
        return;
      }

      // Push to chat first; the date list will be refreshed in the
      // background so the user never gets stuck waiting for the
      // service detail to reload before navigating.
      context.push('/chat/$conversationId');
      _loadService();
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Could not create booking'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    }
  }

  int? _extractConversationId(dynamic data) {
    if (data is! Map) return null;
    final direct = data['conversation_id'];
    if (direct is int) return direct;
    if (direct is String) return int.tryParse(direct);
    final nestedConv = data['conversation'];
    if (nestedConv is Map && nestedConv['id'] is int) {
      return nestedConv['id'] as int;
    }
    return null;
  }

  Future<void> _editService() async {
    if (_service == null) return;
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => CreateServiceScreen(existingService: _service),
      ),
    );
    if (result == true) {
      _loadService();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
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
                      GradientButton(
                        text: 'Retry',
                        onPressed: _loadService,
                      ),
                    ],
                  ),
                )
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final s = _service!;
    final images = (s['images'] as List?) ?? [];
    final title = s['title']?.toString() ?? '';
    final desc = s['description']?.toString() ?? '';
    final priceFrom = s['price_from']?.toString() ?? '0';
    final priceTo = s['price_to']?.toString();
    final deliveryDays = s['delivery_days'];
    final category = s['category'];
    final user = s['user'];
    final tags = (s['tags'] as List?) ?? [];
    final reviewsCount = s['reviews_count'] ?? 0;
    final avgRating = s['reviews_avg_rating'];

    return CustomScrollView(
      slivers: [
        // Image carousel
        SliverAppBar(
          expandedHeight: 280,
          pinned: true,
          backgroundColor: Colors.white,
          leading: IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.black.withAlpha(40),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
            ),
            onPressed: () => Navigator.pop(context, _isOwner),
          ),
          actions: [
            if (_isOwner)
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black.withAlpha(40),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.edit, color: Colors.white, size: 20),
                ),
                onPressed: _editService,
              ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: images.isNotEmpty
                ? Stack(
                    children: [
                      PageView.builder(
                        itemCount: images.length,
                        onPageChanged: (i) =>
                            setState(() => _currentImageIndex = i),
                        itemBuilder: (_, i) => CachedNetworkImage(
                          imageUrl: images[i].toString(),
                          fit: BoxFit.cover,
                          width: double.infinity,
                          errorWidget: (_, __, ___) => Container(
                            color: AppColors.primary.withAlpha(10),
                            child: const Icon(Icons.work,
                                color: AppColors.primary, size: 48),
                          ),
                        ),
                      ),
                      if (images.length > 1)
                        Positioned(
                          bottom: 16,
                          left: 0,
                          right: 0,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(
                              images.length,
                              (i) => Container(
                                width: i == _currentImageIndex ? 24 : 8,
                                height: 8,
                                margin: const EdgeInsets.symmetric(horizontal: 3),
                                decoration: BoxDecoration(
                                  color: i == _currentImageIndex
                                      ? Colors.white
                                      : Colors.white.withAlpha(100),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  )
                : Container(
                    color: AppColors.primary.withAlpha(10),
                    child: const Center(
                      child:
                          Icon(Icons.work, color: AppColors.primary, size: 64),
                    ),
                  ),
          ),
        ),

        // Content
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category badge
                if (category != null)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      category['name']?.toString() ?? '',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                const SizedBox(height: 12),

                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 12),

                // Price + delivery
                AppCard(
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Price',
                                style: TextStyle(
                                    fontSize: 12, color: AppColors.textGrey)),
                            const SizedBox(height: 4),
                            Text(
                              priceTo != null && priceTo != priceFrom
                                  ? 'RM $priceFrom - RM $priceTo'
                                  : 'RM $priceFrom',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (deliveryDays != null) ...[
                        Container(
                          width: 1,
                          height: 40,
                          color: Colors.grey.shade200,
                        ),
                        const SizedBox(width: 16),
                        Column(
                          children: [
                            const Icon(Icons.schedule,
                                color: AppColors.textGrey, size: 20),
                            const SizedBox(height: 4),
                            Text(
                              '$deliveryDays days',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textDark,
                              ),
                            ),
                          ],
                        ),
                      ],
                      if (reviewsCount > 0) ...[
                        const SizedBox(width: 16),
                        Container(
                          width: 1,
                          height: 40,
                          color: Colors.grey.shade200,
                        ),
                        const SizedBox(width: 16),
                        Column(
                          children: [
                            const Icon(Icons.star,
                                color: Colors.amber, size: 20),
                            const SizedBox(height: 4),
                            Text(
                              '${avgRating ?? 0} ($reviewsCount)',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textDark,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Provider info
                if (user != null)
                  AppCard(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.primary.withAlpha(20),
                          child: Text(
                            (user['name']?.toString() ?? 'U')
                                .substring(0, 1)
                                .toUpperCase(),
                            style: const TextStyle(
                              color: AppColors.primary,
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
                                user['name']?.toString() ?? '',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                  color: AppColors.textDark,
                                ),
                              ),
                              if (user['position'] != null)
                                Text(
                                  user['position'].toString(),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textGrey,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 12),

                // Description
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Description',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textDark,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        desc,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textGrey,
                          height: 1.6,
                        ),
                      ),
                    ],
                  ),
                ),

                // Tags
                if (tags.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: tags
                        .map((tag) => Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(100),
                              ),
                              child: Text(
                                tag.toString(),
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textGrey,
                                ),
                              ),
                            ))
                        .toList(),
                  ),
                ],

                // Customer actions: chat + book a date
                if (!_isOwner && _service?['user_id'] != null) ...[
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _showAvailabilityCalendar,
                          icon: const Icon(Icons.calendar_today, size: 18),
                          label: const Text('Book a Date'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            side: const BorderSide(color: AppColors.primary),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            textStyle: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GradientButton(
                          text: 'Chat',
                          icon: Icons.chat_bubble_outline,
                          isLoading: _isStartingChat,
                          onPressed: _startChatWithFreelancer,
                        ),
                      ),
                    ],
                  ),
                ],

                // Edit button for owner
                if (_isOwner) ...[
                  const SizedBox(height: 24),
                  GradientButton(
                    text: 'Edit Service',
                    icon: Icons.edit,
                    width: double.infinity,
                    onPressed: _editService,
                  ),
                ],

                SizedBox(height: 48 + MediaQuery.of(context).padding.bottom),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AvailabilityCalendarSheet extends StatefulWidget {
  final Map<String, dynamic> service;
  final List<String> availableDates;
  final List<String> bookedDates;
  final bool alwaysAvailable;
  final Future<void> Function(DateTime date) onDateConfirmed;

  const _AvailabilityCalendarSheet({
    required this.service,
    required this.availableDates,
    required this.bookedDates,
    required this.alwaysAvailable,
    required this.onDateConfirmed,
  });

  @override
  State<_AvailabilityCalendarSheet> createState() =>
      _AvailabilityCalendarSheetState();
}

class _AvailabilityCalendarSheetState
    extends State<_AvailabilityCalendarSheet> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  static final _df = DateFormat('yyyy-MM-dd');

  Set<String> get _availableSet => widget.availableDates.toSet();
  Set<String> get _bookedSet => widget.bookedDates.toSet();

  bool _isAvailable(DateTime day) {
    if (widget.alwaysAvailable) return !_isBooked(day) && !_isPast(day);
    return _availableSet.contains(_df.format(day));
  }

  bool _isBooked(DateTime day) => _bookedSet.contains(_df.format(day));

  bool _isPast(DateTime day) {
    final today = DateTime.now();
    return day.isBefore(DateTime(today.year, today.month, today.day));
  }

  Future<void> _openConfirmDialog(DateTime day) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => _BookingConfirmDialog(
        service: widget.service,
        date: day,
      ),
    );
    if (confirmed == true && mounted) {
      Navigator.of(context).pop(); // close calendar sheet
      await widget.onDateConfirmed(day);
    }
  }

  @override
  Widget build(BuildContext context) {
    final priceFrom = widget.service['price_from']?.toString() ?? '0';
    final priceTo = widget.service['price_to']?.toString();
    final priceLabel = priceTo != null && priceTo != priceFrom
        ? 'RM $priceFrom - RM $priceTo'
        : 'RM $priceFrom';

    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 12,
          bottom: 16 + MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Row(
              children: [
                const Icon(Icons.calendar_today,
                    color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Pick a Date',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                ),
                Text(
                  priceLabel,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TableCalendar(
              firstDay: DateTime.now(),
              lastDay: DateTime.now().add(const Duration(days: 365)),
              focusedDay: _focusedDay,
              selectedDayPredicate: (d) => isSameDay(_selectedDay, d),
              onDaySelected: (selected, focused) {
                if (_isPast(selected) || _isBooked(selected)) return;
                if (!widget.alwaysAvailable && !_isAvailable(selected)) return;
                setState(() {
                  _selectedDay = selected;
                  _focusedDay = focused;
                });
                _openConfirmDialog(selected);
              },
              onPageChanged: (focused) => _focusedDay = focused,
              calendarStyle: const CalendarStyle(
                outsideDaysVisible: false,
              ),
              headerStyle: const HeaderStyle(
                formatButtonVisible: false,
                titleCentered: true,
                titleTextStyle: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textDark,
                ),
                leftChevronIcon:
                    Icon(Icons.chevron_left, color: AppColors.primary),
                rightChevronIcon:
                    Icon(Icons.chevron_right, color: AppColors.primary),
              ),
              calendarBuilders: CalendarBuilders(
                defaultBuilder: (_, day, __) => _dayCell(day),
                todayBuilder: (_, day, __) => _dayCell(day, isToday: true),
                selectedBuilder: (_, day, __) =>
                    _dayCell(day, isSelected: true),
                disabledBuilder: (_, day, __) => _dayCell(day, isDisabled: true),
              ),
            ),
            const SizedBox(height: 12),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _LegendDot(color: AppColors.statusActive, label: 'Available'),
                _LegendDot(
                    color: AppColors.statusPendingApproval, label: 'Booked'),
                _LegendDot(color: Colors.grey, label: 'Unavailable'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _dayCell(DateTime day,
      {bool isToday = false, bool isSelected = false, bool isDisabled = false}) {
    final past = _isPast(day);
    final booked = _isBooked(day);
    final available = _isAvailable(day);

    Color? bgColor;
    Color textColor = AppColors.textDark;
    bool isInteractive = !past && !booked && available;

    if (isSelected) {
      bgColor = AppColors.primary;
      textColor = Colors.white;
    } else if (booked) {
      bgColor = AppColors.statusPendingApproval.withAlpha(40);
      textColor = AppColors.statusPendingApproval;
    } else if (available && !past) {
      bgColor = AppColors.statusActive.withAlpha(30);
      textColor = AppColors.statusActive;
    } else if (past || isDisabled) {
      textColor = Colors.grey.shade400;
    }

    return Opacity(
      opacity: isInteractive || isSelected ? 1 : 0.7,
      child: Container(
        margin: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: bgColor,
          shape: BoxShape.circle,
          border: isToday && !isSelected
              ? Border.all(color: AppColors.primary, width: 1.5)
              : null,
        ),
        child: Center(
          child: Text(
            '${day.day}',
            style: TextStyle(
              color: textColor,
              fontWeight: (isSelected || available || booked)
                  ? FontWeight.w700
                  : FontWeight.w400,
            ),
          ),
        ),
      ),
    );
  }
}

class _BookingConfirmDialog extends StatelessWidget {
  final Map<String, dynamic> service;
  final DateTime date;

  const _BookingConfirmDialog({
    required this.service,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    final title = service['title']?.toString() ?? '';
    final priceFrom = service['price_from']?.toString() ?? '0';
    final priceTo = service['price_to']?.toString();
    final priceLabel = priceTo != null && priceTo != priceFrom
        ? 'RM $priceFrom - RM $priceTo'
        : 'RM $priceFrom';
    final providerName = service['user']?['name']?.toString();
    final dateLabel = DateFormat('EEEE, MMM d, yyyy').format(date);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text(
        'Confirm booking',
        style: TextStyle(fontWeight: FontWeight.w800),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _DetailRow(label: 'Service', value: title),
          if (providerName != null && providerName.isNotEmpty)
            _DetailRow(label: 'Freelancer', value: providerName),
          _DetailRow(label: 'Date', value: dateLabel),
          _DetailRow(label: 'Price', value: priceLabel, highlight: true),
          const SizedBox(height: 8),
          const Text(
            'Confirming opens a private chat with the freelancer to '
            'arrange details. The chat stays open until the freelancer '
            'marks the job complete.',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textGrey,
              height: 1.4,
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('No'),
        ),
        FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          onPressed: () => Navigator.pop(context, true),
          child: const Text('Yes, confirm'),
        ),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;

  const _DetailRow({
    required this.label,
    required this.value,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textGrey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: highlight ? AppColors.primary : AppColors.textDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color.withAlpha(40),
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 1.5),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textGrey,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
