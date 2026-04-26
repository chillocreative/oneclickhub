import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';

class HalalRestaurantsScreen extends ConsumerStatefulWidget {
  const HalalRestaurantsScreen({super.key});

  @override
  ConsumerState<HalalRestaurantsScreen> createState() =>
      _HalalRestaurantsScreenState();
}

class _HalalRestaurantsScreenState
    extends ConsumerState<HalalRestaurantsScreen> {
  List<Map<String, dynamic>> _restaurants = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRestaurants();
  }

  Future<void> _loadRestaurants() async {
    setState(() => _isLoading = true);
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get(ApiConstants.halalRestaurants);
      if (response.data['success'] == true) {
        setState(() {
          _restaurants =
              List<Map<String, dynamic>>.from(response.data['data']);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } on DioException {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _callPhone(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openMaps(String? mapsUrl, String name, String address) async {
    final url = mapsUrl != null && mapsUrl.isNotEmpty
        ? mapsUrl
        : 'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent('$name, $address')}';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Halal Restaurants in Penang',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _restaurants.isEmpty
              ? _emptyState()
              : RefreshIndicator(
                  onRefresh: _loadRestaurants,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _restaurants.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) =>
                        _restaurantCard(_restaurants[index]),
                  ),
                ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.restaurant_outlined,
              size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 12),
          Text(
            'No restaurants listed yet',
            style: TextStyle(
              color: Colors.grey.shade400,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _restaurantCard(Map<String, dynamic> r) {
    final name = (r['name'] ?? '').toString();
    final address = (r['address'] ?? '').toString();
    final phone = (r['phone_number'] ?? '').toString();
    final cuisine = (r['cuisine_type'] ?? '').toString();
    final photoUrl = (r['photo_url'] ?? '').toString();
    final mapsUrl = (r['google_maps_url'] ?? '').toString();
    final ratingRaw = r['rating'];
    final rating = ratingRaw == null
        ? null
        : (ratingRaw is num
            ? ratingRaw.toDouble()
            : double.tryParse(ratingRaw.toString()));
    final ratingCount = r['rating_count'] is int
        ? r['rating_count'] as int
        : int.tryParse('${r['rating_count'] ?? ''}');

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _openMaps(mapsUrl, name, address),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _photo(photoUrl),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDark,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (rating != null || cuisine.isNotEmpty)
                      _ratingRow(rating, ratingCount, cuisine),
                    const SizedBox(height: 4),
                    Text(
                      address,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        height: 1.3,
                      ),
                    ),
                    if (phone.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () => _callPhone(phone),
                        child: Row(
                          children: [
                            const Icon(Icons.phone_outlined,
                                size: 14, color: AppColors.primary),
                            const SizedBox(width: 4),
                            Text(
                              phone,
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _photo(String url) {
    if (url.isEmpty) {
      return Container(
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(Icons.restaurant_outlined,
            size: 28, color: Colors.grey.shade300),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: CachedNetworkImage(
        imageUrl: url,
        width: 80,
        height: 80,
        fit: BoxFit.cover,
        placeholder: (_, __) => Container(
          width: 80,
          height: 80,
          color: Colors.grey.shade100,
        ),
        errorWidget: (_, __, ___) => Container(
          width: 80,
          height: 80,
          color: Colors.grey.shade100,
          child: Icon(Icons.restaurant_outlined,
              size: 28, color: Colors.grey.shade300),
        ),
      ),
    );
  }

  Widget _ratingRow(double? rating, int? count, String cuisine) {
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 6,
      children: [
        if (rating != null) ...[
          Text(
            rating.toStringAsFixed(1),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),
          _stars(rating),
          if (count != null)
            Text(
              '(${_formatCount(count)})',
              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
            ),
        ],
        if (cuisine.isNotEmpty) ...[
          if (rating != null)
            Text('·', style: TextStyle(color: Colors.grey.shade400)),
          Text(
            cuisine,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
          ),
        ],
      ],
    );
  }

  Widget _stars(double rating) {
    final full = rating.floor();
    final fraction = rating - full;
    final hasHalf = fraction >= 0.25 && fraction < 0.75;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        IconData icon;
        if (i < full) {
          icon = Icons.star_rounded;
        } else if (i == full && hasHalf) {
          icon = Icons.star_half_rounded;
        } else {
          icon = Icons.star_border_rounded;
        }
        return Icon(icon, size: 14, color: Colors.amber);
      }),
    );
  }

  String _formatCount(int count) {
    if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }
}
