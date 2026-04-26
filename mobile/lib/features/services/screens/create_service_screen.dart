import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/uploading_overlay.dart';
import '../../calendar/providers/calendar_provider.dart';
import '../providers/my_services_provider.dart';

class CreateServiceScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic>? existingService;

  const CreateServiceScreen({super.key, this.existingService});

  @override
  ConsumerState<CreateServiceScreen> createState() =>
      _CreateServiceScreenState();
}

class _CreateServiceScreenState extends ConsumerState<CreateServiceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceFromCtrl = TextEditingController();
  final _priceToCtrl = TextEditingController();
  final _deliveryCtrl = TextEditingController();
  int? _selectedCategoryId;
  bool _alwaysAvailable = false;
  final List<File> _imageFiles = [];
  final List<String> _existingImageUrls = [];
  DateTime _calendarFocusedDay = DateTime.now();
  DateTime? _calendarSelectedDay;
  final _calendarDateFormat = DateFormat('yyyy-MM-dd');

  bool get isEditing => widget.existingService != null;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(myServicesProvider.notifier).loadCategories();
      ref.read(calendarProvider.notifier).loadCalendar();
    });

    if (widget.existingService != null) {
      final s = widget.existingService!;
      _titleCtrl.text = s['title']?.toString() ?? '';
      _descCtrl.text = s['description']?.toString() ?? '';
      _priceFromCtrl.text = s['price_from']?.toString() ?? '';
      final priceTo = s['price_to'];
      if (priceTo != null) _priceToCtrl.text = priceTo.toString();
      final delivery = s['delivery_days'];
      if (delivery != null) _deliveryCtrl.text = delivery.toString();
      _selectedCategoryId = s['category']?['id'];
      _alwaysAvailable = s['always_available'] == true;
      final images = s['images'];
      if (images is List) {
        _existingImageUrls
          ..clear()
          ..addAll(images.map((e) => e.toString()));
      }
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _priceFromCtrl.dispose();
    _priceToCtrl.dispose();
    _deliveryCtrl.dispose();
    super.dispose();
  }

  final _imagePicker = ImagePicker();

  Future<void> _pickImages() async {
    // image_picker compresses on device (quality 80) and caps width at
    // 1920 — keeps even multi-shot uploads under the backend size cap and
    // well inside the 4G upload window.
    final picked = await _imagePicker.pickMultiImage(
      imageQuality: 80,
      maxWidth: 1920,
    );
    if (picked.isEmpty) return;
    setState(() {
      _imageFiles.addAll(picked.map((x) => File(x.path)));
    });
  }

  void _removeNewImage(int index) {
    setState(() => _imageFiles.removeAt(index));
  }

  void _removeExistingImage(String url) {
    setState(() => _existingImageUrls.remove(url));
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select a category'),
          backgroundColor: AppColors.statusRejected,
        ),
      );
      return;
    }

    final formData = FormData.fromMap({
      'title': _titleCtrl.text.trim(),
      'description': _descCtrl.text.trim(),
      'service_category_id': _selectedCategoryId,
      'price_from': _priceFromCtrl.text.trim(),
      if (_priceToCtrl.text.trim().isNotEmpty)
        'price_to': _priceToCtrl.text.trim(),
      if (_deliveryCtrl.text.trim().isNotEmpty)
        'delivery_days': _deliveryCtrl.text.trim(),
      'always_available': _alwaysAvailable ? '1' : '0',
    });

    // Tell the server which previously-attached images to keep so it can
    // delete the dropped ones and merge the new ones below.
    if (isEditing) {
      for (int i = 0; i < _existingImageUrls.length; i++) {
        formData.fields.add(MapEntry(
          'existing_images[$i]',
          _existingImageUrls[i],
        ));
      }
    }

    for (int i = 0; i < _imageFiles.length; i++) {
      formData.files.add(MapEntry(
        'images[$i]',
        await MultipartFile.fromFile(_imageFiles[i].path,
            filename: _imageFiles[i].path.split('/').last),
      ));
    }

    bool success;
    if (isEditing) {
      success = await ref
          .read(myServicesProvider.notifier)
          .updateService(widget.existingService!['id'], formData);
    } else {
      success =
          await ref.read(myServicesProvider.notifier).createService(formData);
    }

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isEditing ? 'Service updated!' : 'Service created!'),
          backgroundColor: AppColors.statusActive,
        ),
      );
      Navigator.pop(context, true);
    } else if (mounted) {
      final error = ref.read(myServicesProvider).error;
      if (error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(myServicesProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: isEditing ? 'Edit ' : 'Create ',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              const TextSpan(
                text: 'Service',
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
      body: UploadingOverlay.wrap(
        show: state.isSaving,
        child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Images
              _buildLabel('Images'),
              const SizedBox(height: 8),
              _buildImagePicker(),
              const SizedBox(height: 20),

              // Title
              _buildLabel('Service Title'),
              const SizedBox(height: 8),
              _buildTextField(_titleCtrl, 'Enter service title',
                  validator: (v) =>
                      v == null || v.isEmpty ? 'Title is required' : null),
              const SizedBox(height: 16),

              // Category
              _buildLabel('Category'),
              const SizedBox(height: 8),
              _buildCategoryDropdown(state),
              const SizedBox(height: 16),

              // Description
              _buildLabel('Description'),
              const SizedBox(height: 8),
              _buildTextField(_descCtrl, 'Describe your service',
                  maxLines: 4,
                  validator: (v) => v == null || v.isEmpty
                      ? 'Description is required'
                      : null),
              const SizedBox(height: 16),

              // Price
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Price From (RM)'),
                        const SizedBox(height: 8),
                        _buildTextField(_priceFromCtrl, '0.00',
                            keyboardType: TextInputType.number,
                            validator: (v) => v == null || v.isEmpty
                                ? 'Required'
                                : null),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Price To (RM)'),
                        const SizedBox(height: 8),
                        _buildTextField(_priceToCtrl, 'Optional',
                            keyboardType: TextInputType.number),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Delivery days
              _buildLabel('Delivery Days'),
              const SizedBox(height: 8),
              _buildTextField(_deliveryCtrl, 'e.g. 7',
                  keyboardType: TextInputType.number),
              const SizedBox(height: 16),

              // Availability
              _buildLabel('Availability'),
              const SizedBox(height: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  value: _alwaysAvailable,
                  activeThumbColor: AppColors.primary,
                  onChanged: (v) => setState(() => _alwaysAvailable = v),
                  title: const Text(
                    'Always Available',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textDark,
                    ),
                  ),
                  subtitle: Text(
                    _alwaysAvailable
                        ? 'Customers can book any date.'
                        : 'Tap dates below to mark when you are available.',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textGrey,
                    ),
                  ),
                ),
              ),

              // Inline availability calendar (only shown when not always available)
              if (!_alwaysAvailable) ...[
                const SizedBox(height: 16),
                _buildAvailabilityCalendar(),
              ],

              const SizedBox(height: 32),

              // Submit
              GradientButton(
                text: isEditing ? 'Update Service' : 'Create Service',
                icon: isEditing ? Icons.save : Icons.add,
                isLoading: state.isSaving,
                width: double.infinity,
                onPressed: _submit,
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        color: AppColors.textDark,
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String hint, {
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.primary),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.statusRejected),
        ),
      ),
    );
  }

  Widget _buildCategoryDropdown(MyServicesState state) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: _selectedCategoryId,
          isExpanded: true,
          hint: Text('Select category',
              style: TextStyle(color: Colors.grey.shade400, fontSize: 14)),
          items: state.categories
              .map((c) => DropdownMenuItem(
                    value: c.id,
                    child: Text(c.name),
                  ))
              .toList(),
          onChanged: (v) => setState(() => _selectedCategoryId = v),
        ),
      ),
    );
  }

  Widget _buildAvailabilityCalendar() {
    final calendarState = ref.watch(calendarProvider);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Text(
              'Tap a date to toggle availability',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textGrey,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 4),
          TableCalendar(
            firstDay: DateTime.now().subtract(const Duration(days: 1)),
            lastDay: DateTime.now().add(const Duration(days: 365)),
            focusedDay: _calendarFocusedDay,
            selectedDayPredicate: (day) =>
                isSameDay(_calendarSelectedDay, day),
            onDaySelected: (selected, focused) =>
                _onCalendarDayTapped(selected, focused, calendarState),
            onPageChanged: (focused) => _calendarFocusedDay = focused,
            calendarStyle: CalendarStyle(
              outsideDaysVisible: false,
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
            ),
            headerStyle: const HeaderStyle(
              formatButtonVisible: false,
              titleCentered: true,
              titleTextStyle: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.textDark,
              ),
              leftChevronIcon:
                  Icon(Icons.chevron_left, color: AppColors.primary),
              rightChevronIcon:
                  Icon(Icons.chevron_right, color: AppColors.primary),
            ),
            calendarBuilders: CalendarBuilders(
              defaultBuilder: (context, day, focusedDay) =>
                  _buildCalendarDayCell(day, calendarState),
              todayBuilder: (context, day, focusedDay) =>
                  _buildCalendarDayCell(day, calendarState, isToday: true),
              selectedBuilder: (context, day, focusedDay) =>
                  _buildCalendarDayCell(day, calendarState, isSelected: true),
            ),
          ),
          const SizedBox(height: 8),
          // Legend
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _CalendarLegendDot(
                  color: AppColors.statusActive,
                  label: 'Available',
                ),
                _CalendarLegendDot(
                  color: AppColors.statusPendingApproval,
                  label: 'Booked',
                ),
              ],
            ),
          ),
          if (calendarState.isSaving)
            const Padding(
              padding: EdgeInsets.only(top: 6),
              child: LinearProgressIndicator(
                color: AppColors.primary,
                minHeight: 2,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCalendarDayCell(
    DateTime day,
    CalendarState state, {
    bool isToday = false,
    bool isSelected = false,
  }) {
    final dateStr = _calendarDateFormat.format(day);
    final type = state.getDateType(dateStr);
    final isBooked = state.isBooked(dateStr);

    Color? bgColor;
    Color textColor = AppColors.textDark;

    if (isSelected) {
      bgColor = AppColors.primary;
      textColor = Colors.white;
    } else if (isBooked) {
      bgColor = AppColors.statusPendingApproval.withAlpha(30);
      textColor = AppColors.statusPendingApproval;
    } else if (type == 'available') {
      bgColor = AppColors.statusActive.withAlpha(30);
      textColor = AppColors.statusActive;
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
            fontWeight: (isToday || isSelected || type != null || isBooked)
                ? FontWeight.w700
                : FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Future<void> _onCalendarDayTapped(
    DateTime selected,
    DateTime focused,
    CalendarState state,
  ) async {
    setState(() {
      _calendarSelectedDay = selected;
      _calendarFocusedDay = focused;
    });

    final dateStr = _calendarDateFormat.format(selected);

    // Don't allow modifying booked dates
    if (state.isBooked(dateStr)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('This date is already booked.'),
          backgroundColor: AppColors.statusPendingApproval,
        ),
      );
      return;
    }

    final currentType = state.getDateType(dateStr);
    if (currentType == 'available') {
      // Tap again to remove
      await ref.read(calendarProvider.notifier).removeDate(dateStr);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Date removed'),
          backgroundColor: AppColors.statusActive,
          duration: Duration(seconds: 1),
        ),
      );
    } else {
      // Mark as available
      ref.read(calendarProvider.notifier).addLocalAvailability(
            dateStr,
            'available',
          );
      final ok = await ref.read(calendarProvider.notifier).updateDates([
        {'date': dateStr, 'type': 'available'},
      ]);
      if (!mounted) return;
      if (ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Date marked available'),
            backgroundColor: AppColors.statusActive,
            duration: Duration(seconds: 1),
          ),
        );
      }
    }
  }

  Widget _buildImagePicker() {
    final hasImages =
        _imageFiles.isNotEmpty || _existingImageUrls.isNotEmpty;

    if (!hasImages) {
      return GestureDetector(
        onTap: _pickImages,
        child: Container(
          height: 100,
          width: double.infinity,
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(8),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.primary.withAlpha(30),
              style: BorderStyle.solid,
            ),
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.add_photo_alternate,
                  color: AppColors.primary, size: 36),
              SizedBox(height: 8),
              Text(
                'Tap to add images',
                style: TextStyle(
                  color: AppColors.textGrey,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      height: 124,
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(8),
        children: [
          // Existing images first so the freelancer can see what's already
          // attached even after picking new ones.
          for (final url in _existingImageUrls)
            _ThumbTile(
              key: ValueKey(url),
              child: Image.network(
                url,
                width: 100,
                height: 100,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 100,
                  height: 100,
                  color: Colors.grey.shade200,
                  alignment: Alignment.center,
                  child: const Icon(Icons.broken_image,
                      color: AppColors.textGrey),
                ),
              ),
              onRemove: () => _removeExistingImage(url),
            ),
          for (int i = 0; i < _imageFiles.length; i++)
            _ThumbTile(
              key: ValueKey('new-$i-${_imageFiles[i].path}'),
              child: Image.file(
                _imageFiles[i],
                width: 100,
                height: 100,
                fit: BoxFit.cover,
              ),
              onRemove: () => _removeNewImage(i),
            ),
          GestureDetector(
            onTap: _pickImages,
            child: Container(
              width: 100,
              height: 100,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(10),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.add_photo_alternate,
                  color: AppColors.primary, size: 32),
            ),
          ),
        ],
      ),
    );
  }
}

class _ThumbTile extends StatelessWidget {
  final Widget child;
  final VoidCallback onRemove;

  const _ThumbTile({
    super.key,
    required this.child,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Stack(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: child,
          ),
          Positioned(
            top: 4,
            right: 4,
            child: GestureDetector(
              onTap: onRemove,
              child: Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.black.withAlpha(140),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.close,
                  size: 14,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CalendarLegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _CalendarLegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color.withAlpha(40),
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 1.5),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textGrey,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
