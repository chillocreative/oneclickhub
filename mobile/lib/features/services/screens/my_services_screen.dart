import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../../../core/widgets/status_badge.dart';
import '../providers/my_services_provider.dart';

class MyServicesScreen extends ConsumerStatefulWidget {
  const MyServicesScreen({super.key});

  @override
  ConsumerState<MyServicesScreen> createState() => _MyServicesScreenState();
}

class _MyServicesScreenState extends ConsumerState<MyServicesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(myServicesProvider.notifier).loadMyServices();
    });
  }

  Future<void> _deleteService(int serviceId, String title) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Service'),
        content: Text('Are you sure you want to delete "$title"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.statusRejected),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success =
          await ref.read(myServicesProvider.notifier).deleteService(serviceId);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Service deleted'),
            backgroundColor: AppColors.statusActive,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(myServicesProvider);

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
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
            onPressed: () async {
              final result = await context.push('/my-services/create');
              if (result == true) {
                ref.read(myServicesProvider.notifier).loadMyServices();
              }
            },
          ),
        ],
      ),
      body: state.isLoading
          ? const ShimmerLoading(type: ShimmerType.list)
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () =>
                  ref.read(myServicesProvider.notifier).loadMyServices(),
              child: state.services.isEmpty
                  ? ListView(
                      children: [
                        EmptyState(
                          icon: Icons.work_outline,
                          title: 'No Services Yet',
                          description:
                              'Create your first service to start getting orders.',
                          actionLabel: 'Create Service',
                          onAction: () async {
                            final result =
                                await context.push('/my-services/create');
                            if (result == true) {
                              ref
                                  .read(myServicesProvider.notifier)
                                  .loadMyServices();
                            }
                          },
                        ),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      physics: const AlwaysScrollableScrollPhysics(),
                      itemCount: state.services.length,
                      itemBuilder: (context, index) {
                        final service = state.services[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _MyServiceCard(
                            service: service,
                            onTap: () async {
                              final result = await context
                                  .push('/services/${service.slug}');
                              if (result == true) {
                                ref
                                    .read(myServicesProvider.notifier)
                                    .loadMyServices();
                              }
                            },
                            onDelete: () =>
                                _deleteService(service.id, service.title),
                          ),
                        );
                      },
                    ),
            ),
      floatingActionButton: state.services.isNotEmpty
          ? FloatingActionButton(
              backgroundColor: AppColors.primary,
              onPressed: () async {
                final result = await context.push('/my-services/create');
                if (result == true) {
                  ref.read(myServicesProvider.notifier).loadMyServices();
                }
              },
              child: const Icon(Icons.add, color: Colors.white),
            )
          : null,
    );
  }
}

class _MyServiceCard extends StatelessWidget {
  final dynamic service;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _MyServiceCard({
    required this.service,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: EdgeInsets.zero,
      onTap: onTap,
      child: Row(
        children: [
          ClipRRect(
            borderRadius:
                const BorderRadius.horizontal(left: Radius.circular(32)),
            child: SizedBox(
              width: 100,
              height: 100,
              child: service.firstImage.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: service.firstImage,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: AppColors.primary.withAlpha(10),
                        child: const Icon(Icons.work,
                            color: AppColors.primary, size: 28),
                      ),
                    )
                  : Container(
                      color: AppColors.primary.withAlpha(10),
                      child: const Icon(Icons.work,
                          color: AppColors.primary, size: 28),
                    ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          service.title,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: AppColors.textDark,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      StatusBadge(
                          status: service.isActive ? 'active' : 'inactive'),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (service.category != null)
                    Text(
                      service.category!.name,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textGrey,
                      ),
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        service.priceDisplay,
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                          color: AppColors.primary,
                        ),
                      ),
                      const Spacer(),
                      InkWell(
                        onTap: onDelete,
                        borderRadius: BorderRadius.circular(8),
                        child: const Padding(
                          padding: EdgeInsets.all(4),
                          child: Icon(Icons.delete_outline,
                              color: AppColors.statusRejected, size: 20),
                        ),
                      ),
                    ],
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
