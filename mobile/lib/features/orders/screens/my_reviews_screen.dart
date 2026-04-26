import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/datetime_format.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../models/review.dart';

class MyReviewsScreen extends ConsumerStatefulWidget {
  const MyReviewsScreen({super.key});

  @override
  ConsumerState<MyReviewsScreen> createState() => _MyReviewsScreenState();
}

class _MyReviewsScreenState extends ConsumerState<MyReviewsScreen> {
  final ScrollController _scroll = ScrollController();
  final List<Review> _reviews = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  int _page = 1;
  int _lastPage = 1;
  String? _error;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    _load(refresh: true);
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scroll.position.pixels >= _scroll.position.maxScrollExtent - 200) {
      if (_page < _lastPage && !_isLoadingMore) {
        _load();
      }
    }
  }

  Future<void> _load({bool refresh = false}) async {
    if (refresh) {
      setState(() {
        _isLoading = true;
        _error = null;
        _page = 1;
      });
    } else {
      setState(() => _isLoadingMore = true);
    }

    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('/my-reviews', queryParameters: {
        'page': refresh ? 1 : _page + 1,
        'per_page': 15,
      });
      if (res.data['success'] == true) {
        final list = (res.data['data'] as List? ?? [])
            .map((e) => Review.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
        final meta = res.data['meta'];
        setState(() {
          if (refresh) {
            _reviews
              ..clear()
              ..addAll(list);
          } else {
            _reviews.addAll(list);
          }
          _page = meta?['current_page'] ?? 1;
          _lastPage = meta?['last_page'] ?? 1;
          _isLoading = false;
          _isLoadingMore = false;
        });
      }
    } on DioException catch (e) {
      setState(() {
        _isLoading = false;
        _isLoadingMore = false;
        _error = e.response?.data?['message'] ?? 'Failed to load reviews';
      });
    }
  }

  Future<void> _replyTo(Review review) async {
    final controller = TextEditingController(text: review.freelancerResponse ?? '');
    final saved = await showModalBottomSheet<String?>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
          16, 12, 16, 16 + MediaQuery.of(ctx).viewInsets.bottom,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Text(
              review.hasReply ? 'Edit your reply' : 'Reply to this review',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textDark,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              maxLines: 5,
              maxLength: 2000,
              decoration: InputDecoration(
                hintText: 'Thanks for the feedback…',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 8),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: () => Navigator.pop(ctx, controller.text.trim()),
              child: const Text('Save reply'),
            ),
          ],
        ),
      ),
    );

    if (saved == null || saved.isEmpty) return;

    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post(
        '/reviews/${review.id}/respond',
        data: {'body': saved},
      );
      if (res.data['success'] == true && mounted) {
        final updated = Review.fromJson(
            Map<String, dynamic>.from(res.data['data'] as Map));
        setState(() {
          final idx = _reviews.indexWhere((r) => r.id == review.id);
          if (idx >= 0) _reviews[idx] = updated;
        });
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Could not save reply'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    }
  }

  Future<void> _removeReply(Review review) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove reply?'),
        content: const Text('Your reply will be removed from this review.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: AppColors.statusRejected),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
    if (ok != true) return;

    try {
      final dio = ref.read(dioProvider);
      final res = await dio.delete('/reviews/${review.id}/respond');
      if (res.data['success'] == true && mounted) {
        final updated = Review.fromJson(
            Map<String, dynamic>.from(res.data['data'] as Map));
        setState(() {
          final idx = _reviews.indexWhere((r) => r.id == review.id);
          if (idx >= 0) _reviews[idx] = updated;
        });
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Could not remove reply'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
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
                text: 'Reviews',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
        iconTheme: const IconThemeData(color: AppColors.textDark),
      ),
      body: _isLoading
          ? const ShimmerLoading(type: ShimmerType.list)
          : _error != null
              ? Center(child: Text(_error!))
              : _reviews.isEmpty
                  ? const EmptyState(
                      icon: Icons.star_border,
                      title: 'No reviews yet',
                      description:
                          'When customers complete a booking and rate your service, their reviews appear here.',
                    )
                  : RefreshIndicator(
                      color: AppColors.primary,
                      onRefresh: () => _load(refresh: true),
                      child: ListView.builder(
                        controller: _scroll,
                        padding: const EdgeInsets.all(16),
                        physics: const AlwaysScrollableScrollPhysics(),
                        itemCount: _reviews.length + (_isLoadingMore ? 1 : 0),
                        itemBuilder: (context, i) {
                          if (i >= _reviews.length) {
                            return const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: Center(
                                child: CircularProgressIndicator(
                                  color: AppColors.primary,
                                  strokeWidth: 2,
                                ),
                              ),
                            );
                          }
                          final r = _reviews[i];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _MyReviewCard(
                              review: r,
                              onReply: () => _replyTo(r),
                              onRemoveReply: () => _removeReply(r),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}

class _MyReviewCard extends StatelessWidget {
  final Review review;
  final VoidCallback onReply;
  final VoidCallback onRemoveReply;

  const _MyReviewCard({
    required this.review,
    required this.onReply,
    required this.onRemoveReply,
  });

  @override
  Widget build(BuildContext context) {
    final customerName = review.customer?.name ?? 'Anonymous';
    final initial = customerName.isNotEmpty
        ? customerName[0].toUpperCase()
        : '?';

    return AppCard(
      onTap: () {
        final slug = review.service?.slug;
        if (slug != null && slug.isNotEmpty) {
          context.push('/services/$slug');
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (review.service != null) ...[
            Text(
              review.service!.title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
          ],
          Row(
            children: [
              Container(
                width: 32, height: 32,
                decoration: const BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  initial,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customerName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                        fontSize: 13,
                      ),
                    ),
                    Row(
                      children: List.generate(
                        5,
                        (i) => Icon(
                          i < review.rating ? Icons.star : Icons.star_border,
                          size: 14,
                          color: Colors.amber,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (review.createdAt != null)
                Text(
                  AppDateTime.formatBooking(review.createdAt!),
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
          if ((review.comment ?? '').isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              review.comment!,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textDark,
                height: 1.4,
              ),
            ),
          ],
          if (review.hasReply) ...[
            const SizedBox(height: 10),
            Container(
              margin: const EdgeInsets.only(left: 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(10),
                borderRadius: BorderRadius.circular(10),
                border: Border(
                  left: BorderSide(
                    color: AppColors.primary.withAlpha(80),
                    width: 3,
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your reply'
                    '${review.respondedAt != null ? ' · ${AppDateTime.formatBooking(review.respondedAt!)}' : ''}',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    review.freelancerResponse!,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textDark,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (review.hasReply) ...[
                TextButton.icon(
                  onPressed: onRemoveReply,
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.statusRejected,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                  icon: const Icon(Icons.delete_outline, size: 16),
                  label: const Text('Delete'),
                ),
                const SizedBox(width: 4),
                TextButton.icon(
                  onPressed: onReply,
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                  icon: const Icon(Icons.edit, size: 16),
                  label: const Text('Edit reply'),
                ),
              ] else
                TextButton.icon(
                  onPressed: onReply,
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                  ),
                  icon: const Icon(Icons.reply, size: 16),
                  label: const Text('Reply'),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
