import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';

class ProfileState {
  final bool isLoading;
  final bool isSaving;
  final String? error;
  final String? successMessage;
  final Map<String, dynamic>? profileData;

  const ProfileState({
    this.isLoading = false,
    this.isSaving = false,
    this.error,
    this.successMessage,
    this.profileData,
  });

  ProfileState copyWith({
    bool? isLoading,
    bool? isSaving,
    String? error,
    String? successMessage,
    Map<String, dynamic>? profileData,
  }) {
    return ProfileState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: error,
      successMessage: successMessage,
      profileData: profileData ?? this.profileData,
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  final Dio _dio;

  ProfileNotifier(this._dio) : super(const ProfileState());

  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.profile);
      if (response.data['success'] == true) {
        state = ProfileState(
          profileData: Map<String, dynamic>.from(response.data['data']),
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load profile',
      );
    }
  }

  Future<bool> uploadProfilePicture(String filePath) async {
    state = state.copyWith(isSaving: true, error: null, successMessage: null);
    try {
      final formData = FormData.fromMap({
        'profile_picture': await MultipartFile.fromFile(filePath),
        'name': state.profileData?['name'] ?? '',
        'email': state.profileData?['email'] ?? '',
      });
      final response = await _dio.post(ApiConstants.profile, data: formData);
      if (response.data['success'] == true) {
        state = state.copyWith(
          isSaving: false,
          successMessage: 'Profile picture updated',
          profileData: Map<String, dynamic>.from(response.data['data']),
        );
        return true;
      }
      state = state.copyWith(
        isSaving: false,
        error: response.data['message'] ?? 'Failed to upload',
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

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    state = state.copyWith(isSaving: true, error: null, successMessage: null);
    try {
      final response = await _dio.put(ApiConstants.profile, data: data);
      if (response.data['success'] == true) {
        state = state.copyWith(
          isSaving: false,
          successMessage: 'Profile updated successfully',
          profileData: Map<String, dynamic>.from(response.data['data']),
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

final profileProvider =
    StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  final dio = ref.watch(dioProvider);
  return ProfileNotifier(dio);
});
