import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/services/push_notification_service.dart';
import '../../../core/storage/token_storage.dart';
import '../../../models/user.dart';

/// Auth state
class AuthState {
  final User? user;
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;
  final Map<String, dynamic>? ssm;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.isAuthenticated = false,
    this.error,
    this.ssm,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    bool? isAuthenticated,
    String? error,
    Map<String, dynamic>? ssm,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: error,
      ssm: ssm ?? this.ssm,
    );
  }
}

/// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final Dio _dio;

  AuthNotifier(this._dio) : super(const AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final hasToken = await TokenStorage.hasToken();
    if (hasToken) {
      await fetchUser();
    }
  }

  Future<bool> login(String phoneNumber, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _dio.post(ApiConstants.login, data: {
        'phone_number': phoneNumber,
        'password': password,
      });

      final data = response.data;
      if (data['success'] == true) {
        final token = data['data']['token'];
        await TokenStorage.saveToken(token);

        final user = User.fromJson(data['data']['user']);
        state = AuthState(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
        // Register FCM token
        PushNotificationService().setDio(_dio);
        PushNotificationService().registerToken();
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: data['message'] ?? 'Login failed',
        );
        return false;
      }
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Connection error';
      state = state.copyWith(isLoading: false, error: message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Unexpected error. Please try again.',
      );
      return false;
    }
  }

  Future<bool> register({
    String? companyName,
    String? businessName,
    required String name,
    required String phoneNumber,
    required String email,
    required String password,
    required String passwordConfirmation,
    String role = 'Customer',
    String? identityDocumentPath,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final Response response;

      if (identityDocumentPath != null) {
        final formData = FormData.fromMap({
          'name': name,
          if (companyName != null && companyName.isNotEmpty)
            'company_name': companyName,
          if (businessName != null && businessName.isNotEmpty)
            'business_name': businessName,
          'phone_number': phoneNumber,
          'email': email,
          'password': password,
          'password_confirmation': passwordConfirmation,
          'role': role,
          'identity_document': await MultipartFile.fromFile(
            identityDocumentPath,
            filename: identityDocumentPath.split('/').last,
          ),
        });
        response = await _dio.post(ApiConstants.register, data: formData);
      } else {
        response = await _dio.post(ApiConstants.register, data: {
          'name': name,
          if (companyName != null && companyName.isNotEmpty)
            'company_name': companyName,
          if (businessName != null && businessName.isNotEmpty)
            'business_name': businessName,
          'phone_number': phoneNumber,
          'email': email,
          'password': password,
          'password_confirmation': passwordConfirmation,
          'role': role,
        });
      }

      final data = response.data;
      if (data['success'] == true) {
        final token = data['data']['token'];
        await TokenStorage.saveToken(token);

        final user = User.fromJson(data['data']['user']);
        state = AuthState(
          user: user,
          isAuthenticated: true,
          isLoading: false,
        );
        // Register FCM token
        PushNotificationService().setDio(_dio);
        PushNotificationService().registerToken();
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: data['message'] ?? 'Registration failed',
        );
        return false;
      }
    } on DioException catch (e) {
      String message = 'Connection error';
      if (e.response?.data != null) {
        final errors = e.response!.data['errors'];
        if (errors is Map) {
          message = errors.values
              .expand((v) => v is List ? v : [v])
              .join('\n');
        } else {
          message = e.response!.data['message'] ?? message;
        }
      }
      state = state.copyWith(isLoading: false, error: message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Unexpected error. Please try again.',
      );
      return false;
    }
  }

  Future<void> fetchUser() async {
    try {
      final response = await _dio.get(ApiConstants.user);
      final data = response.data;

      if (data['success'] == true) {
        final user = User.fromJson(data['data']['user']);
        state = AuthState(
          user: user,
          isAuthenticated: true,
          ssm: data['data']['ssm'],
        );
        // Ensure FCM token is registered
        PushNotificationService().setDio(_dio);
        PushNotificationService().registerToken();
      } else {
        await logout();
      }
    } on DioException {
      await logout();
    }
  }

  Future<void> logout() async {
    // Remove FCM token before logout
    PushNotificationService().setDio(_dio);
    await PushNotificationService().removeToken();
    try {
      await _dio.post(ApiConstants.logout);
    } catch (_) {}

    await TokenStorage.deleteToken();
    state = const AuthState();
  }

  Future<String?> forgotPassword(String email) async {
    try {
      final response = await _dio.post(ApiConstants.forgotPassword, data: {
        'email': email,
      });

      final data = response.data;
      if (data['success'] == true) {
        return null; // success
      }
      return data['message'] ?? 'Failed to send reset link';
    } on DioException catch (e) {
      return e.response?.data?['message'] ?? 'Connection error';
    }
  }
}

/// Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthNotifier(dio);
});
