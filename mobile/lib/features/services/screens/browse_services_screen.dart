import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../providers/services_provider.dart';

class BrowseServicesScreen extends ConsumerStatefulWidget {
  const BrowseServicesScreen({super.key});

  @override
  ConsumerState<BrowseServicesScreen> createState() =>
      _BrowseServicesScreenState();
}

class _BrowseServicesScreenState extends ConsumerState<BrowseServicesScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(servicesProvider.notifier).loadCategories();
      ref.read(servicesProvider.notifier).loadServices(refresh: true);
    });
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(servicesProvider.notifier).loadMore();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(servicesProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'Browse ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Services',
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
          ref.read(servicesProvider.notifier).loadServices(refresh: true);
        },
        child: Column(
          children: [
            // Category filter chips
            _buildCategoryChips(state),

            // Services grid
            Expanded(
              child: state.isLoading
                  ? const ShimmerLoading(type: ShimmerType.grid)
                  : state.services.isEmpty
                      ? ListView(
                          children: const [
                            EmptyState(
                              icon: Icons.work_outline,
                              title: 'No Services Found',
                              description:
                                  'Try changing your filters or check back later',
                            ),
                          ],
                        )
                      : GridView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          physics: const AlwaysScrollableScrollPhysics(),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.62,
                          ),
                          itemCount: state.services.length +
                              (state.isLoadingMore ? 2 : 0),
                          itemBuilder: (context, index) {
                            if (index >= state.services.length) {
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
                            final service = state.services[index];
                            return _ServiceCard(service: service);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryChips(ServicesState state) {
    return SizedBox(
      height: 52,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          _FilterChip(
            label: 'All',
            isSelected: state.selectedCategoryId == null,
            onTap: () => ref.read(servicesProvider.notifier).setCategory(null),
          ),
          ...state.categories.map((cat) => _FilterChip(
                label: cat.name,
                isSelected: state.selectedCategoryId == cat.id,
                onTap: () =>
                    ref.read(servicesProvider.notifier).setCategory(cat.id),
              )),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textGrey,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final dynamic service;

  const _ServiceCard({required this.service});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: EdgeInsets.zero,
      onTap: () {
        if (service.slug.isNotEmpty) {
          context.push('/services/${service.slug}');
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image area
          ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(32)),
            child: SizedBox(
              height: 120,
              width: double.infinity,
              child: service.firstImage.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: service.firstImage,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        color: Colors.grey.shade100,
                        child: const Icon(Icons.image,
                            color: Colors.grey, size: 32),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        color: Colors.grey.shade100,
                        child: const Icon(Icons.work,
                            color: AppColors.primary, size: 32),
                      ),
                    )
                  : Container(
                      color: AppColors.primary.withAlpha(10),
                      child: const Icon(Icons.work,
                          color: AppColors.primary, size: 32),
                    ),
            ),
          ),

          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category label
                  if (service.category != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        service.category!.name,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  const SizedBox(height: 4),

                  // Title
                  Text(
                    service.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: AppColors.textDark,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const Spacer(),

                  // User
                  if (service.user != null)
                    Text(
                      service.user!.name,
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textGrey,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 4),

                  // Star + count (only when service has reviews)
                  if (service.reviewsCount > 0 &&
                      service.reviewsAvgRating != null) ...[
                    Row(
                      children: [
                        const Icon(Icons.star,
                            size: 12, color: Colors.amber),
                        const SizedBox(width: 2),
                        Text(
                          '${service.reviewsAvgRating!.toStringAsFixed(1)} · ${service.reviewsCount}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textGrey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                  ],
                  // Price (full width, single line, scaled to fit)
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      service.priceDisplay,
                      maxLines: 1,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  if (service.deliveryDays != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.schedule,
                            size: 12, color: AppColors.textLight),
                        const SizedBox(width: 4),
                        Text(
                          '${service.deliveryDays} days',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textLight,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
