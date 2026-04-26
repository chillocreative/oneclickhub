import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/service.dart';
import '../models/service_category.dart';

class MyServicesState {
  final bool isLoading;
  final bool isSaving;
  final String? error;
  final String? successMessage;
  final List<Service> services;
  final List<ServiceCategoryModel> categories;
  final Map<String, dynamic>? serviceDetail;

  const MyServicesState({
    this.isLoading = false,
    this.isSaving = false,
    this.error,
    this.successMessage,
    this.services = const [],
    this.categories = const [],
    this.serviceDetail,
  });

  MyServicesState copyWith({
    bool? isLoading,
    bool? isSaving,
    String? error,
    String? successMessage,
    List<Service>? services,
    List<ServiceCategoryModel>? categories,
    Map<String, dynamic>? serviceDetail,
  }) {
    return MyServicesState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: error,
      successMessage: successMessage,
      services: services ?? this.services,
      categories: categories ?? this.categories,
      serviceDetail: serviceDetail ?? this.serviceDetail,
    );
  }
}

class MyServicesNotifier extends StateNotifier<MyServicesState> {
  final Dio _dio;

  MyServicesNotifier(this._dio) : super(const MyServicesState());

  Future<void> loadMyServices() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.myServices);
      if (response.data['success'] == true) {
        final list = (response.data['data'] as List)
            .map((e) => Service.fromJson(e))
            .toList();
        state = state.copyWith(isLoading: false, services: list);
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load services',
      );
    }
  }

  Future<void> loadCategories() async {
    try {
      final response = await _dio.get(ApiConstants.categories);
      if (response.data['success'] == true) {
        final list = (response.data['data'] as List)
            .map((e) => ServiceCategoryModel.fromJson(e))
            .toList();
        state = state.copyWith(categories: list);
      }
    } on DioException {
      // silently fail
    }
  }

  Future<Map<String, dynamic>?> loadServiceForEdit(int serviceId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get('${ApiConstants.myServices}/$serviceId');
      if (response.data['success'] == true) {
        final data = response.data['data'];
        final service = data['service'];
        final cats = (data['categories'] as List?)
            ?.map((e) => ServiceCategoryModel.fromJson(e))
            .toList();
        state = state.copyWith(
          isLoading: false,
          serviceDetail: service,
          categories: cats ?? state.categories,
        );
        return service;
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load service',
      );
    }
    return null;
  }

  Future<bool> createService(FormData formData) async {
    state = state.copyWith(isSaving: true, error: null, successMessage: null);
    try {
      final response = await _dio.post(
        ApiConstants.myServices,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
          // Image uploads from real devices over cellular routinely take
          // longer than the 15s default; bump just for this call.
          sendTimeout: const Duration(seconds: 90),
          receiveTimeout: const Duration(seconds: 90),
        ),
      );
      if (response.data['success'] == true) {
        state = state.copyWith(
          isSaving: false,
          successMessage: 'Service created successfully',
        );
        return true;
      }
      state = state.copyWith(
        isSaving: false,
        error: response.data['message'] ?? 'Failed to create service',
      );
    } on DioException catch (e) {
      String msg = 'Failed to create service';
      if (e.response?.data?['errors'] != null) {
        final errors = e.response!.data['errors'] as Map;
        msg = errors.values
            .expand((v) => v is List ? v : [v])
            .join('\n');
      } else if (e.response?.data?['message'] != null) {
        msg = e.response!.data['message'];
      }
      state = state.copyWith(isSaving: false, error: msg);
    }
    return false;
  }

  Future<bool> updateService(int serviceId, FormData formData) async {
    state = state.copyWith(isSaving: true, error: null, successMessage: null);
    try {
      final response = await _dio.post(
        '${ApiConstants.myServices}/$serviceId',
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
          sendTimeout: const Duration(seconds: 90),
          receiveTimeout: const Duration(seconds: 90),
        ),
      );
      if (response.data['success'] == true) {
        state = state.copyWith(
          isSaving: false,
          successMessage: 'Service updated successfully',
        );
        return true;
      }
      state = state.copyWith(
        isSaving: false,
        error: response.data['message'] ?? 'Failed to update service',
      );
    } on DioException catch (e) {
      String msg = 'Failed to update service';
      if (e.response?.data?['errors'] != null) {
        final errors = e.response!.data['errors'] as Map;
        msg = errors.values
            .expand((v) => v is List ? v : [v])
            .join('\n');
      } else if (e.response?.data?['message'] != null) {
        msg = e.response!.data['message'];
      }
      state = state.copyWith(isSaving: false, error: msg);
    }
    return false;
  }

  Future<bool> deleteService(int serviceId) async {
    state = state.copyWith(isSaving: true, error: null);
    try {
      final response =
          await _dio.delete('${ApiConstants.myServices}/$serviceId');
      if (response.data['success'] == true) {
        state = state.copyWith(
          isSaving: false,
          services: state.services.where((s) => s.id != serviceId).toList(),
          successMessage: 'Service deleted',
        );
        return true;
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isSaving: false,
        error: e.response?.data?['message'] ?? 'Failed to delete service',
      );
    }
    return false;
  }
}

final myServicesProvider =
    StateNotifierProvider<MyServicesNotifier, MyServicesState>((ref) {
  final dio = ref.watch(dioProvider);
  return MyServicesNotifier(dio);
});
