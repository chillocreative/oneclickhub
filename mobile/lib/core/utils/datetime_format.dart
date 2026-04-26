/// Date/time formatting helpers used across the booking + chat surfaces.
///
/// Booking timestamps come back from the API in two shapes: a date-only
/// `Y-m-d` (booking_date via `OrderResource::toDateString()`) and a full
/// ISO 8601 string (created_at, delivered_at, …). To keep the displayed
/// label stable across timezones for date-only fields, we format the raw
/// components of the parsed `DateTime` instead of converting to local time.
library;

import 'package:intl/intl.dart';

class AppDateTime {
  AppDateTime._();

  static String _pad(int n) => n.toString().padLeft(2, '0');

  /// Date-only label for booking dates — matches the order-card design
  /// style: `MMM d, yyyy` (e.g. `Jul 26, 2025`). Returns `—` for null/empty
  /// and the original input if it cannot be parsed.
  static String formatBooking(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '—';
    final dt = DateTime.tryParse(raw);
    if (dt == null) return raw;
    return DateFormat('MMM d, yyyy').format(dt);
  }

  /// Date-only label using `dd-MM-yyyy` for callers that need a numeric
  /// representation (legacy form).
  static String formatBookingNumeric(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '—';
    final dt = DateTime.tryParse(raw);
    if (dt == null) return raw;
    return '${_pad(dt.day)}-${_pad(dt.month)}-${dt.year}';
  }

  /// Full local timestamp `dd-MM-yyyy @ HH:mm` — appropriate for
  /// created_at / delivered_at where the time-of-day matters.
  static String formatLocal(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '—';
    final dt = DateTime.tryParse(raw)?.toLocal();
    if (dt == null) return raw;
    return '${_pad(dt.day)}-${_pad(dt.month)}-${dt.year}'
        ' @ ${_pad(dt.hour)}:${_pad(dt.minute)}';
  }
}
