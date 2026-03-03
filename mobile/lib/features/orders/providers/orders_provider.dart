import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/order.dart';

class OrdersState {
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final List<Order> orders;
  final int currentPage;
  final int lastPage;
  final String? statusFilter;

  const OrdersState({
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.orders = const [],
    this.currentPage = 1,
    this.lastPage = 1,
    this.statusFilter,
  });

  bool get hasMore => currentPage < lastPage;

  OrdersState copyWith({
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    List<Order>? orders,
    int? currentPage,
    int? lastPage,
    String? Function()? statusFilter,
  }) {
    return OrdersState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
      orders: orders ?? this.orders,
      currentPage: currentPage ?? this.currentPage,
      lastPage: lastPage ?? this.lastPage,
      statusFilter:
          statusFilter != null ? statusFilter() : this.statusFilter,
    );
  }
}

class OrdersNotifier extends StateNotifier<OrdersState> {
  final Dio _dio;
  final String _endpoint;

  OrdersNotifier(this._dio, this._endpoint) : super(const OrdersState());

  Future<void> loadOrders({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final params = <String, dynamic>{
        'page': 1,
        'per_page': 15,
      };
      if (state.statusFilter != null && state.statusFilter!.isNotEmpty) {
        params['status'] = state.statusFilter;
      }

      final response =
          await _dio.get(_endpoint, queryParameters: params);
      if (response.data['success'] == true) {
        final list = (response.data['data'] as List)
            .map((e) => Order.fromJson(e))
            .toList();
        final meta = response.data['meta'];
        state = state.copyWith(
          isLoading: false,
          orders: list,
          currentPage: meta?['current_page'] ?? 1,
          lastPage: meta?['last_page'] ?? 1,
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load orders',
      );
    }
  }

  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoadingMore) return;

    state = state.copyWith(isLoadingMore: true);
    try {
      final params = <String, dynamic>{
        'page': state.currentPage + 1,
        'per_page': 15,
      };
      if (state.statusFilter != null && state.statusFilter!.isNotEmpty) {
        params['status'] = state.statusFilter;
      }

      final response =
          await _dio.get(_endpoint, queryParameters: params);
      if (response.data['success'] == true) {
        final list = (response.data['data'] as List)
            .map((e) => Order.fromJson(e))
            .toList();
        final meta = response.data['meta'];
        state = state.copyWith(
          isLoadingMore: false,
          orders: [...state.orders, ...list],
          currentPage: meta?['current_page'] ?? state.currentPage,
          lastPage: meta?['last_page'] ?? state.lastPage,
        );
      }
    } on DioException {
      state = state.copyWith(isLoadingMore: false);
    }
  }

  void setStatusFilter(String? status) {
    state = state.copyWith(statusFilter: () => status);
    loadOrders(refresh: true);
  }
}

final myOrdersProvider =
    StateNotifierProvider<OrdersNotifier, OrdersState>((ref) {
  final dio = ref.watch(dioProvider);
  return OrdersNotifier(dio, ApiConstants.myOrders);
});

final myBookingsProvider =
    StateNotifierProvider<OrdersNotifier, OrdersState>((ref) {
  final dio = ref.watch(dioProvider);
  return OrdersNotifier(dio, ApiConstants.myBookings);
});
