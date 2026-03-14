import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../api/api_client.dart';
import '../constants/app_colors.dart';
import '../services/push_notification_service.dart';
import '../../features/notifications/providers/notifications_provider.dart';

class ShellScaffold extends ConsumerStatefulWidget {
  final Widget child;

  const ShellScaffold({super.key, required this.child});

  @override
  ConsumerState<ShellScaffold> createState() => _ShellScaffoldState();
}

class _ShellScaffoldState extends ConsumerState<ShellScaffold>
    with WidgetsBindingObserver {
  DateTime? _lastBackPress;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Register FCM token when shell is ready (user is authenticated)
    _registerFcmToken();
    // Load notifications
    ref.read(notificationsProvider.notifier).loadNotifications();
  }

  void _registerFcmToken() {
    final dio = ref.read(dioProvider);
    PushNotificationService().setDio(dio);
    PushNotificationService().registerToken();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      final authState = ref.read(authProvider);
      if (authState.isAuthenticated) {
        ref.read(authProvider.notifier).fetchUser();
        _registerFcmToken();
        ref.read(notificationsProvider.notifier).loadNotifications();
      }
    }
  }

  int _calculateSelectedIndex(BuildContext context, bool isFreelancer) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location == '/dashboard') return 0;
    if (location == '/chat') return 1;
    // Index 2 is the center FAB (create service) — no tab selection
    if (location == '/orders' || location == '/bookings') return 3;
    if (location == '/settings') return 4;
    return 0;
  }

  void _onItemTapped(BuildContext context, int index, bool isFreelancer) {
    switch (index) {
      case 0:
        context.go('/dashboard');
        break;
      case 1:
        context.go('/chat');
        break;
      case 2:
        // Center button — navigate to create service
        if (isFreelancer) {
          context.push('/my-services/create');
        } else {
          context.go('/services');
        }
        break;
      case 3:
        context.go(isFreelancer ? '/orders' : '/bookings');
        break;
      case 4:
        context.go('/settings');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final isFreelancer = user?.isFreelancer ?? false;
    final selectedIndex = _calculateSelectedIndex(context, isFreelancer);

    final location = GoRouterState.of(context).matchedLocation;
    final isRootTab = location == '/dashboard' || location == '/chat' ||
        location == '/orders' || location == '/bookings' || location == '/settings';

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;

        // If not on a root tab, navigate back normally
        if (!isRootTab) {
          if (Navigator.of(context).canPop()) {
            Navigator.of(context).pop();
          } else {
            context.go('/dashboard');
          }
          return;
        }

        // If on a non-dashboard root tab, go to dashboard first
        if (location != '/dashboard') {
          context.go('/dashboard');
          return;
        }

        // On dashboard: double-tap to exit
        final now = DateTime.now();
        if (_lastBackPress != null &&
            now.difference(_lastBackPress!) < const Duration(seconds: 2)) {
          SystemNavigator.pop();
        } else {
          _lastBackPress = now;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Press back again to exit'),
              duration: Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
      child: Scaffold(
        body: widget.child,
        bottomNavigationBar: _AnimatedBottomBar(
          selectedIndex: selectedIndex,
          isFreelancer: isFreelancer,
          onTap: (index) => _onItemTapped(context, index, isFreelancer),
        ),
      ),
    );
  }
}

class _AnimatedBottomBar extends StatelessWidget {
  final int selectedIndex;
  final bool isFreelancer;
  final ValueChanged<int> onTap;

  const _AnimatedBottomBar({
    required this.selectedIndex,
    required this.isFreelancer,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(Icons.dashboard_outlined, Icons.dashboard, 0),
      _NavItem(Icons.chat_bubble_outline, Icons.chat_bubble, 1),
      _NavItem(Icons.add, Icons.add, 2), // center FAB placeholder
      _NavItem(Icons.receipt_long_outlined, Icons.receipt_long, 3),
      _NavItem(Icons.person_outlined, Icons.person, 4),
    ];

    return Container(
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
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 65,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.map((item) {
              if (item.index == 2) {
                // Center FAB button
                return _CenterFab(
                  onTap: () => onTap(2),
                  isFreelancer: isFreelancer,
                );
              }
              final isSelected = selectedIndex == item.index;
              return _NavBarItem(
                icon: item.icon,
                activeIcon: item.activeIcon,
                isSelected: isSelected,
                onTap: () => onTap(item.index),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final int index;

  _NavItem(this.icon, this.activeIcon, this.index);
}

class _NavBarItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.icon,
    required this.activeIcon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 56,
        height: 65,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary.withAlpha(30)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
              ),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                transitionBuilder: (child, animation) {
                  return ScaleTransition(
                    scale: animation,
                    child: FadeTransition(opacity: animation, child: child),
                  );
                },
                child: Icon(
                  isSelected ? activeIcon : icon,
                  key: ValueKey(isSelected),
                  color: isSelected ? AppColors.primary : AppColors.textGrey,
                  size: 24,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CenterFab extends StatelessWidget {
  final VoidCallback onTap;
  final bool isFreelancer;

  const _CenterFab({required this.onTap, required this.isFreelancer});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withAlpha(80),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(
          isFreelancer ? Icons.add : Icons.search,
          color: Colors.white,
          size: 28,
        ),
      ),
    );
  }
}
