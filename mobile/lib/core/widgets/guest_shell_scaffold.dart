import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../api/api_client.dart';
import '../constants/app_colors.dart';
import '../services/push_notification_service.dart';
import '../../features/notifications/providers/notifications_provider.dart';

class GuestShellScaffold extends ConsumerStatefulWidget {
  final Widget child;

  const GuestShellScaffold({super.key, required this.child});

  @override
  ConsumerState<GuestShellScaffold> createState() => _GuestShellScaffoldState();
}

class _GuestShellScaffoldState extends ConsumerState<GuestShellScaffold> {
  @override
  void initState() {
    super.initState();
    _registerGuestFcmToken();
    ref.read(notificationsProvider.notifier).loadNotifications(isGuest: true);
  }

  void _registerGuestFcmToken() {
    final dio = ref.read(dioProvider);
    PushNotificationService().setDio(dio);
    PushNotificationService().registerGuestToken();
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    int selectedIndex = 0;
    if (location == '/home') selectedIndex = 0;
    if (location == '/auth/register') selectedIndex = 1;
    if (location == '/halal-restaurants') selectedIndex = 2;
    if (location == '/auth/login') selectedIndex = 3;

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: _GuestBottomBar(
        selectedIndex: selectedIndex,
        onTap: (index) {
          switch (index) {
            case 0:
              context.go('/home');
              break;
            case 1:
              context.go('/auth/register');
              break;
            case 2:
              context.go('/halal-restaurants');
              break;
            case 3:
              context.go('/auth/login');
              break;
          }
        },
      ),
    );
  }
}

class _GuestBottomBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onTap;

  const _GuestBottomBar({required this.selectedIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    const items = [
      _GuestNavItem(Icons.home_outlined, Icons.home, 'HOME'),
      _GuestNavItem(Icons.person_add_outlined, Icons.person_add, 'REGISTER'),
      _GuestNavItem(Icons.restaurant_outlined, Icons.restaurant, 'RESTAURANT'),
      _GuestNavItem(Icons.login_outlined, Icons.login, 'LOGIN'),
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
          height: 78,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (i) {
              final item = items[i];
              return _GuestNavBarItem(
                icon: item.icon,
                activeIcon: item.activeIcon,
                label: item.label,
                isSelected: selectedIndex == i,
                onTap: () => onTap(i),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _GuestNavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _GuestNavItem(this.icon, this.activeIcon, this.label);
}

class _GuestNavBarItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _GuestNavBarItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 72,
        height: 78,
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
                transitionBuilder: (child, animation) => ScaleTransition(
                  scale: animation,
                  child: FadeTransition(opacity: animation, child: child),
                ),
                child: Icon(
                  isSelected ? activeIcon : icon,
                  key: ValueKey(isSelected),
                  color: isSelected ? AppColors.primary : AppColors.textGrey,
                  size: 22,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
                color: isSelected ? AppColors.primary : AppColors.textGrey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
