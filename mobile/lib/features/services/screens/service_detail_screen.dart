import 'package:flutter/material.dart';

class ServiceDetailScreen extends StatelessWidget {
  final String slug;
  const ServiceDetailScreen({super.key, required this.slug});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Service Detail')),
      body: Center(child: Text('Service: $slug')),
    );
  }
}
