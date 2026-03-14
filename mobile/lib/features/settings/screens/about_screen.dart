import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'About ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Us',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Logo and title
            Center(
              child: Column(
                children: [
                  ClipOval(
                    child: Image.asset(
                      'assets/images/logo.png',
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 12),
                  RichText(
                    text: const TextSpan(
                      children: [
                        TextSpan(
                          text: 'ONECLICK',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textDark,
                          ),
                        ),
                        TextSpan(
                          text: 'HUB',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Article
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(8),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'About OneClickHub',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textDark,
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'OneClickHub was created with a simple vision to make digital tools accessible, efficient, and powerful for businesses of all sizes. Built as a centralized digital platform, OneClickHub enables entrepreneurs, startups, and organizations to manage their online presence, streamline operations, and connect with their customers through a single, user-friendly system. The platform focuses on simplifying complex digital processes so businesses can focus on growth rather than technical challenges.',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textGrey,
                      height: 1.7,
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'The idea behind OneClickHub was born from years of experience working with businesses that struggled with fragmented tools and complicated digital systems. Many companies rely on multiple platforms to handle marketing, automation, communication, and analytics. OneClickHub was designed to solve this problem by bringing everything together into one integrated ecosystem a concept increasingly used in modern digital platforms that combine multiple business tools into one interface to improve efficiency and collaboration.',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textGrey,
                      height: 1.7,
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'OneClickHub was founded by Sharil Azman, a technology entrepreneur with a background in digital infrastructure, web platforms, and online business automation. After working closely with startups and digital agencies across Southeast Asia, he recognized the growing need for a streamlined platform that empowers businesses to launch and manage their digital operations quickly and effectively. His vision was to build a platform that could help businesses move from idea to execution with just a few clicks.',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textGrey,
                      height: 1.7,
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'The platform was later joined by Daniel Lokman, the co-founder of OneClickHub, who brought strong expertise in product development and digital growth strategy. Together, they assembled a small but passionate team focused on building scalable tools that support entrepreneurs, digital marketers, and growing companies. Today, OneClickHub continues to evolve as a modern business platform designed to help organizations operate smarter, faster, and more efficiently in an increasingly digital world.',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textGrey,
                      height: 1.7,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Privacy Policy | Terms & Conditions
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                GestureDetector(
                  onTap: () => context.push('/settings/privacy-policy'),
                  child: const Text(
                    'Privacy Policy',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                      decoration: TextDecoration.underline,
                      decorationColor: AppColors.primary,
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    '|',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textLight,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => context.push('/settings/terms'),
                  child: const Text(
                    'Terms & Conditions',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                      decoration: TextDecoration.underline,
                      decorationColor: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
