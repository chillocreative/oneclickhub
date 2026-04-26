import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/change_password_screen.dart';
import '../../features/splash/screens/splash_screen.dart';
import '../../features/onboarding/screens/onboarding_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/services/screens/browse_services_screen.dart';
import '../../features/services/screens/guest_browse_services_screen.dart';
import '../../features/services/screens/service_detail_screen.dart';
import '../../features/services/screens/my_services_screen.dart';
import '../../features/services/screens/create_service_screen.dart';
import '../../features/orders/screens/order_detail_screen.dart';
import '../../features/orders/screens/my_orders_screen.dart';
import '../../features/orders/screens/my_bookings_screen.dart';
import '../../features/orders/screens/my_reviews_screen.dart';
import '../../features/chat/screens/conversations_screen.dart';
import '../../features/chat/screens/chat_screen.dart';
import '../../features/subscriptions/screens/plans_screen.dart';
import '../../features/subscriptions/screens/madani_application_screen.dart';
import '../../features/calendar/screens/calendar_screen.dart';
import '../../features/settings/screens/profile_screen.dart';
import '../../features/settings/screens/banking_screen.dart';
import '../../features/settings/screens/ssm_screen.dart';
import '../../features/settings/screens/webview_page_screen.dart';
import '../../features/home/screens/guest_home_screen.dart';
import '../../features/home/screens/halal_restaurants_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../widgets/shell_scaffold.dart';
import '../widgets/guest_shell_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final isAuthenticated = ref.watch(authProvider.select((s) => s.isAuthenticated));
  final mustChangePassword = ref.watch(
    authProvider.select((s) => s.user?.mustChangePassword ?? false),
  );

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuth = isAuthenticated;
      final isSplash = state.matchedLocation == '/splash';
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      final isGuestHome = state.matchedLocation == '/home';
      final isChangePassword = state.matchedLocation == '/auth/change-password';

      // Let splash and onboarding screens handle their own navigation
      final isOnboarding = state.matchedLocation == '/onboarding';
      if (isSplash || isOnboarding) return null;

      // Force password change after a Sendora-issued temporary password.
      if (isAuth && mustChangePassword && !isChangePassword) {
        return '/auth/change-password';
      }

      // Allow unauthenticated users to access /home, /auth, and guest routes
      final isGuestRoute = state.matchedLocation == '/halal-restaurants' ||
          state.matchedLocation == '/notifications' ||
          state.matchedLocation == '/browse-services';
      if (!isAuth && !isAuthRoute && !isGuestHome && !isGuestRoute) {
        return '/home';
      }
      // Redirect authenticated users away from guest/auth routes
      // (but allow change-password since we just routed them there)
      if (isAuth && (isAuthRoute || isGuestHome) && !isChangePassword) {
        return '/dashboard';
      }
      return null;
    },
    routes: [
      // Splash screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Onboarding screen (first-time install)
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Auth routes (no shell)
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        name: 'forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/auth/change-password',
        name: 'change-password',
        builder: (context, state) => const ChangePasswordScreen(),
      ),
      GoRoute(
        path: '/madani-application',
        name: 'madani-application',
        builder: (context, state) => const MadaniApplicationScreen(),
      ),
      GoRoute(
        path: '/my-reviews',
        name: 'my-reviews',
        builder: (context, state) => const MyReviewsScreen(),
      ),

      // Guest home with guest bottom navigation
      ShellRoute(
        builder: (context, state, child) => GuestShellScaffold(child: child),
        routes: [
          GoRoute(
            path: '/home',
            name: 'guest-home',
            builder: (context, state) => const GuestHomeScreen(),
          ),
          GoRoute(
            path: '/auth/register',
            name: 'register',
            builder: (context, state) => const RegisterScreen(),
          ),
          GoRoute(
            path: '/halal-restaurants',
            name: 'halal-restaurants',
            builder: (context, state) => const HalalRestaurantsScreen(),
          ),
        ],
      ),

      // App routes with bottom navigation
      ShellRoute(
        builder: (context, state, child) => ShellScaffold(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            name: 'dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/services',
            name: 'browse-services',
            builder: (context, state) => const BrowseServicesScreen(),
          ),
          GoRoute(
            path: '/orders',
            name: 'my-orders',
            builder: (context, state) => const MyOrdersScreen(),
          ),
          GoRoute(
            path: '/bookings',
            name: 'my-bookings',
            builder: (context, state) => const MyBookingsScreen(),
          ),
          GoRoute(
            path: '/chat',
            name: 'chat-list',
            builder: (context, state) => const ConversationsScreen(),
          ),
          GoRoute(
            path: '/settings',
            name: 'settings',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/my-services',
            name: 'my-services',
            builder: (context, state) => const MyServicesScreen(),
          ),
        ],
      ),

      // Notifications (no shell — accessible by both guests and authenticated)
      GoRoute(
        path: '/notifications',
        name: 'notifications',
        builder: (context, state) {
          final isGuest = state.uri.queryParameters['guest'] == 'true';
          return NotificationsScreen(isGuest: isGuest);
        },
      ),

      // Guest browse services (no shell — has its own back button)
      GoRoute(
        path: '/browse-services',
        name: 'guest-browse-services',
        builder: (context, state) {
          final categoryParam = state.uri.queryParameters['category'];
          final categoryId = categoryParam == null
              ? null
              : int.tryParse(categoryParam);
          return GuestBrowseServicesScreen(initialCategoryId: categoryId);
        },
      ),

      // Detail routes (no shell)
      GoRoute(
        path: '/services/:slug',
        name: 'service-detail',
        builder: (context, state) => ServiceDetailScreen(
          slug: state.pathParameters['slug']!,
        ),
      ),
      GoRoute(
        path: '/my-services/create',
        name: 'create-service',
        builder: (context, state) => const CreateServiceScreen(),
      ),
      GoRoute(
        path: '/orders/:id',
        name: 'order-detail',
        builder: (context, state) => OrderDetailScreen(
          orderId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: '/chat/:id',
        name: 'chat-detail',
        builder: (context, state) => ChatScreen(
          conversationId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: '/plans',
        name: 'plans',
        builder: (context, state) => const PlansScreen(),
      ),
      GoRoute(
        path: '/calendar',
        name: 'calendar',
        builder: (context, state) => const CalendarScreen(),
      ),
      GoRoute(
        path: '/settings/banking',
        name: 'banking',
        builder: (context, state) => const BankingScreen(),
      ),
      GoRoute(
        path: '/settings/ssm',
        name: 'ssm',
        builder: (context, state) => const SsmScreen(),
      ),
      GoRoute(
        path: '/settings/about',
        name: 'about',
        // The About Us copy lives at /about on the web so it can be edited
        // without shipping a new app release. ?embedded=1 strips the top
        // nav and card chrome so it blends with the native shell.
        builder: (context, state) => const WebViewPageScreen(
          title: 'About Us',
          url: 'https://oneclickhub.com.my/about?embedded=1',
        ),
      ),
      GoRoute(
        path: '/settings/privacy-policy',
        name: 'privacy-policy',
        builder: (context, state) => const WebViewPageScreen(
          title: 'Privacy Policy',
          url: 'https://oneclickhub.com.my/privacy',
        ),
      ),
      GoRoute(
        path: '/settings/terms',
        name: 'terms',
        builder: (context, state) => const WebViewPageScreen(
          title: 'Terms & Conditions',
          url: 'https://oneclickhub.com.my/terms',
        ),
      ),
    ],
  );
});
