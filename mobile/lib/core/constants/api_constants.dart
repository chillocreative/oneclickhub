class ApiConstants {
  // Production
  static const String baseUrl = 'https://oneclickhub.verranet.com/api/v1';

  // For Android Emulator → Laragon (dev):
  // static const String baseUrl = 'http://10.0.2.2:8000/api/v1';

  // For physical device, use your local IP:
  // static const String baseUrl = 'http://192.168.x.x:8000/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String user = '/auth/user';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // Services
  static const String services = '/services';
  static const String categories = '/categories';
  static const String myServices = '/my-services';

  // Advertisements
  static const String advertisements = '/advertisements';

  // Orders
  static const String orders = '/orders';
  static const String myOrders = '/my-orders';
  static const String myBookings = '/my-bookings';

  // Chat
  static const String chat = '/chat';
  static const String chatStart = '/chat/start';

  // Dashboard
  static const String dashboard = '/dashboard';

  // Subscriptions
  static const String plans = '/plans';
  static const String subscribePay = '/subscribe/pay';
  static const String subscriptionCancel = '/subscription/cancel';

  // Calendar
  static const String calendar = '/calendar';

  // Settings
  static const String profile = '/profile';
  static const String bankingDetail = '/settings/banking';
  static const String ssmCertificate = '/settings/ssm';
  static const String ssmUpload = '/settings/ssm-upload';

  // Notifications
  static const String markNotificationsRead = '/notifications/mark-read';

  // Admin
  static const String adminUsers = '/admin/users';
  static const String adminOrders = '/admin/orders';
  static const String adminCategories = '/admin/categories';
  static const String adminSsmVerifications = '/admin/ssm-verifications';
  static const String adminTransactions = '/admin/transactions';
  static const String adminPlans = '/admin/plans';
  static const String adminDashboard = '/admin/dashboard';
  static const String adminSettings = '/admin/settings';
}
