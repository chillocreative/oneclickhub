class FreelancerDashboard {
  final int totalServices;
  final int activeServices;
  final int totalViews;
  final int pendingOrders;
  final double totalEarnings;
  final Map<String, dynamic>? subscription;
  final List<Map<String, dynamic>> recentServices;

  FreelancerDashboard({
    this.totalServices = 0,
    this.activeServices = 0,
    this.totalViews = 0,
    this.pendingOrders = 0,
    this.totalEarnings = 0,
    this.subscription,
    this.recentServices = const [],
  });

  factory FreelancerDashboard.fromJson(Map<String, dynamic> json) {
    return FreelancerDashboard(
      totalServices: json['total_services'] ?? 0,
      activeServices: json['active_services'] ?? json['total_services'] ?? 0,
      totalViews: json['total_views'] ?? 0,
      pendingOrders: json['pending_orders'] ?? 0,
      totalEarnings: _toDouble(json['total_earnings']),
      subscription: json['subscription'] != null
          ? Map<String, dynamic>.from(json['subscription'])
          : null,
      recentServices: json['recent_services'] != null
          ? List<Map<String, dynamic>>.from(json['recent_services'])
          : [],
    );
  }

  static double _toDouble(dynamic val) {
    if (val == null) return 0;
    if (val is double) return val;
    if (val is int) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0;
    return 0;
  }
}

class CustomerDashboard {
  final int activeBookings;
  final int completedBookings;
  final int totalBookings;

  CustomerDashboard({
    this.activeBookings = 0,
    this.completedBookings = 0,
    this.totalBookings = 0,
  });

  factory CustomerDashboard.fromJson(Map<String, dynamic> json) {
    return CustomerDashboard(
      activeBookings: json['active_bookings'] ?? 0,
      completedBookings: json['completed_bookings'] ?? 0,
      totalBookings: json['total_bookings'] ?? 0,
    );
  }
}

class AdminDashboard {
  final AdminStats stats;
  final List<Map<String, dynamic>> orderAnalytics;
  final List<Map<String, dynamic>> serviceCategories;
  final List<Map<String, dynamic>> topFreelancers;
  final List<Map<String, dynamic>> topCategories;

  AdminDashboard({
    required this.stats,
    this.orderAnalytics = const [],
    this.serviceCategories = const [],
    this.topFreelancers = const [],
    this.topCategories = const [],
  });

  factory AdminDashboard.fromJson(Map<String, dynamic> json) {
    final statsJson = json['stats'] as Map<String, dynamic>? ?? {};
    return AdminDashboard(
      stats: AdminStats.fromJson(statsJson),
      orderAnalytics: json['order_analytics'] != null
          ? List<Map<String, dynamic>>.from(json['order_analytics'])
          : [],
      serviceCategories: json['service_categories'] != null
          ? List<Map<String, dynamic>>.from(json['service_categories'])
          : [],
      topFreelancers: json['top_freelancers'] != null
          ? List<Map<String, dynamic>>.from(json['top_freelancers'])
          : [],
      topCategories: json['top_categories'] != null
          ? List<Map<String, dynamic>>.from(json['top_categories'])
          : [],
    );
  }
}

class AdminStats {
  final int freelancers;
  final int customers;
  final double revenue;
  final int orders;
  final int activeSubscriptions;
  final int pendingSsm;

  AdminStats({
    this.freelancers = 0,
    this.customers = 0,
    this.revenue = 0,
    this.orders = 0,
    this.activeSubscriptions = 0,
    this.pendingSsm = 0,
  });

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      freelancers: json['freelancers'] ?? 0,
      customers: json['customers'] ?? 0,
      revenue: _toDouble(json['revenue']),
      orders: json['orders'] ?? 0,
      activeSubscriptions: json['active_subscriptions'] ?? 0,
      pendingSsm: json['pending_ssm'] ?? 0,
    );
  }

  static double _toDouble(dynamic val) {
    if (val == null) return 0;
    if (val is double) return val;
    if (val is int) return val.toDouble();
    if (val is String) return double.tryParse(val) ?? 0;
    return 0;
  }
}
