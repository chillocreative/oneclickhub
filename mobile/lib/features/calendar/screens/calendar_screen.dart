import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../providers/calendar_provider.dart';

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  final _dateFormat = DateFormat('yyyy-MM-dd');

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(calendarProvider.notifier).loadCalendar();
    });
  }

  String _formatDate(DateTime day) => _dateFormat.format(day);

  void _onDaySelected(DateTime selectedDay, DateTime focusedDay) {
    setState(() {
      _selectedDay = selectedDay;
      _focusedDay = focusedDay;
    });
  }

  Future<void> _markDate(String type) async {
    if (_selectedDay == null) return;
    final dateStr = _formatDate(_selectedDay!);
    final state = ref.read(calendarProvider);

    // Don't allow modifying booked dates
    if (state.isBooked(dateStr)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot modify booked dates'),
          backgroundColor: AppColors.statusPendingApproval,
        ),
      );
      return;
    }

    // Optimistic update
    ref.read(calendarProvider.notifier).addLocalAvailability(dateStr, type);

    final success = await ref.read(calendarProvider.notifier).updateDates([
      {'date': dateStr, 'type': type},
    ]);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Date marked as ${type == 'available' ? 'available' : 'blocked'}'),
          backgroundColor: AppColors.statusActive,
        ),
      );
    }
  }

  Future<void> _removeDate() async {
    if (_selectedDay == null) return;
    final dateStr = _formatDate(_selectedDay!);
    final state = ref.read(calendarProvider);

    if (state.isBooked(dateStr)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot remove booked dates'),
          backgroundColor: AppColors.statusPendingApproval,
        ),
      );
      return;
    }

    final success = await ref.read(calendarProvider.notifier).removeDate(dateStr);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Date removed'),
          backgroundColor: AppColors.statusActive,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(calendarProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'Your ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Calendar',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ),
      body: state.isLoading
          ? const ShimmerLoading(type: ShimmerType.dashboard)
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () => ref.read(calendarProvider.notifier).loadCalendar(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Calendar
                    AppCard(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                      child: TableCalendar(
                        firstDay: DateTime.now().subtract(const Duration(days: 30)),
                        lastDay: DateTime.now().add(const Duration(days: 365)),
                        focusedDay: _focusedDay,
                        selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                        onDaySelected: _onDaySelected,
                        onPageChanged: (focusedDay) {
                          _focusedDay = focusedDay;
                        },
                        calendarStyle: CalendarStyle(
                          todayDecoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(30),
                            shape: BoxShape.circle,
                          ),
                          todayTextStyle: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                          selectedDecoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          outsideDaysVisible: false,
                        ),
                        headerStyle: const HeaderStyle(
                          formatButtonVisible: false,
                          titleCentered: true,
                          titleTextStyle: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textDark,
                          ),
                          leftChevronIcon: Icon(Icons.chevron_left, color: AppColors.primary),
                          rightChevronIcon: Icon(Icons.chevron_right, color: AppColors.primary),
                        ),
                        calendarBuilders: CalendarBuilders(
                          defaultBuilder: (context, day, focusedDay) {
                            return _buildDayCell(day, state);
                          },
                          todayBuilder: (context, day, focusedDay) {
                            return _buildDayCell(day, state, isToday: true);
                          },
                          selectedBuilder: (context, day, focusedDay) {
                            return _buildDayCell(day, state, isSelected: true);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Legend
                    AppCard(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _LegendItem(
                            color: AppColors.statusActive,
                            label: 'Available',
                          ),
                          _LegendItem(
                            color: AppColors.statusRejected,
                            label: 'Blocked',
                          ),
                          _LegendItem(
                            color: AppColors.statusPendingApproval,
                            label: 'Booked',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Action buttons for selected date
                    if (_selectedDay != null) _buildDateActions(state),

                    // Error message
                    if (state.error != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        state.error!,
                        style: const TextStyle(
                          color: AppColors.statusRejected,
                          fontSize: 13,
                        ),
                      ),
                    ],

                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildDayCell(DateTime day, CalendarState state, {bool isToday = false, bool isSelected = false}) {
    final dateStr = _formatDate(day);
    final type = state.getDateType(dateStr);
    final booked = state.isBooked(dateStr);

    Color? bgColor;
    Color textColor = AppColors.textDark;

    if (isSelected) {
      bgColor = AppColors.primary;
      textColor = Colors.white;
    } else if (booked) {
      bgColor = AppColors.statusPendingApproval.withAlpha(30);
      textColor = AppColors.statusPendingApproval;
    } else if (type == 'available') {
      bgColor = AppColors.statusActive.withAlpha(30);
      textColor = AppColors.statusActive;
    } else if (type == 'blocked') {
      bgColor = AppColors.statusRejected.withAlpha(30);
      textColor = AppColors.statusRejected;
    } else if (isToday) {
      bgColor = AppColors.primary.withAlpha(20);
      textColor = AppColors.primary;
    }

    return Container(
      margin: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: isToday && !isSelected
            ? Border.all(color: AppColors.primary, width: 1.5)
            : null,
      ),
      child: Center(
        child: Text(
          '${day.day}',
          style: TextStyle(
            color: textColor,
            fontWeight: (isToday || isSelected || type != null || booked)
                ? FontWeight.w700
                : FontWeight.w400,
          ),
        ),
      ),
    );
  }

  Widget _buildDateActions(CalendarState state) {
    final dateStr = _formatDate(_selectedDay!);
    final type = state.getDateType(dateStr);
    final booked = state.isBooked(dateStr);
    final displayDate = DateFormat('EEEE, MMM d').format(_selectedDay!);

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            displayDate,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.textDark,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            booked
                ? 'This date has a booking and cannot be modified.'
                : type != null
                    ? 'Currently marked as $type'
                    : 'No status set for this date',
            style: const TextStyle(fontSize: 13, color: AppColors.textGrey),
          ),
          if (!booked) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _ActionChip(
                    label: 'Available',
                    icon: Icons.check_circle_outline,
                    color: AppColors.statusActive,
                    isActive: type == 'available',
                    onTap: () => _markDate('available'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _ActionChip(
                    label: 'Blocked',
                    icon: Icons.block,
                    color: AppColors.statusRejected,
                    isActive: type == 'blocked',
                    onTap: () => _markDate('blocked'),
                  ),
                ),
                if (type != null) ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: _ActionChip(
                      label: 'Remove',
                      icon: Icons.close,
                      color: AppColors.textGrey,
                      onTap: _removeDate,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color.withAlpha(30),
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 2),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textGrey,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _ActionChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool isActive;
  final VoidCallback onTap;

  const _ActionChip({
    required this.label,
    required this.icon,
    required this.color,
    this.isActive = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isActive ? color.withAlpha(20) : Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            border: Border.all(
              color: isActive ? color : Colors.grey.shade300,
              width: isActive ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
