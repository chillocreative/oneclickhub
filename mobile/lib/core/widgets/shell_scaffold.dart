import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../constants/app_colors.dart';

class ShellScaffold extends ConsumerWidget {
  final Widget child;

  const ShellScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isFreelancer = user?.isFreelancer ?? false;
    final isAdmin = user?.isAdmin ?? false;

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(15),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          height: 65,
          elevation: 0,
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          indicatorColor: AppColors.primary.withAlpha(30),
          selectedIndex: _calculateSelectedIndex(context, isFreelancer),
          onDestinationSelected: (index) =>
              _onItemTapped(context, index, isFreelancer, isAdmin),
          destinations: _buildDestinations(isFreelancer, isAdmin),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        ),
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context, bool isFreelancer) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location == '/dashboard') return 0;
    if (location == '/services') return 1;
    if (location == '/orders' || location == '/bookings') return 2;
    if (location == '/chat') return 3;
    if (location == '/settings') return 4;
    return 0;
  }

  void _onItemTapped(
      BuildContext context, int index, bool isFreelancer, bool isAdmin) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/services');
        break;
      case 2:
        context.go(isFreelancer ? '/orders' : '/bookings');
        break;
      case 3:
        context.go('/chat');
        break;
      case 4:
        context.go('/settings');
        break;
    }
  }

  List<NavigationDestination> _buildDestinations(
      bool isFreelancer, bool isAdmin) {
    return [
      const NavigationDestination(
        icon: Icon(Icons.dashboard_outlined),
        selectedIcon: Icon(Icons.dashboard),
        label: 'Dashboard',
      ),
      const NavigationDestination(
        icon: Icon(Icons.work_outline),
        selectedIcon: Icon(Icons.work),
        label: 'Services',
      ),
      NavigationDestination(
        icon: const Icon(Icons.receipt_long_outlined),
        selectedIcon: const Icon(Icons.receipt_long),
        label: isFreelancer ? 'Orders' : 'Bookings',
      ),
      const NavigationDestination(
        icon: Icon(Icons.chat_outlined),
        selectedIcon: Icon(Icons.chat),
        label: 'Chat',
      ),
      const NavigationDestination(
        icon: Icon(Icons.person_outlined),
        selectedIcon: Icon(Icons.person),
        label: 'Profile',
      ),
    ];
  }
}
