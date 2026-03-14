import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../api/api_client.dart';
import '../constants/app_colors.dart';
import '../services/push_notification_service.dart';

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
    if (location == '/auth/login') selectedIndex = 3;

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
          selectedIndex: selectedIndex,
          onDestinationSelected: (index) {
            switch (index) {
              case 0:
                context.go('/home');
                break;
              case 1:
                context.go('/auth/register');
                break;
              case 2:
                context.go('/auth/login');
                break;
              case 3:
                context.go('/auth/login');
                break;
            }
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: '',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_add_outlined),
              selectedIcon: Icon(Icons.person_add),
              label: '',
            ),
            NavigationDestination(
              icon: Icon(Icons.search_outlined),
              selectedIcon: Icon(Icons.search),
              label: '',
            ),
            NavigationDestination(
              icon: Icon(Icons.login_outlined),
              selectedIcon: Icon(Icons.login),
              label: '',
            ),
          ],
          labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
        ),
      ),
    );
  }
}
