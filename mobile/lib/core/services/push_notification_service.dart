import 'package:dio/dio.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
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
  String? _currentToken;
  Dio? _dio;
  bool _tokenRegistered = false;

  String? get currentToken => _currentToken;

  Future<void> initialize() async {
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
      try {
        _currentToken = await _messaging.getToken();
        debugPrint('FCM Token: $_currentToken');
      } catch (e) {
        debugPrint('FCM getToken error: $e');
      }

      // Listen for token refresh
      _messaging.onTokenRefresh.listen((newToken) {
        debugPrint('FCM Token refreshed: $newToken');
        _currentToken = newToken;
        _tokenRegistered = false;
        _sendTokenToServer(newToken);
      });
    }

    // Foreground message handling
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('FCM foreground: ${message.notification?.title}');
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
    if (_currentToken == null) {
      // Try to get token again
      try {
        _currentToken = await _messaging.getToken();
        debugPrint('FCM Token (retry): $_currentToken');
      } catch (e) {
        debugPrint('FCM getToken retry error: $e');
      }
    }

    if (_currentToken != null && !_tokenRegistered) {
      await _sendTokenToServer(_currentToken!);
    }
  }

  Future<void> removeToken() async {
    if (_currentToken != null && _dio != null) {
      try {
        await _dio!.delete(ApiConstants.fcmToken, data: {'token': _currentToken});
        _tokenRegistered = false;
      } catch (e) {
        debugPrint('FCM token removal failed: $e');
      }
    }
  }

  Future<void> _sendTokenToServer(String token) async {
    if (_dio == null) {
      debugPrint('FCM: Dio not set, cannot register token');
      return;
    }
    try {
      await _dio!.post(ApiConstants.fcmToken, data: {'token': token});
      _tokenRegistered = true;
      debugPrint('FCM token registered to server successfully');
    } catch (e) {
      debugPrint('FCM token registration failed: $e');
      _tokenRegistered = false;
    }
  }
}
