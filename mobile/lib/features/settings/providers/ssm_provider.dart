import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';

class SsmState {
  final bool isLoading;
  final bool isUploading;
  final String? error;
  final String? successMessage;
  final Map<String, dynamic>? ssmData;

  const SsmState({
    this.isLoading = false,
    this.isUploading = false,
    this.error,
    this.successMessage,
    this.ssmData,
  });

  SsmState copyWith({
    bool? isLoading,
    bool? isUploading,
    String? error,
    String? successMessage,
    Map<String, dynamic>? ssmData,
  }) {
    return SsmState(
      isLoading: isLoading ?? this.isLoading,
      isUploading: isUploading ?? this.isUploading,
      error: error,
      successMessage: successMessage,
      ssmData: ssmData ?? this.ssmData,
    );
  }
}

class SsmNotifier extends StateNotifier<SsmState> {
  final Dio _dio;

  SsmNotifier(this._dio) : super(const SsmState());

  Future<void> loadSsm() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.ssmCertificate);
      if (response.data['success'] == true) {
        state = SsmState(
          ssmData: response.data['data'] != null
              ? Map<String, dynamic>.from(response.data['data'])
              : null,
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load SSM data',
      );
    }
  }

  Future<bool> uploadDocument(String filePath) async {
    state = state.copyWith(isUploading: true, error: null, successMessage: null);
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'document': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      final response = await _dio.post(
        ApiConstants.ssmUpload,
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
      if (response.data['success'] == true) {
        state = SsmState(
          successMessage: 'Document uploaded successfully',
          ssmData: response.data['data'] != null
              ? Map<String, dynamic>.from(response.data['data'])
              : state.ssmData,
        );
        return true;
      }
      state = state.copyWith(
        isUploading: false,
        error: response.data['message'] ?? 'Upload failed',
      );
      return false;
    } on DioException catch (e) {
      state = state.copyWith(
        isUploading: false,
        error: e.response?.data?['message'] ?? 'Connection error',
      );
      return false;
    }
  }
}

final ssmProvider =
    StateNotifierProvider<SsmNotifier, SsmState>((ref) {
  final dio = ref.watch(dioProvider);
  return SsmNotifier(dio);
});
