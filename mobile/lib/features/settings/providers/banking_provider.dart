import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';

class BankingState {
  final bool isLoading;
  final bool isSaving;
  final String? error;
  final String? successMessage;
  final Map<String, dynamic>? bankingData;

  const BankingState({
    this.isLoading = false,
    this.isSaving = false,
    this.error,
    this.successMessage,
    this.bankingData,
  });

  BankingState copyWith({
    bool? isLoading,
    bool? isSaving,
    String? error,
    String? successMessage,
    Map<String, dynamic>? bankingData,
  }) {
    return BankingState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: error,
      successMessage: successMessage,
      bankingData: bankingData ?? this.bankingData,
    );
  }
}

class BankingNotifier extends StateNotifier<BankingState> {
  final Dio _dio;

  BankingNotifier(this._dio) : super(const BankingState());

  Future<void> loadBanking() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.bankingDetail);
      if (response.data['success'] == true) {
        state = BankingState(
          bankingData: response.data['data'] != null
              ? Map<String, dynamic>.from(response.data['data'])
              : null,
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load banking details',
      );
    }
  }

  Future<bool> updateBanking(Map<String, dynamic> data) async {
    state = state.copyWith(isSaving: true, error: null, successMessage: null);
    try {
      final response = await _dio.patch(ApiConstants.bankingDetail, data: data);
      if (response.data['success'] == true) {
        state = state.copyWith(
          isSaving: false,
          successMessage: 'Banking details updated successfully',
          bankingData: Map<String, dynamic>.from(response.data['data']),
        );
        return true;
      }
      state = state.copyWith(
        isSaving: false,
        error: response.data['message'] ?? 'Failed to update',
      );
      return false;
    } on DioException catch (e) {
      state = state.copyWith(
        isSaving: false,
        error: e.response?.data?['message'] ?? 'Connection error',
      );
      return false;
    }
  }
}

final bankingProvider =
    StateNotifierProvider<BankingNotifier, BankingState>((ref) {
  final dio = ref.watch(dioProvider);
  return BankingNotifier(dio);
});
