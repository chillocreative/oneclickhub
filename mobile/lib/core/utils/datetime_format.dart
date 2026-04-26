/// Date/time formatting helpers used across the booking + chat surfaces.
///
/// Booking timestamps come back from the API in two shapes: a date-only
/// `Y-m-d` (booking_date via `OrderResource::toDateString()`) and a full
/// ISO 8601 string (created_at, delivered_at, …). To keep the displayed
/// label stable across timezones for date-only fields, we format the raw
/// components of the parsed `DateTime` instead of converting to local time.
library;

class AppDateTime {
  AppDateTime._();

  static String _pad(int n) => n.toString().padLeft(2, '0');

  /// Format any ISO/`Y-m-d` string as `dd-MM-yyyy @ HH:mm`.
  /// Returns `'—'` for null/empty and the original input if it cannot be
  /// parsed (so we never silently lose information).
  static String formatBooking(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '—';
    final dt = DateTime.tryParse(raw);
    if (dt == null) return raw;
    return '${_pad(dt.day)}-${_pad(dt.month)}-${dt.year}'
        ' @ ${_pad(dt.hour)}:${_pad(dt.minute)}';
  }

  /// Same format but for full ISO timestamps converted to the device's
  /// local time — appropriate for created_at / delivered_at where the
  /// time-of-day actually matters to the user.
  static String formatLocal(String? raw) {
    if (raw == null || raw.trim().isEmpty) return '—';
    final dt = DateTime.tryParse(raw)?.toLocal();
    if (dt == null) return raw;
    return '${_pad(dt.day)}-${_pad(dt.month)}-${dt.year}'
        ' @ ${_pad(dt.hour)}:${_pad(dt.minute)}';
  }
}
