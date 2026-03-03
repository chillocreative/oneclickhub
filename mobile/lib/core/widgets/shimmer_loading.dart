import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerLoading extends StatelessWidget {
  final ShimmerType type;

  const ShimmerLoading({super.key, this.type = ShimmerType.list});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade200,
      highlightColor: Colors.grey.shade50,
      child: _buildContent(),
    );
  }

  Widget _buildContent() {
    switch (type) {
      case ShimmerType.dashboard:
        return _buildDashboardShimmer();
      case ShimmerType.grid:
        return _buildGridShimmer();
      case ShimmerType.list:
        return _buildListShimmer();
      case ShimmerType.profile:
        return _buildProfileShimmer();
    }
  }

  Widget _buildDashboardShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _box(double.infinity, 120, 32),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: _box(double.infinity, 100, 32)),
              const SizedBox(width: 12),
              Expanded(child: _box(double.infinity, 100, 32)),
              const SizedBox(width: 12),
              Expanded(child: _box(double.infinity, 100, 32)),
            ],
          ),
          const SizedBox(height: 20),
          _box(double.infinity, 200, 32),
        ],
      ),
    );
  }

  Widget _buildGridShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _box(double.infinity, 48, 24),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _box(double.infinity, 220, 32)),
              const SizedBox(width: 12),
              Expanded(child: _box(double.infinity, 220, 32)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _box(double.infinity, 220, 32)),
              const SizedBox(width: 12),
              Expanded(child: _box(double.infinity, 220, 32)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildListShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: List.generate(
          4,
          (i) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _box(double.infinity, 100, 32),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileShimmer() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _box(80, 80, 40),
          const SizedBox(height: 20),
          _box(200, 20, 8),
          const SizedBox(height: 8),
          _box(150, 16, 8),
          const SizedBox(height: 24),
          _box(double.infinity, 56, 12),
          const SizedBox(height: 12),
          _box(double.infinity, 56, 12),
          const SizedBox(height: 12),
          _box(double.infinity, 56, 12),
        ],
      ),
    );
  }

  Widget _box(double width, double height, double radius) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

enum ShimmerType { dashboard, grid, list, profile }
