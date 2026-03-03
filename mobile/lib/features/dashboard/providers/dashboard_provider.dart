import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/dashboard_data.dart';

class DashboardState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? rawData;
  final FreelancerDashboard? freelancerData;
  final CustomerDashboard? customerData;
  final AdminDashboard? adminData;

  const DashboardState({
    this.isLoading = false,
    this.error,
    this.rawData,
    this.freelancerData,
    this.customerData,
    this.adminData,
  });

  DashboardState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? rawData,
    FreelancerDashboard? freelancerData,
    CustomerDashboard? customerData,
    AdminDashboard? adminData,
  }) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      rawData: rawData ?? this.rawData,
      freelancerData: freelancerData ?? this.freelancerData,
      customerData: customerData ?? this.customerData,
      adminData: adminData ?? this.adminData,
    );
  }
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  final Dio _dio;

  DashboardNotifier(this._dio) : super(const DashboardState());

  Future<void> loadDashboard(String role) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.dashboard);
      if (response.data['success'] == true) {
        final data = response.data['data'] as Map<String, dynamic>;
        state = DashboardState(
          rawData: data,
          freelancerData: role == 'Freelancer'
              ? FreelancerDashboard.fromJson(data)
              : null,
          customerData: role == 'Customer'
              ? CustomerDashboard.fromJson(data)
              : null,
          adminData: role == 'Admin'
              ? AdminDashboard.fromJson(data)
              : null,
        );
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.data['message'] ?? 'Failed to load dashboard',
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Connection error',
      );
    }
  }
}

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  final dio = ref.watch(dioProvider);
  return DashboardNotifier(dio);
});
