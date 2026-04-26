import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/push_notification_model.dart';

class NotificationsState {
  final bool isLoading;
  final List<PushNotificationModel> notifications;
  final int unreadCount;
  final String? error;

  const NotificationsState({
    this.isLoading = false,
    this.notifications = const [],
    this.unreadCount = 0,
    this.error,
  });

  NotificationsState copyWith({
    bool? isLoading,
    List<PushNotificationModel>? notifications,
    int? unreadCount,
    String? error,
  }) {
    return NotificationsState(
      isLoading: isLoading ?? this.isLoading,
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      error: error,
    );
  }
}

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final Dio _dio;

  NotificationsNotifier(this._dio) : super(const NotificationsState());

  // Guest uses the legacy key for backward compat with existing installs.
  String _readKey(bool isGuest) =>
      isGuest ? 'notification_read_at' : 'notification_read_at_user';

  String _deletedKey(bool isGuest) =>
      isGuest ? 'notification_deleted_at_guest' : 'notification_deleted_at_user';

  Future<void> loadNotifications({bool isGuest = false}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final endpoint =
          isGuest ? ApiConstants.notificationsGuest : ApiConstants.notifications;
      final response = await _dio.get(endpoint);
      final data = response.data;

      if (data['success'] == true) {
        final all = (data['data']['notifications'] as List)
            .map((n) => PushNotificationModel.fromJson(n))
            .toList();

        final deletedAt = await _getDeletedAt(isGuest);
        final visible = deletedAt == null
            ? all
            : all.where((n) {
                final created = DateTime.tryParse(n.createdAt);
                return created != null && created.isAfter(deletedAt);
              }).toList();

        final unread = await _computeUnread(visible, isGuest, data);

        state = state.copyWith(
          isLoading: false,
          notifications: visible,
          unreadCount: unread,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } on DioException {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> markAllRead({bool isGuest = false}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_readKey(isGuest), DateTime.now().toIso8601String());

    if (!isGuest) {
      try {
        await _dio.post(ApiConstants.markNotificationsRead);
      } catch (_) {}
    }

    state = state.copyWith(unreadCount: 0);
  }

  Future<void> deleteAll({bool isGuest = false}) async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now();
    await prefs.setString(_deletedKey(isGuest), now.toIso8601String());
    // Treat as read too — count starts fresh for any new notifications.
    await prefs.setString(_readKey(isGuest), now.toIso8601String());

    if (!isGuest) {
      try {
        await _dio.post(ApiConstants.markNotificationsRead);
      } catch (_) {}
    }

    state = state.copyWith(notifications: [], unreadCount: 0);
  }

  Future<DateTime?> _getDeletedAt(bool isGuest) async {
    final prefs = await SharedPreferences.getInstance();
    final str = prefs.getString(_deletedKey(isGuest));
    if (str == null) return null;
    return DateTime.tryParse(str);
  }

  Future<int> _computeUnread(
    List<PushNotificationModel> visible,
    bool isGuest,
    Map data,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final readAtStr = prefs.getString(_readKey(isGuest));
    final readAt = readAtStr == null ? null : DateTime.tryParse(readAtStr);

    if (readAt != null) {
      return visible.where((n) {
        final created = DateTime.tryParse(n.createdAt);
        return created != null && created.isAfter(readAt);
      }).length;
    }

    if (!isGuest) {
      // Server's unread_count was computed from the full set; clamp to visible.
      final serverUnread = data['data']['unread_count'] ?? visible.length;
      return serverUnread > visible.length ? visible.length : serverUnread;
    }

    return visible.length;
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationsNotifier(dio);
});
