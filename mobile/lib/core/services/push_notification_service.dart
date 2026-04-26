import 'dart:convert';
import 'dart:io' show Platform;

import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../constants/api_constants.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('FCM background message: ${message.notification?.title}');
}

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._();
  factory PushNotificationService() => _instance;
  PushNotificationService._();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  String? _currentToken;
  Dio? _dio;
  bool _authTokenRegistered = false;
  bool _guestTokenRegistered = false;

  /// Callback invoked when a notification is tapped. Receives the FCM
  /// message's `data` payload so callers can deep-link (e.g. open a chat
  /// conversation). Set this after the router is ready to navigate on tap.
  static void Function(Map<String, dynamic>? data)? onNotificationTap;

  static const _androidChannel = AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    description: 'This channel is used for important notifications.',
    importance: Importance.high,
  );

  Future<void> initialize() async {
    // Create Android notification channel
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);

    // Initialize local notifications with tap callback that decodes the
    // payload back into the original FCM data map.
    await _localNotifications.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(
          requestAlertPermission: false,
          requestBadgePermission: false,
          requestSoundPermission: false,
        ),
      ),
      onDidReceiveNotificationResponse: (response) {
        Map<String, dynamic>? data;
        if (response.payload != null && response.payload!.isNotEmpty) {
          try {
            data = Map<String, dynamic>.from(jsonDecode(response.payload!));
          } catch (_) {}
        }
        _handleNotificationTap(data);
      },
    );

    // Request FCM permission
    try {
      await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
    } catch (e) {
      debugPrint('FCM permission error: $e');
    }

    // Get FCM token
    try {
      _currentToken = await _messaging.getToken();
      debugPrint('FCM Token: ${_currentToken != null ? 'obtained' : 'null'}');
    } catch (e) {
      debugPrint('FCM getToken error: $e');
    }

    // Listen for token refresh
    _messaging.onTokenRefresh.listen((newToken) {
      _currentToken = newToken;
      _authTokenRegistered = false;
      _guestTokenRegistered = false;
      _sendTokenToServer(newToken);
    });

    // Foreground: show notification using local notifications (Android only)
    // iOS handles foreground display via setForegroundNotificationPresentationOptions
    if (Platform.isAndroid) {
      FirebaseMessaging.onMessage.listen(_showForegroundNotification);
    }

    // Background tap — navigate when user taps notification
    FirebaseMessaging.onMessageOpenedApp.listen(
      (msg) => _handleNotificationTap(msg.data),
    );

    // Cold start tap — app was killed, user tapped notification to open
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage.data);
    }

    // iOS foreground presentation (Android uses local notifications above)
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  void _handleNotificationTap(Map<String, dynamic>? data) {
    debugPrint('FCM notification tapped, data=$data');
    onNotificationTap?.call(data);
  }

  void _showForegroundNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    // Forward the FCM data payload through local-notification payload so
    // the tap handler can deep-link the same way background taps do.
    final payload = message.data.isNotEmpty ? jsonEncode(message.data) : null;

    _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _androidChannel.id,
          _androidChannel.name,
          channelDescription: _androidChannel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
      ),
      payload: payload,
    );
  }

  void setDio(Dio dio) {
    _dio = dio;
  }

  String? get currentToken => _currentToken;

  Future<bool> registerToken() async {
    if (_currentToken == null) {
      try {
        _currentToken = await _messaging.getToken();
      } catch (_) {}
    }

    if (_currentToken == null || _authTokenRegistered) {
      return _authTokenRegistered;
    }

    return await _sendTokenToServer(_currentToken!);
  }

  /// Register token for guest (no auth required).
  Future<bool> registerGuestToken() async {
    if (_currentToken == null) {
      try {
        _currentToken = await _messaging.getToken();
      } catch (_) {}
    }

    if (_currentToken == null || _guestTokenRegistered) {
      return _guestTokenRegistered;
    }

    if (_dio == null) return false;
    try {
      await _dio!.post(ApiConstants.fcmTokenGuest, data: {'token': _currentToken});
      _guestTokenRegistered = true;
      debugPrint('FCM guest token registered OK');
      return true;
    } catch (e) {
      debugPrint('FCM guest token register failed: $e');
      return false;
    }
  }

  Future<void> removeToken() async {
    if (_currentToken != null && _dio != null) {
      try {
        await _dio!.delete(ApiConstants.fcmToken, data: {'token': _currentToken});
        _authTokenRegistered = false;
        _guestTokenRegistered = false;
      } catch (_) {}
    }
  }

  Future<bool> _sendTokenToServer(String token) async {
    if (_dio == null) return false;
    try {
      await _dio!.post(ApiConstants.fcmToken, data: {'token': token});
      _authTokenRegistered = true;
      _guestTokenRegistered = true; // auth supersedes guest
      debugPrint('FCM token registered OK');
      return true;
    } catch (e) {
      debugPrint('FCM token register failed: $e');
      return false;
    }
  }
}
