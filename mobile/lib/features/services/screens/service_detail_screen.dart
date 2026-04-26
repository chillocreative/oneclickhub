import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
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
    if (freelancerId == null || _isStartingChat) return;

    setState(() => _isStartingChat = true);
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post(
        ApiConstants.chatStart,
        data: {'user_id': freelancerId},
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

  void _showAvailabilitySheet() {
    final alwaysAvailable = _service?['always_available'] == true;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
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
                  const Text(
                    'Freelancer Availability',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              if (alwaysAvailable)
                _availabilityBanner(
                  icon: Icons.check_circle,
                  color: AppColors.statusActive,
                  title: 'Always Available',
                  subtitle:
                      'This freelancer accepts bookings on any date.',
                )
              else if (_availableDates.isEmpty)
                _availabilityBanner(
                  icon: Icons.event_busy,
                  color: Colors.grey,
                  title: 'No availability set',
                  subtitle:
                      'The freelancer has not published any open dates yet. '
                      'Tap "Chat with Freelancer" to ask.',
                )
              else
                _AvailableDatesGrid(dates: _availableDates),
            ],
          ),
        ),
      ),
    );
  }

  Widget _availabilityBanner({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textDark,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textGrey,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
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

                // Customer actions: chat + check availability
                if (!_isOwner && _service?['user_id'] != null) ...[
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _showAvailabilitySheet,
                          icon: const Icon(Icons.calendar_today, size: 18),
                          label: const Text('Check Availability'),
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
                          text: 'Chat with Freelancer',
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

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AvailableDatesGrid extends StatelessWidget {
  final List<String> dates;

  const _AvailableDatesGrid({required this.dates});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('EEE, MMM d');
    final parsed = dates
        .map((d) => DateTime.tryParse(d))
        .whereType<DateTime>()
        .toList()
      ..sort();

    return ConstrainedBox(
      constraints: const BoxConstraints(maxHeight: 320),
      child: SingleChildScrollView(
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: parsed.map((date) {
            return Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.primary.withAlpha(60),
                ),
              ),
              child: Text(
                fmt.format(date),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
