import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';

class PlansState {
  final bool isLoading;
  final bool isProcessing;
  final String? error;
  final String? successMessage;
  final List<Map<String, dynamic>> plans;
  final List<Map<String, dynamic>> gateways;

  const PlansState({
    this.isLoading = false,
    this.isProcessing = false,
    this.error,
    this.successMessage,
    this.plans = const [],
    this.gateways = const [],
  });

  PlansState copyWith({
    bool? isLoading,
    bool? isProcessing,
    String? error,
    String? successMessage,
    List<Map<String, dynamic>>? plans,
    List<Map<String, dynamic>>? gateways,
  }) {
    return PlansState(
      isLoading: isLoading ?? this.isLoading,
      isProcessing: isProcessing ?? this.isProcessing,
      error: error,
      successMessage: successMessage,
      plans: plans ?? this.plans,
      gateways: gateways ?? this.gateways,
    );
  }
}

class PlansNotifier extends StateNotifier<PlansState> {
  final Dio _dio;

  PlansNotifier(this._dio) : super(const PlansState());

  Future<void> loadPlans() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.plans);
      if (response.data['success'] == true) {
        final data = response.data['data'];
        state = PlansState(
          plans: (data['plans'] as List? ?? [])
              .map((p) => Map<String, dynamic>.from(p))
              .toList(),
          gateways: (data['gateways'] as List? ?? [])
              .map((g) => Map<String, dynamic>.from(g))
              .toList(),
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load plans',
      );
    }
  }

  Future<String?> initiatePayment(String planSlug, String gateway) async {
    state = state.copyWith(isProcessing: true, error: null);
    try {
      final response = await _dio.post(
        '${ApiConstants.subscribePay}/$planSlug',
        data: {'gateway': gateway},
      );
      state = state.copyWith(isProcessing: false);
      if (response.data['success'] == true) {
        return response.data['data']?['payment_url']?.toString();
      }
      state = state.copyWith(
        error: response.data['message'] ?? 'Payment initiation failed',
      );
      return null;
    } on DioException catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: e.response?.data?['message'] ?? 'Connection error',
      );
      return null;
    }
  }

  Future<bool> cancelSubscription() async {
    state = state.copyWith(isProcessing: true, error: null);
    try {
      final response = await _dio.post(ApiConstants.subscriptionCancel);
      if (response.data['success'] == true) {
        state = state.copyWith(
          isProcessing: false,
          successMessage: 'Subscription cancelled successfully',
        );
        return true;
      }
      state = state.copyWith(
        isProcessing: false,
        error: response.data['message'] ?? 'Failed to cancel',
      );
      return false;
    } on DioException catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: e.response?.data?['message'] ?? 'Connection error',
      );
      return false;
    }
  }
}

final plansProvider =
    StateNotifierProvider<PlansNotifier, PlansState>((ref) {
  final dio = ref.watch(dioProvider);
  return PlansNotifier(dio);
});
