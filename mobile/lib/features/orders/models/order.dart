class Order {
  final int id;
  final String orderNumber;
  final String status;
  final String? statusLabel;
  final String? bookingDate;
  final double? agreedPrice;
  final String? customerNotes;
  final String? paymentSlipUrl;
  final OrderParty? customer;
  final OrderParty? freelancer;
  final OrderService? service;
  final String? createdAt;
  final String? deliveredAt;
  final String? completedAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    this.statusLabel,
    this.bookingDate,
    this.agreedPrice,
    this.customerNotes,
    this.paymentSlipUrl,
    this.customer,
    this.freelancer,
    this.service,
    this.createdAt,
    this.deliveredAt,
    this.completedAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      status: json['status'] ?? '',
      statusLabel: json['status_label']?.toString(),
      bookingDate: json['booking_date'],
      agreedPrice: _toDouble(json['agreed_price']),
      customerNotes: json['customer_notes']?.toString(),
      paymentSlipUrl: json['payment_slip_url']?.toString(),
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
      deliveredAt: json['delivered_at']?.toString(),
      completedAt: json['completed_at']?.toString(),
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

  String get displayLabel => statusLabel ?? _fallbackLabel(status);

  static String _fallbackLabel(String s) => switch (s) {
        'pending_payment' => 'Booking Confirmed',
        'pending_approval' => 'Awaiting Confirmation',
        'active' => 'Service Paid',
        'delivered' => 'Delivered',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
        'rejected' => 'Rejected',
        _ => s,
      };
}

class OrderParty {
  final int id;
  final String name;
  final String? phoneNumber;
  final OrderBankingDetail? bankingDetail;

  OrderParty({
    required this.id,
    required this.name,
    this.phoneNumber,
    this.bankingDetail,
  });

  factory OrderParty.fromJson(Map<String, dynamic> json) {
    return OrderParty(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phoneNumber: json['phone_number'],
      bankingDetail: json['banking_detail'] != null
          ? OrderBankingDetail.fromJson(json['banking_detail'])
          : null,
    );
  }
}

class OrderBankingDetail {
  final String? bankName;
  final String? accountNumber;
  final String? accountHolderName;

  OrderBankingDetail({
    this.bankName,
    this.accountNumber,
    this.accountHolderName,
  });

  factory OrderBankingDetail.fromJson(Map<String, dynamic> json) {
    return OrderBankingDetail(
      bankName: json['bank_name']?.toString(),
      accountNumber: json['account_number']?.toString(),
      accountHolderName: json['account_holder_name']?.toString(),
    );
  }

  bool get hasDetails =>
      (bankName?.isNotEmpty ?? false) &&
      (accountNumber?.isNotEmpty ?? false);
}

class OrderService {
  final int id;
  final String title;
  final String? slug;
  final String? firstImage;

  OrderService({
    required this.id,
    required this.title,
    this.slug,
    this.firstImage,
  });

  factory OrderService.fromJson(Map<String, dynamic> json) {
    return OrderService(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      slug: json['slug'],
      firstImage: json['first_image']?.toString(),
    );
  }
}
