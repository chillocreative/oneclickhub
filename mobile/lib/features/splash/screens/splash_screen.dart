import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _glowController;
  late AnimationController _textController;
  late AnimationController _taglineController;
  late AnimationController _particleController;

  late Animation<double> _logoScale;
  late Animation<double> _logoRotation;
  late Animation<double> _glowPulse;
  late Animation<double> _taglineOpacity;
  late Animation<double> _taglineSlide;

  // Each letter animates individually
  static const _oneclick = 'ONECLICK';
  static const _hub = 'HUB';
  static const _totalLetters = 11; // ONECLICK(8) + HUB(3)

  @override
  void initState() {
    super.initState();

    // Logo — drops in with slight rotation
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _logoScale = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: Curves.elasticOut,
      ),
    );
    _logoRotation = Tween<double>(begin: -0.1, end: 0.0).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0.3, 1.0, curve: Curves.easeOutBack),
      ),
    );

    // Glow pulse behind logo
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _glowPulse = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    // Letter-by-letter text reveal
    _textController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );

    // Tagline fade in
    _taglineController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _taglineOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _taglineController, curve: Curves.easeIn),
    );
    _taglineSlide = Tween<double>(begin: 15.0, end: 0.0).animate(
      CurvedAnimation(parent: _taglineController, curve: Curves.easeOutCubic),
    );

    // Floating particles
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _startSequence();
  }

  Future<void> _startSequence() async {
    await Future.delayed(const Duration(milliseconds: 400));
    _logoController.forward();

    await Future.delayed(const Duration(milliseconds: 1200));
    _textController.forward();

    await Future.delayed(const Duration(milliseconds: 800));
    _taglineController.forward();

    await Future.delayed(const Duration(milliseconds: 2600));
    if (mounted) _navigateNext();
  }

  void _navigateNext() {
    final authState = ref.read(authProvider);
    if (authState.isAuthenticated) {
      context.go('/dashboard');
    } else {
      context.go('/home');
    }
  }

  @override
  void dispose() {
    _logoController.dispose();
    _glowController.dispose();
    _textController.dispose();
    _taglineController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment(0.0, -0.3),
                radius: 1.4,
                colors: [
                  AppColors.splashTopLeft,
                  AppColors.splashCenter,
                  AppColors.splashBottomRight,
                ],
                stops: [0.0, 0.5, 1.0],
              ),
            ),
          ),

          // Floating particles
          AnimatedBuilder(
            animation: _particleController,
            builder: (context, _) => CustomPaint(
              size: MediaQuery.of(context).size,
              painter: _ParticlePainter(_particleController.value),
            ),
          ),

          // Main content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo with glow
                AnimatedBuilder(
                  animation: Listenable.merge([_logoController, _glowController]),
                  builder: (context, child) {
                    return Transform.rotate(
                      angle: _logoRotation.value,
                      child: Transform.scale(
                        scale: _logoScale.value,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            // Glow ring
                            Container(
                              width: 160 * _glowPulse.value,
                              height: 160 * _glowPulse.value,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withAlpha(
                                      (30 * _glowPulse.value).toInt(),
                                    ),
                                    blurRadius: 40,
                                    spreadRadius: 15,
                                  ),
                                ],
                              ),
                            ),
                            // Logo image
                            Container(
                              width: 130,
                              height: 130,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(15),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: ClipOval(
                                child: Image.asset(
                                  'assets/images/logo.png',
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 40),

                // Letter-by-letter text
                AnimatedBuilder(
                  animation: _textController,
                  builder: (context, _) {
                    return Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // ONECLICK
                        ..._buildLetters(
                          _oneclick,
                          0,
                          const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textDark,
                            letterSpacing: 1.5,
                          ),
                        ),
                        // HUB
                        ..._buildLetters(
                          _hub,
                          _oneclick.length,
                          const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    );
                  },
                ),

                const SizedBox(height: 14),

                // Tagline
                AnimatedBuilder(
                  animation: _taglineController,
                  builder: (context, child) {
                    return Opacity(
                      opacity: _taglineOpacity.value,
                      child: Transform.translate(
                        offset: Offset(0, _taglineSlide.value),
                        child: child,
                      ),
                    );
                  },
                  child: const Text(
                    'Connecting All',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textGrey,
                      letterSpacing: 4,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildLetters(String text, int startIndex, TextStyle style) {
    return List.generate(text.length, (i) {
      final globalIndex = startIndex + i;
      // Each letter has its own interval within the animation
      final start = (globalIndex / _totalLetters) * 0.7;
      final end = (start + 0.3).clamp(0.0, 1.0);

      final letterProgress = Interval(start, end, curve: Curves.easeOutBack);
      final progress = letterProgress.transform(_textController.value);

      return Transform.translate(
        offset: Offset(0, 20 * (1 - progress)),
        child: Opacity(
          opacity: progress.clamp(0.0, 1.0),
          child: Transform.scale(
            scale: 0.5 + (0.5 * progress),
            child: Text(text[i], style: style),
          ),
        ),
      );
    });
  }
}

class _ParticlePainter extends CustomPainter {
  final double progress;

  _ParticlePainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    final particles = [
      _Particle(0.1, 0.2, 4, AppColors.primary.withAlpha(20)),
      _Particle(0.85, 0.12, 5, AppColors.primaryLight.withAlpha(18)),
      _Particle(0.25, 0.75, 3, AppColors.primary.withAlpha(12)),
      _Particle(0.9, 0.55, 4, AppColors.gradientEnd.withAlpha(22)),
      _Particle(0.5, 0.88, 3, AppColors.primary.withAlpha(16)),
      _Particle(0.12, 0.48, 3, AppColors.primaryLight.withAlpha(14)),
      _Particle(0.72, 0.35, 4, AppColors.gradientEnd.withAlpha(18)),
      _Particle(0.38, 0.28, 3, AppColors.primary.withAlpha(15)),
      _Particle(0.6, 0.65, 3, AppColors.primaryLight.withAlpha(12)),
      _Particle(0.78, 0.82, 4, AppColors.primary.withAlpha(16)),
    ];

    for (final p in particles) {
      final dx = p.x * size.width +
          sin(progress * pi * 2 + p.y * pi * 3) * 8;
      final dy = p.y * size.height +
          cos(progress * pi * 2 + p.x * pi * 2) * 12;
      paint.color = p.color;
      canvas.drawCircle(Offset(dx, dy), p.radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _ParticlePainter oldDelegate) =>
      oldDelegate.progress != progress;
}

class _Particle {
  final double x;
  final double y;
  final double radius;
  final Color color;

  const _Particle(this.x, this.y, this.radius, this.color);
}
