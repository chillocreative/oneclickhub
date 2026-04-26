class User {
  final int id;
  final String name;
  final String phoneNumber;
  final String? address;
  final String? email;
  final String? position;
  final String? identityDocument;
  final String? profilePictureUrl;
  final String? businessName;
  final bool mustChangePassword;
  final List<String> roles;
  final Map<String, dynamic>? subscription;
  final Map<String, dynamic>? ssmVerification;
  final Map<String, dynamic>? bankingDetail;
  final String? createdAt;

  User({
    required this.id,
    required this.name,
    required this.phoneNumber,
    this.address,
    this.email,
    this.position,
    this.identityDocument,
    this.profilePictureUrl,
    this.businessName,
    this.mustChangePassword = false,
    this.roles = const [],
    this.subscription,
    this.ssmVerification,
    this.bankingDetail,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      phoneNumber: json['phone_number'] ?? '',
      address: json['address']?.toString(),
      email: json['email'],
      position: json['position'],
      identityDocument: json['identity_document'],
      profilePictureUrl: json['profile_picture_url'],
      businessName: json['business_name'],
      mustChangePassword: json['must_change_password'] == true,
      roles: json['roles'] != null
          ? List<String>.from(json['roles'])
          : [],
      subscription: json['subscription'] != null
          ? Map<String, dynamic>.from(json['subscription'])
          : null,
      ssmVerification: json['ssm_verification'] != null
          ? Map<String, dynamic>.from(json['ssm_verification'])
          : null,
      bankingDetail: json['banking_detail'] != null
          ? Map<String, dynamic>.from(json['banking_detail'])
          : null,
      createdAt: json['created_at'],
    );
  }

  bool get isAdmin => roles.contains('Admin');
  bool get isFreelancer => roles.contains('Freelancer');
  bool get isCustomer => roles.contains('Customer');

  String get primaryRole {
    if (isAdmin) return 'Admin';
    if (isFreelancer) return 'Freelancer';
    if (isCustomer) return 'Customer';
    return 'General User';
  }
}
