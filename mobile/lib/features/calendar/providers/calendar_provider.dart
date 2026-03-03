import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';

class CalendarState {
  final bool isLoading;
  final bool isSaving;
  final String? error;
  final String? successMessage;
  final List<Map<String, dynamic>> availabilities;
  final List<String> bookedDates;

  const CalendarState({
    this.isLoading = false,
    this.isSaving = false,
    this.error,
    this.successMessage,
    this.availabilities = const [],
    this.bookedDates = const [],
  });

  CalendarState copyWith({
    bool? isLoading,
    bool? isSaving,
    String? error,
    String? successMessage,
    List<Map<String, dynamic>>? availabilities,
    List<String>? bookedDates,
  }) {
    return CalendarState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: error,
      successMessage: successMessage,
      availabilities: availabilities ?? this.availabilities,
      bookedDates: bookedDates ?? this.bookedDates,
    );
  }

  /// Get availability type for a date string (yyyy-MM-dd)
  String? getDateType(String dateStr) {
    for (final a in availabilities) {
      if (a['date'] == dateStr) return a['type']?.toString();
    }
    return null;
  }

  bool isBooked(String dateStr) => bookedDates.contains(dateStr);
}

class CalendarNotifier extends StateNotifier<CalendarState> {
  final Dio _dio;

  CalendarNotifier(this._dio) : super(const CalendarState());

  Future<void> loadCalendar() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.calendar);
      if (response.data['success'] == true) {
        final data = response.data['data'];
        state = CalendarState(
          availabilities: (data['availabilities'] as List? ?? [])
              .map((a) => Map<String, dynamic>.from(a))
              .toList(),
          bookedDates: (data['booked_dates'] as List? ?? [])
              .map((d) => d.toString())
              .toList(),
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load calendar',
      );
    }
  }

  Future<bool> updateDates(List<Map<String, String>> dates) async {
    state = state.copyWith(isSaving: true, error: null, successMessage: null);
    try {
      final response = await _dio.post(
        ApiConstants.calendar,
        data: {'dates': dates},
      );
      if (response.data['success'] == true) {
        // Reload to get fresh data
        await loadCalendar();
        state = state.copyWith(
          isSaving: false,
          successMessage: 'Calendar updated',
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

  Future<bool> removeDate(String date) async {
    // Optimistic update - remove locally first
    final updatedAvailabilities = state.availabilities
        .where((a) => a['date'] != date)
        .toList();
    state = state.copyWith(
      availabilities: updatedAvailabilities,
      error: null,
    );

    try {
      final response = await _dio.delete(
        '${ApiConstants.calendar}/date',
        data: {'date': date},
      );
      if (response.data['success'] == true) {
        return true;
      }
      // Revert on failure
      await loadCalendar();
      state = state.copyWith(
        error: response.data['message'] ?? 'Failed to remove date',
      );
      return false;
    } on DioException catch (e) {
      // Revert on error
      await loadCalendar();
      state = state.copyWith(
        error: e.response?.data?['message'] ?? 'Connection error',
      );
      return false;
    }
  }

  /// Optimistic local add for snappy UX
  void addLocalAvailability(String date, String type) {
    final updated = List<Map<String, dynamic>>.from(state.availabilities);
    updated.removeWhere((a) => a['date'] == date);
    updated.add({'date': date, 'type': type});
    state = state.copyWith(availabilities: updated);
  }
}

final calendarProvider =
    StateNotifierProvider<CalendarNotifier, CalendarState>((ref) {
  final dio = ref.watch(dioProvider);
  return CalendarNotifier(dio);
});
