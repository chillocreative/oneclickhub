import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../constants/app_colors.dart';
import '../storage/token_storage.dart';

class AppWebViewScreen extends StatefulWidget {
  final String title;
  final String webPath;
  final IconData? icon;

  const AppWebViewScreen({
    super.key,
    required this.title,
    required this.webPath,
    this.icon,
  });

  @override
  State<AppWebViewScreen> createState() => _AppWebViewScreenState();
}

class _AppWebViewScreenState extends State<AppWebViewScreen> {
  late WebViewController _controller;
  bool _isLoading = true;
  double _loadingProgress = 0;

  static const String _baseUrl = 'https://oneclickhub.verranet.com';

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    final token = await TokenStorage.getToken();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _isLoading = true);
          },
          onProgress: (progress) {
            if (mounted) {
              setState(() => _loadingProgress = progress / 100.0);
            }
          },
          onPageFinished: (url) {
            if (mounted) setState(() => _isLoading = false);
            // Inject token cookie for auth
            if (token != null) {
              _controller.runJavaScript('''
                document.cookie = "api_token=$token; path=/; SameSite=Lax";
                if (window.localStorage) {
                  window.localStorage.setItem('api_token', '$token');
                }
              ''');
            }
          },
          onWebResourceError: (error) {
            if (mounted) setState(() => _isLoading = false);
          },
        ),
      )
      ..setUserAgent('OneClickHub-Mobile/1.0');

    // Build URL with token parameter for authentication
    final url = token != null
        ? '$_baseUrl${widget.webPath}?mobile_token=$token'
        : '$_baseUrl${widget.webPath}';

    _controller.loadRequest(Uri.parse(url));

    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            if (widget.icon != null) ...[
              Icon(widget.icon, color: AppColors.primary, size: 22),
              const SizedBox(width: 8),
            ],
            Text(
              widget.title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppColors.textDark,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textGrey),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Loading bar
          if (_isLoading)
            LinearProgressIndicator(
              value: _loadingProgress,
              backgroundColor: Colors.grey[200],
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
              minHeight: 2,
            ),
          // WebView
          Expanded(
            child: WebViewWidget(controller: _controller),
          ),
        ],
      ),
    );
  }
}
