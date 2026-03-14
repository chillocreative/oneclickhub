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
  bool get isTokenRegistered => _tokenRegistered;

  Future<void> initialize() async {
    // Request permission
    try {
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      debugPrint('FCM permission: ${settings.authorizationStatus}');
    } catch (e) {
      debugPrint('FCM permission request error: $e');
    }

    // Get token
    try {
      _currentToken = await _messaging.getToken();
      debugPrint('FCM Token obtained: ${_currentToken != null ? '${_currentToken!.substring(0, 20)}...' : 'NULL'}');
    } catch (e) {
      debugPrint('FCM getToken error: $e');
    }

    // Listen for token refresh
    _messaging.onTokenRefresh.listen((newToken) {
      debugPrint('FCM Token refreshed');
      _currentToken = newToken;
      _tokenRegistered = false;
      _sendTokenToServer(newToken);
    });

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

  Future<bool> registerToken() async {
    if (_currentToken == null) {
      try {
        _currentToken = await _messaging.getToken();
        debugPrint('FCM Token (retry): ${_currentToken != null ? 'obtained' : 'still null'}');
      } catch (e) {
        debugPrint('FCM getToken retry error: $e');
      }
    }

    if (_currentToken == null) {
      debugPrint('FCM: No token available, cannot register');
      return false;
    }

    if (_tokenRegistered) {
      return true;
    }

    return await _sendTokenToServer(_currentToken!);
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

  Future<bool> _sendTokenToServer(String token) async {
    if (_dio == null) {
      debugPrint('FCM: Dio not set, cannot register token');
      return false;
    }
    try {
      final response = await _dio!.post(ApiConstants.fcmToken, data: {'token': token});
      if (response.statusCode == 200 || response.statusCode == 201) {
        _tokenRegistered = true;
        debugPrint('FCM token registered to server OK');
        return true;
      }
      debugPrint('FCM token registration unexpected status: ${response.statusCode}');
      return false;
    } on DioException catch (e) {
      debugPrint('FCM token registration failed: ${e.response?.statusCode} - ${e.response?.data}');
      return false;
    } catch (e) {
      debugPrint('FCM token registration error: $e');
      return false;
    }
  }
}
