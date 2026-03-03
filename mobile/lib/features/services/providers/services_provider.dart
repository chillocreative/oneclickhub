import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/service.dart';
import '../models/service_category.dart';

class ServicesState {
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final List<Service> services;
  final List<ServiceCategoryModel> categories;
  final int currentPage;
  final int lastPage;
  final int? selectedCategoryId;
  final String? searchQuery;

  const ServicesState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.services = const [],
    this.categories = const [],
    this.currentPage = 1,
    this.lastPage = 1,
    this.selectedCategoryId,
    this.searchQuery,
  });

  bool get hasMore => currentPage < lastPage;

  ServicesState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    List<Service>? services,
    List<ServiceCategoryModel>? categories,
    int? currentPage,
    int? lastPage,
    int? Function()? selectedCategoryId,
    String? Function()? searchQuery,
  }) {
    return ServicesState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      services: services ?? this.services,
      categories: categories ?? this.categories,
      currentPage: currentPage ?? this.currentPage,
      lastPage: lastPage ?? this.lastPage,
      selectedCategoryId: selectedCategoryId != null
          ? selectedCategoryId()
          : this.selectedCategoryId,
      searchQuery:
          searchQuery != null ? searchQuery() : this.searchQuery,
    );
  }
}

class ServicesNotifier extends StateNotifier<ServicesState> {
  final Dio _dio;

  ServicesNotifier(this._dio) : super(const ServicesState());

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
      // silently fail, categories are optional
    }
  }

  Future<void> loadServices({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final params = <String, dynamic>{
        'page': refresh ? 1 : 1,
        'per_page': 12,
      };
      if (state.selectedCategoryId != null) {
        params['category'] = state.selectedCategoryId;
      }
      if (state.searchQuery != null && state.searchQuery!.isNotEmpty) {
        params['search'] = state.searchQuery;
      }

      final response =
          await _dio.get(ApiConstants.services, queryParameters: params);
      if (response.data['success'] == true) {
        final list = (response.data['data'] as List)
            .map((e) => Service.fromJson(e))
            .toList();
        final meta = response.data['meta'];
        state = state.copyWith(
          isLoading: false,
          services: list,
          currentPage: meta?['current_page'] ?? 1,
          lastPage: meta?['last_page'] ?? 1,
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load services',
      );
    }
  }

  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoadingMore) return;

    state = state.copyWith(isLoadingMore: true);
    try {
      final params = <String, dynamic>{
        'page': state.currentPage + 1,
        'per_page': 12,
      };
      if (state.selectedCategoryId != null) {
        params['category'] = state.selectedCategoryId;
      }
      if (state.searchQuery != null && state.searchQuery!.isNotEmpty) {
        params['search'] = state.searchQuery;
      }

      final response =
          await _dio.get(ApiConstants.services, queryParameters: params);
      if (response.data['success'] == true) {
        final list = (response.data['data'] as List)
            .map((e) => Service.fromJson(e))
            .toList();
        final meta = response.data['meta'];
        state = state.copyWith(
          isLoadingMore: false,
          services: [...state.services, ...list],
          currentPage: meta?['current_page'] ?? state.currentPage,
          lastPage: meta?['last_page'] ?? state.lastPage,
        );
      }
    } on DioException {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  void setCategory(int? categoryId) {
    state = state.copyWith(
      selectedCategoryId: () => categoryId,
    );
    loadServices(refresh: true);
  }

  void setSearch(String? query) {
    state = state.copyWith(
      searchQuery: () => query,
    );
    loadServices(refresh: true);
  }
}

final servicesProvider =
    StateNotifierProvider<ServicesNotifier, ServicesState>((ref) {
  final dio = ref.watch(dioProvider);
  return ServicesNotifier(dio);
});
