class Service {
  final int id;
  final String title;
  final String slug;
  final String? description;
  final double? priceFrom;
  final double? priceTo;
  final int? deliveryDays;
  final List<String> images;
  final bool isActive;
  final ServiceCategory? category;
  final ServiceUser? user;

  Service({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    this.priceFrom,
    this.priceTo,
    this.deliveryDays,
    this.images = const [],
    this.isActive = true,
    this.category,
    this.user,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      priceFrom: _toDouble(json['price_from']),
      priceTo: _toDouble(json['price_to']),
      deliveryDays: json['delivery_days'],
      images: json['images'] != null
          ? List<String>.from(json['images'])
          : [],
      isActive: json['is_active'] ?? true,
      category: json['category'] != null
          ? ServiceCategory.fromJson(json['category'])
          : null,
      user: json['user'] != null
          ? ServiceUser.fromJson(json['user'])
          : null,
    );
  }

  static double? _toDouble(dynamic val) {
    if (val == null) return null;
    if (val is double) return val;
    if (val is int) return val.toDouble();
    if (val is String) return double.tryParse(val);
    return null;
  }

  String get priceDisplay {
    if (priceFrom == null) return 'N/A';
    final from = 'RM ${priceFrom!.toStringAsFixed(0)}';
    if (priceTo != null && priceTo != priceFrom) {
      return '$from - RM ${priceTo!.toStringAsFixed(0)}';
    }
    return from;
  }

  String get firstImage {
    if (images.isNotEmpty) return images.first;
    return '';
  }
}

class ServiceCategory {
  final int id;
  final String name;
  final int? servicesCount;

  ServiceCategory({
    required this.id,
    required this.name,
    this.servicesCount,
  });

  factory ServiceCategory.fromJson(Map<String, dynamic> json) {
    return ServiceCategory(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      servicesCount: json['services_count'],
    );
  }
}

class ServiceUser {
  final int id;
  final String name;
  final String? phoneNumber;

  ServiceUser({required this.id, required this.name, this.phoneNumber});

  factory ServiceUser.fromJson(Map<String, dynamic> json) {
    return ServiceUser(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phoneNumber: json['phone_number'],
    );
  }
}
