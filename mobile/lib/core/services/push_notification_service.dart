import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('FCM background message: ${message.notification?.title}');
}

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._();
  factory PushNotificationService() => _instance;
  PushNotificationService._();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  String? _currentToken;
  Dio? _dio;

  String? get currentToken => _currentToken;

  Future<void> initialize() async {
    // Set background handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Request permission
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    debugPrint('FCM permission: ${settings.authorizationStatus}');

    if (settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional) {
      // Get token
      _currentToken = await _messaging.getToken();
      debugPrint('FCM Token: $_currentToken');

      // Listen for token refresh
      _messaging.onTokenRefresh.listen((newToken) {
        _currentToken = newToken;
        _sendTokenToServer(newToken);
      });
    }

    // Foreground message handling
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('FCM foreground: ${message.notification?.title}');
      // System notification is shown automatically on Android
    });

    // When user taps notification (app in background)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('FCM notification tapped: ${message.notification?.title}');
    });

    // Set foreground notification presentation options
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
  }

  void setDio(Dio dio) {
    _dio = dio;
  }

  Future<void> registerToken() async {
    if (_currentToken != null) {
      await _sendTokenToServer(_currentToken!);
    }
  }

  Future<void> removeToken() async {
    if (_currentToken != null && _dio != null) {
      try {
        await _dio!.delete(ApiConstants.fcmToken, data: {'token': _currentToken});
      } catch (_) {}
    }
  }

  Future<void> _sendTokenToServer(String token) async {
    if (_dio == null) return;
    try {
      await _dio!.post(ApiConstants.fcmToken, data: {'token': token});
    } catch (e) {
      debugPrint('FCM token registration failed: $e');
    }
  }
}
