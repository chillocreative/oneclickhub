import 'dart:io';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/gradient_button.dart';
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
  List<File> _imageFiles = [];
  List<String> _existingImageUrls = [];

  bool get isEditing => widget.existingService != null;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(myServicesProvider.notifier).loadCategories();
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
      final images = s['images'];
      if (images is List) {
        _existingImageUrls = images.map((e) => e.toString()).toList();
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

  Future<void> _pickImages() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: true,
    );
    if (result != null) {
      setState(() {
        _imageFiles = result.paths
            .where((p) => p != null)
            .map((p) => File(p!))
            .toList();
        _existingImageUrls = [];
      });
    }
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
    });

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
      body: SingleChildScrollView(
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

  Widget _buildImagePicker() {
    final hasImages =
        _imageFiles.isNotEmpty || _existingImageUrls.isNotEmpty;

    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        height: hasImages ? 120 : 100,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.grey.shade200,
            style: hasImages ? BorderStyle.solid : BorderStyle.none,
          ),
        ),
        child: hasImages
            ? ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.all(8),
                children: [
                  ..._imageFiles.map((f) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(f,
                              width: 100, height: 100, fit: BoxFit.cover),
                        ),
                      )),
                  ..._existingImageUrls.map((url) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(url,
                              width: 100, height: 100, fit: BoxFit.cover),
                        ),
                      )),
                  GestureDetector(
                    onTap: _pickImages,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(10),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.add_photo_alternate,
                          color: AppColors.primary, size: 32),
                    ),
                  ),
                ],
              )
            : Container(
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
      ),
    );
  }
}
