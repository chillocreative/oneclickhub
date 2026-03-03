import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  Map<String, dynamic>? _service;
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
        setState(() {
          _service = response.data['data']['service'];
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
