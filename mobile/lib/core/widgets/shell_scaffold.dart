import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../constants/app_colors.dart';

class ShellScaffold extends ConsumerStatefulWidget {
  final Widget child;

  const ShellScaffold({super.key, required this.child});

  @override
  ConsumerState<ShellScaffold> createState() => _ShellScaffoldState();
}

class _ShellScaffoldState extends ConsumerState<ShellScaffold>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Refresh user data when app comes back to foreground
      // This picks up admin-approved subscriptions, SSM verifications, etc.
      final authState = ref.read(authProvider);
      if (authState.isAuthenticated) {
        ref.read(authProvider.notifier).fetchUser();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isFreelancer = user?.isFreelancer ?? false;
    final isAdmin = user?.isAdmin ?? false;

    return Scaffold(
      body: widget.child,
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
          labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
        ),
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context, bool isFreelancer) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location == '/dashboard') return 0;
    if (location == '/chat') return 1;
    if (location == '/orders' || location == '/bookings') return 2;
    if (location == '/settings') return 3;
    return 0;
  }

  void _onItemTapped(
      BuildContext context, int index, bool isFreelancer, bool isAdmin) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/chat');
        break;
      case 2:
        context.go(isFreelancer ? '/orders' : '/bookings');
        break;
      case 3:
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
        label: '',
      ),
      const NavigationDestination(
        icon: Icon(Icons.chat_bubble_outline),
        selectedIcon: Icon(Icons.chat_bubble),
        label: '',
      ),
      const NavigationDestination(
        icon: Icon(Icons.receipt_long_outlined),
        selectedIcon: Icon(Icons.receipt_long),
        label: '',
      ),
      const NavigationDestination(
        icon: Icon(Icons.person_outlined),
        selectedIcon: Icon(Icons.person),
        label: '',
      ),
    ];
  }
}
