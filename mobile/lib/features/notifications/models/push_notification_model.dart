class PushNotificationModel {
  final int id;
  final String title;
  final String body;
  final String targetRole;
  final String createdAt;

  PushNotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.targetRole,
    required this.createdAt,
  });

  factory PushNotificationModel.fromJson(Map<String, dynamic> json) {
    return PushNotificationModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      targetRole: json['target_role'] ?? 'all',
      createdAt: json['created_at'] ?? '',
    );
  }
}
