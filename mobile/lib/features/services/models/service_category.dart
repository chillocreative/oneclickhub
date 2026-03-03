class ServiceCategoryModel {
  final int id;
  final String name;
  final int servicesCount;

  ServiceCategoryModel({
    required this.id,
    required this.name,
    this.servicesCount = 0,
  });

  factory ServiceCategoryModel.fromJson(Map<String, dynamic> json) {
    return ServiceCategoryModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      servicesCount: json['services_count'] ?? 0,
    );
  }
}
