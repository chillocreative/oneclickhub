class Conversation {
  final int id;
  final String type; // 'order' or 'general'
  final ConversationUser? otherUser;
  final ConversationOrder? order;
  final String? lastMessage;
  final int unreadCount;
  final String? lastMessageAt;

  Conversation({
    required this.id,
    required this.type,
    this.otherUser,
    this.order,
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
      lastMessage: json['last_message'],
      unreadCount: json['unread_count'] ?? 0,
      lastMessageAt: json['last_message_at'],
    );
  }
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
  final String? serviceTitle;

  ConversationOrder({
    required this.id,
    required this.orderNumber,
    this.serviceTitle,
  });

  factory ConversationOrder.fromJson(Map<String, dynamic> json) {
    return ConversationOrder(
      id: json['id'] ?? 0,
      orderNumber: json['order_number'] ?? '',
      serviceTitle: json['service_title'] ?? json['service']?['title'],
    );
  }
}
