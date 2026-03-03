class Order {
  final int id;
  final String orderNumber;
  final String status;
  final String? bookingDate;
  final double? agreedPrice;
  final OrderParty? customer;
  final OrderParty? freelancer;
  final OrderService? service;
  final String? createdAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    this.bookingDate,
    this.agreedPrice,
    this.customer,
    this.freelancer,
    this.service,
    this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      status: json['status'] ?? '',
      bookingDate: json['booking_date'],
      agreedPrice: _toDouble(json['agreed_price']),
      customer: json['customer'] != null
          ? OrderParty.fromJson(json['customer'])
          : null,
      freelancer: json['freelancer'] != null
          ? OrderParty.fromJson(json['freelancer'])
          : null,
      service: json['service'] != null
          ? OrderService.fromJson(json['service'])
          : null,
      createdAt: json['created_at'],
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
    if (agreedPrice == null) return 'N/A';
    return 'RM ${agreedPrice!.toStringAsFixed(0)}';
  }
}

class OrderParty {
  final int id;
  final String name;
  final String? phoneNumber;

  OrderParty({required this.id, required this.name, this.phoneNumber});

  factory OrderParty.fromJson(Map<String, dynamic> json) {
    return OrderParty(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phoneNumber: json['phone_number'],
    );
  }
}

class OrderService {
  final int id;
  final String title;
  final String? slug;

  OrderService({required this.id, required this.title, this.slug});

  factory OrderService.fromJson(Map<String, dynamic> json) {
    return OrderService(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      slug: json['slug'],
    );
  }
}
