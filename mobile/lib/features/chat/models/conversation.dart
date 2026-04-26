class Conversation {
  final int id;
  final String type; // 'order' or 'general'
  final ConversationUser? otherUser;
  final ConversationOrder? order;
  final ConversationService? service;
  final String? lastMessage;
  final int unreadCount;
  final String? lastMessageAt;

  Conversation({
    required this.id,
    required this.type,
    this.otherUser,
    this.order,
    this.service,
    this.lastMessage,
    this.unreadCount = 0,
    this.lastMessageAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] ?? 0,
      type: json['type'] ?? 'general',
      otherUser: json['other_user'] != null
          ? ConversationUser.fromJson(json['other_user'])
          : null,
      order: json['order'] != null
          ? ConversationOrder.fromJson(json['order'])
          : null,
      service: json['service'] != null
          ? ConversationService.fromJson(json['service'])
          : null,
      lastMessage: json['last_message'] is Map
          ? (json['last_message']['body']?.toString())
          : json['last_message']?.toString(),
      unreadCount: json['unread_count'] ?? 0,
      lastMessageAt: json['last_message_at'],
    );
  }

  /// Title shown in summary header — prefers order's service, falls back
  /// to direct service link (general chat sourced from a service).
  String? get summaryTitle =>
      order?.service?.title ?? service?.title;

  String? get summaryImage =>
      order?.service?.firstImage ?? service?.firstImage;

  bool get hasServiceSummary => summaryTitle != null;
}

class ConversationUser {
  final int id;
  final String name;
  final String? phoneNumber;

  ConversationUser({required this.id, required this.name, this.phoneNumber});

  factory ConversationUser.fromJson(Map<String, dynamic> json) {
    return ConversationUser(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phoneNumber: json['phone_number'],
    );
  }

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

class ConversationOrder {
  final int id;
  final String orderNumber;
  final String? status;
  final String? bookingDate;
  final double? agreedPrice;
  final ConversationService? service;

  ConversationOrder({
    required this.id,
    required this.orderNumber,
    this.status,
    this.bookingDate,
    this.agreedPrice,
    this.service,
  });

  factory ConversationOrder.fromJson(Map<String, dynamic> json) {
    return ConversationOrder(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      status: json['status']?.toString(),
      bookingDate: json['booking_date']?.toString(),
      agreedPrice: _toDouble(json['agreed_price']),
      service: json['service'] != null
          ? ConversationService.fromJson(json['service'])
          : null,
    );
  }

  bool get isActive => status == 'pending_payment'
      || status == 'pending_approval'
      || status == 'active';

  /// Convenience for older callers that only need the title.
  String? get serviceTitle => service?.title;
}

class ConversationService {
  final int id;
  final String title;
  final String? slug;
  final String? firstImage;
  final double? priceFrom;
  final double? priceTo;

  ConversationService({
    required this.id,
    required this.title,
    this.slug,
    this.firstImage,
    this.priceFrom,
    this.priceTo,
  });

  factory ConversationService.fromJson(Map<String, dynamic> json) {
    return ConversationService(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      slug: json['slug']?.toString(),
      firstImage: json['first_image']?.toString(),
      priceFrom: _toDouble(json['price_from']),
      priceTo: _toDouble(json['price_to']),
    );
  }

  String? get priceDisplay {
    if (priceFrom == null) return null;
    if (priceTo != null && priceTo != priceFrom) {
      return 'RM ${priceFrom!.toStringAsFixed(0)} - RM ${priceTo!.toStringAsFixed(0)}';
    }
    return 'RM ${priceFrom!.toStringAsFixed(0)}';
  }
}

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is double) return v;
  if (v is int) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}
