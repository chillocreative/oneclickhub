class Review {
  final int id;
  final int rating;
  final String? comment;
  final String? freelancerResponse;
  final String? respondedAt;
  final String? createdAt;
  final ReviewParty? customer;
  final ReviewParty? freelancer;
  final ReviewService? service;

  Review({
    required this.id,
    required this.rating,
    this.comment,
    this.freelancerResponse,
    this.respondedAt,
    this.createdAt,
    this.customer,
    this.freelancer,
    this.service,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? 0,
      rating: (json['rating'] is int)
          ? json['rating'] as int
          : int.tryParse(json['rating']?.toString() ?? '0') ?? 0,
      comment: json['comment']?.toString(),
      freelancerResponse: json['freelancer_response']?.toString(),
      respondedAt: json['responded_at']?.toString(),
      createdAt: json['created_at']?.toString(),
      customer: json['customer'] != null
          ? ReviewParty.fromJson(json['customer'])
          : null,
      freelancer: json['freelancer'] != null
          ? ReviewParty.fromJson(json['freelancer'])
          : null,
      service: json['service'] != null
          ? ReviewService.fromJson(json['service'])
          : null,
    );
  }

  bool get hasReply =>
      freelancerResponse != null && freelancerResponse!.trim().isNotEmpty;
}

class ReviewParty {
  final int id;
  final String name;

  ReviewParty({required this.id, required this.name});

  factory ReviewParty.fromJson(Map<String, dynamic> json) {
    return ReviewParty(
      id: json['id'] ?? 0,
      name: json['name']?.toString() ?? '',
    );
  }
}

class ReviewService {
  final int id;
  final String title;
  final String? slug;

  ReviewService({required this.id, required this.title, this.slug});

  factory ReviewService.fromJson(Map<String, dynamic> json) {
    return ReviewService(
      id: json['id'] ?? 0,
      title: json['title']?.toString() ?? '',
      slug: json['slug']?.toString(),
    );
  }
}
