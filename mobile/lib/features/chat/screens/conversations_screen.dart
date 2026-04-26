import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/shimmer_loading.dart';
import '../models/conversation.dart';
import '../providers/chat_provider.dart';

class ConversationsScreen extends ConsumerStatefulWidget {
  const ConversationsScreen({super.key});

  @override
  ConsumerState<ConversationsScreen> createState() =>
      _ConversationsScreenState();
}

class _ConversationsScreenState extends ConsumerState<ConversationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(chatProvider.notifier).loadConversations();
    });
  }

  Future<void> _confirmDelete(
      BuildContext context, WidgetRef ref, Conversation c) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete chat?'),
        content: const Text(
          'This removes the chat from your inbox. The other side will keep '
          'their copy unless they delete it too.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: AppColors.statusRejected),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    final ok = await ref.read(chatProvider.notifier).deleteConversation(c.id);
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not delete chat. Please try again.'),
          backgroundColor: AppColors.statusRejected,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chatProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'Your ',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
              ),
              TextSpan(
                text: 'Messages',
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
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.read(chatProvider.notifier).loadConversations();
        },
        child: state.isLoading
            ? const ShimmerLoading(type: ShimmerType.list)
            : (state.orderChats.isEmpty && state.generalChats.isEmpty)
                ? ListView(
                    children: const [
                      EmptyState(
                        icon: Icons.chat_outlined,
                        title: 'No Messages',
                        description:
                            'Start a conversation with a freelancer or customer',
                      ),
                    ],
                  )
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Order Chats
                        if (state.orderChats.isNotEmpty) ...[
                          const _SectionLabel(label: 'ORDER CHATS'),
                          const SizedBox(height: 8),
                          AppCard(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Column(
                              children: state.orderChats
                                  .map((c) => _ConversationTile(
                                        conversation: c,
                                        onDelete: () =>
                                            _confirmDelete(context, ref, c),
                                      ))
                                  .toList(),
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // General Chats
                        if (state.generalChats.isNotEmpty) ...[
                          const _SectionLabel(label: 'GENERAL'),
                          const SizedBox(height: 8),
                          AppCard(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Column(
                              children: state.generalChats
                                  .map((c) => _ConversationTile(
                                        conversation: c,
                                        onDelete: () =>
                                            _confirmDelete(context, ref, c),
                                      ))
                                  .toList(),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;

  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w700,
        color: AppColors.textLight,
        letterSpacing: 0.5,
      ),
    );
  }
}

class _ConversationTile extends StatelessWidget {
  final Conversation conversation;
  final VoidCallback onDelete;

  const _ConversationTile({
    required this.conversation,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final user = conversation.otherUser;
    final initials = user?.initials ?? '?';
    final name = user?.name ?? 'Unknown';
    final serviceTitle = conversation.summaryTitle;
    final lastMsg = conversation.lastMessage;
    final unread = conversation.unreadCount;

    return InkWell(
      onTap: () => context.push('/chat/${conversation.id}'),
      onLongPress: onDelete,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            // Avatar with gradient
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Name + service + last message
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      fontWeight:
                          unread > 0 ? FontWeight.w700 : FontWeight.w600,
                      fontSize: 14,
                      color: AppColors.textDark,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (serviceTitle != null && serviceTitle.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      serviceTitle,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (lastMsg != null && lastMsg.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      lastMsg,
                      style: TextStyle(
                        fontSize: 12,
                        color: unread > 0
                            ? AppColors.textDark
                            : AppColors.textGrey,
                        fontWeight:
                            unread > 0 ? FontWeight.w500 : FontWeight.normal,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),

            // Date + unread badge
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (conversation.lastMessageAt != null)
                  Text(
                    _formatDate(conversation.lastMessageAt!),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textLight,
                    ),
                  ),
                if (unread > 0) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      '$unread',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);
      if (diff.inMinutes < 1) return 'Now';
      if (diff.inHours < 1) return '${diff.inMinutes}m';
      if (diff.inDays < 1) return '${diff.inHours}h';
      if (diff.inDays < 7) return '${diff.inDays}d';
      return '${date.day}/${date.month}';
    } catch (_) {
      return dateStr;
    }
  }
}
