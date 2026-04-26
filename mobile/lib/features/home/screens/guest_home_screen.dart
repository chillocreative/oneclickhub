import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../notifications/providers/notifications_provider.dart';
import '../../services/models/service_category.dart';

class _AdvertisementModel {
  final int id;
  final String title;
  final String? description;
  final String? imageUrl;
  final String? link;

  _AdvertisementModel({
    required this.id,
    required this.title,
    this.description,
    this.imageUrl,
    this.link,
  });

  factory _AdvertisementModel.fromJson(Map<String, dynamic> json) {
    return _AdvertisementModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      imageUrl: json['image_url'],
      link: json['link'],
    );
  }
}

class GuestHomeScreen extends ConsumerStatefulWidget {
  const GuestHomeScreen({super.key});

  @override
  ConsumerState<GuestHomeScreen> createState() => _GuestHomeScreenState();
}

class _GuestHomeScreenState extends ConsumerState<GuestHomeScreen> {
  List<ServiceCategoryModel> _categories = [];
  List<_AdvertisementModel> _advertisements = [];
  bool _isLoading = true;

  final PageController _adPageController = PageController();
  Timer? _adTimer;
  int _currentAdPage = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _adTimer?.cancel();
    _adPageController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final dio = ref.read(dioProvider);

    try {
      final results = await Future.wait([
        dio.get(ApiConstants.categories),
        dio.get(ApiConstants.advertisements),
      ]);

      final categoriesRes = results[0];
      final adsRes = results[1];

      if (categoriesRes.data['success'] == true) {
        _categories = (categoriesRes.data['data'] as List)
            .map((e) => ServiceCategoryModel.fromJson(e))
            .toList();
      }

      if (adsRes.data['success'] == true) {
        _advertisements = (adsRes.data['data'] as List)
            .map((e) => _AdvertisementModel.fromJson(e))
            .toList();
      }

      _startAdAutoSlide();
    } on DioException catch (_) {
      // Silent fail for guest screen
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  void _startAdAutoSlide() {
    if (_advertisements.length <= 1) return;
    _adTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      _currentAdPage = (_currentAdPage + 1) % _advertisements.length;
      if (_adPageController.hasClients) {
        _adPageController.animateToPage(
          _currentAdPage,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      body: SafeArea(
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async {
                  setState(() => _isLoading = true);
                  _adTimer?.cancel();
                  await _loadData();
                },
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(),
                      const SizedBox(height: 20),
                      _buildSearchBar(),
                      const SizedBox(height: 24),
                      _buildCategoriesSection(),
                      const SizedBox(height: 24),
                      _buildAdvertisementSlider(),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withAlpha(30),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.asset('assets/images/logo.png', fit: BoxFit.cover),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ONE CLICK HUB',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textDark,
                    letterSpacing: 1,
                  ),
                ),
                Text(
                  'Connecting All',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.textGrey,
                    letterSpacing: 2,
                  ),
                ),
              ],
            ),
          ),
          Consumer(
            builder: (context, ref, _) {
              final unreadCount =
                  ref.watch(notificationsProvider).unreadCount;
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined),
                    color: AppColors.textDark,
                    onPressed: () => context.push('/notifications?guest=true'),
                  ),
                  if (unreadCount > 0)
                    Positioned(
                      right: 6,
                      top: 6,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 18,
                          minHeight: 18,
                        ),
                        child: Text(
                          unreadCount > 9 ? '9+' : '$unreadCount',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GestureDetector(
        onTap: () => context.go('/auth/login'),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(8),
                blurRadius: 15,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Row(
            children: [
              Icon(Icons.search, color: AppColors.textLight, size: 22),
              SizedBox(width: 12),
              Text(
                'Search services...',
                style: TextStyle(
                  color: AppColors.textLight,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoriesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Popular Services',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textDark,
                ),
              ),
              GestureDetector(
                onTap: () => context.push('/browse-services'),
                child: const Text(
                  'See All',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 120,
          child: _categories.isEmpty
              ? const Center(
                  child: Text(
                    'No categories available',
                    style: TextStyle(color: AppColors.textLight, fontSize: 13),
                  ),
                )
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final category = _categories[index];
                    return _buildCategoryCard(category);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildCategoryCard(ServiceCategoryModel category) {
    return GestureDetector(
      onTap: () => context.push('/browse-services?category=${category.id}'),
      child: Container(
        width: 100,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withAlpha(15),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: category.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: category.imageUrl!,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: AppColors.primary.withAlpha(10),
                          child: const Icon(Icons.category,
                              color: AppColors.primary, size: 28),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: AppColors.primary.withAlpha(10),
                          child: const Icon(Icons.category,
                              color: AppColors.primary, size: 28),
                        ),
                      )
                    : Container(
                        color: AppColors.primary.withAlpha(10),
                        child: const Icon(Icons.category,
                            color: AppColors.primary, size: 28),
                      ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              category.name,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdvertisementSlider() {
    if (_advertisements.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        SizedBox(
          height: 180,
          child: PageView.builder(
            controller: _adPageController,
            onPageChanged: (index) {
              setState(() => _currentAdPage = index);
            },
            itemCount: _advertisements.length,
            itemBuilder: (context, index) {
              final ad = _advertisements[index];
              return _buildAdCard(ad);
            },
          ),
        ),
        if (_advertisements.length > 1) ...[
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              _advertisements.length,
              (index) => AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: _currentAdPage == index ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _currentAdPage == index
                      ? AppColors.primary
                      : AppColors.primary.withAlpha(40),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildAdCard(_AdvertisementModel ad) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(15),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: ad.imageUrl != null
              ? CachedNetworkImage(
                  imageUrl: ad.imageUrl!,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: 180,
                  placeholder: (context, url) => Container(
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.campaign,
                              color: Colors.white, size: 40),
                          const SizedBox(height: 8),
                          Text(
                            ad.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  errorWidget: (context, url, error) =>
                      _buildAdFallback(ad),
                )
              : _buildAdFallback(ad),
        ),
      ),
    );
  }

  Widget _buildAdFallback(_AdvertisementModel ad) {
    return Container(
      width: double.infinity,
      height: 180,
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.campaign, color: Colors.white, size: 40),
            const SizedBox(height: 8),
            Text(
              ad.title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
            if (ad.description != null) ...[
              const SizedBox(height: 4),
              Text(
                ad.description!,
                style: TextStyle(
                  color: Colors.white.withAlpha(200),
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
