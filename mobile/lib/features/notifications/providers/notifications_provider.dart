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

  Future<void> loadNotifications({bool isGuest = false}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final endpoint =
          isGuest ? ApiConstants.notificationsGuest : ApiConstants.notifications;
      final response = await _dio.get(endpoint);
      final data = response.data;

      if (data['success'] == true) {
        final list = (data['data']['notifications'] as List)
            .map((n) => PushNotificationModel.fromJson(n))
            .toList();

        int unread;
        if (isGuest) {
          unread = await _computeGuestUnread(list);
        } else {
          unread = data['data']['unread_count'] ?? 0;
        }

        state = state.copyWith(
          isLoading: false,
          notifications: list,
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
    if (isGuest) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
          'notification_read_at', DateTime.now().toIso8601String());
      state = state.copyWith(unreadCount: 0);
    } else {
      try {
        await _dio.post(ApiConstants.markNotificationsRead);
        state = state.copyWith(unreadCount: 0);
      } catch (_) {}
    }
  }

  Future<int> _computeGuestUnread(List<PushNotificationModel> list) async {
    final prefs = await SharedPreferences.getInstance();
    final readAtStr = prefs.getString('notification_read_at');
    if (readAtStr == null) return list.length;

    final readAt = DateTime.tryParse(readAtStr);
    if (readAt == null) return list.length;

    return list.where((n) {
      final created = DateTime.tryParse(n.createdAt);
      return created != null && created.isAfter(readAt);
    }).length;
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationsNotifier(dio);
});
