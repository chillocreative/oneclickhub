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
  bool _tokenRegistered = false;

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

    // Initialize local notifications
    await _localNotifications.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      ),
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
      _tokenRegistered = false;
      _sendTokenToServer(newToken);
    });

    // Foreground: show notification using local notifications
    FirebaseMessaging.onMessage.listen(_showForegroundNotification);

    // Background tap
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('FCM tapped: ${message.notification?.title}');
    });

    // iOS foreground presentation (Android uses local notifications above)
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  void _showForegroundNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

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
    );
  }

  void setDio(Dio dio) {
    _dio = dio;
  }

  Future<bool> registerToken() async {
    if (_currentToken == null) {
      try {
        _currentToken = await _messaging.getToken();
      } catch (_) {}
    }

    if (_currentToken == null || _tokenRegistered) {
      return _tokenRegistered;
    }

    return await _sendTokenToServer(_currentToken!);
  }

  Future<void> removeToken() async {
    if (_currentToken != null && _dio != null) {
      try {
        await _dio!.delete(ApiConstants.fcmToken, data: {'token': _currentToken});
        _tokenRegistered = false;
      } catch (_) {}
    }
  }

  Future<bool> _sendTokenToServer(String token) async {
    if (_dio == null) return false;
    try {
      await _dio!.post(ApiConstants.fcmToken, data: {'token': token});
      _tokenRegistered = true;
      debugPrint('FCM token registered OK');
      return true;
    } catch (e) {
      debugPrint('FCM token register failed: $e');
      return false;
    }
  }
}
