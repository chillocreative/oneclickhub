import 'dart:async';
import 'dart:io';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/datetime_format.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/conversation.dart';
import '../providers/chat_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final int conversationId;
  const ChatScreen({super.key, required this.conversationId});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _inputCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  Conversation? _conversation;
  bool _isLoading = true;
  bool _isSending = false;
  bool _isCompletingJob = false;
  String? _error;
  Timer? _pollTimer;
  String? _lastMessageAt;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) => _poll());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get('${ApiConstants.chat}/${widget.conversationId}');
      if (res.data['success'] == true) {
        final data = res.data['data'];
        final convoJson = data['conversation'] as Map<String, dynamic>?;
        final msgs = (data['messages'] as List? ?? [])
            .map((m) => Map<String, dynamic>.from(m as Map))
            .toList();

        setState(() {
          _conversation = convoJson != null
              ? Conversation.fromJson(convoJson)
              : null;
          _messages
            ..clear()
            ..addAll(msgs);
          _lastMessageAt = msgs.isNotEmpty
              ? msgs.last['created_at']?.toString()
              : null;
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } on DioException catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.response?.data?['message'] ?? 'Failed to load chat';
      });
    }
  }

  Future<void> _poll() async {
    if (_lastMessageAt == null || !mounted) return;
    try {
      final dio = ref.read(dioProvider);
      final res = await dio.get(
        '${ApiConstants.chat}/${widget.conversationId}/poll',
        queryParameters: {'after': _lastMessageAt},
      );
      if (res.data['success'] == true) {
        final newMsgs = (res.data['data'] as List? ?? [])
            .map((m) => Map<String, dynamic>.from(m as Map))
            .toList();
        if (newMsgs.isNotEmpty && mounted) {
          setState(() {
            _messages.addAll(newMsgs);
            _lastMessageAt = newMsgs.last['created_at']?.toString();
          });
          _scrollToBottom();
        }
      }
    } catch (_) {
      // Silent fail on poll — next tick will retry
    }
  }

  Future<void> _send() async {
    final body = _inputCtrl.text.trim();
    if (body.isEmpty || _isSending) return;

    setState(() => _isSending = true);
    _inputCtrl.clear();

    try {
      final dio = ref.read(dioProvider);
      final res = await dio.post(
        '${ApiConstants.chat}/${widget.conversationId}/send',
        data: {'body': body},
      );
      if (res.data['success'] == true) {
        final msg = Map<String, dynamic>.from(res.data['data'] as Map);
        setState(() {
          _messages.add(msg);
          _lastMessageAt = msg['created_at']?.toString();
        });
        _scrollToBottom();
      }
    } on DioException catch (e) {
      if (mounted) {
        // Restore input on failure
        _inputCtrl.text = body;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Failed to send message'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _pickAndSendAttachment() async {
    if (_isSending) return;

    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'jpg', 'jpeg', 'png'],
      withData: false,
    );
    if (result == null || result.files.isEmpty) return;

    final picked = result.files.single;
    final path = picked.path;
    if (path == null) return;

    final file = File(path);
    final size = await file.length();
    if (size > 10 * 1024 * 1024) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('File too large. Maximum 10 MB.'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
      return;
    }

    setState(() => _isSending = true);
    final captionRaw = _inputCtrl.text.trim();
    _inputCtrl.clear();

    try {
      final dio = ref.read(dioProvider);
      final formData = FormData.fromMap({
        if (captionRaw.isNotEmpty) 'body': captionRaw,
        'attachment': await MultipartFile.fromFile(
          path,
          filename: picked.name,
        ),
      });
      final res = await dio.post(
        '${ApiConstants.chat}/${widget.conversationId}/send',
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );
      if (res.data['success'] == true) {
        final msg = Map<String, dynamic>.from(res.data['data'] as Map);
        setState(() {
          _messages.add(msg);
          _lastMessageAt = msg['created_at']?.toString();
        });
        _scrollToBottom();
      }
    } on DioException catch (e) {
      if (mounted) {
        if (captionRaw.isNotEmpty) _inputCtrl.text = captionRaw;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Failed to send attachment'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _confirmAndDeleteChat() async {
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
    if (confirmed != true || !mounted) return;

    final ok = await ref
        .read(chatProvider.notifier)
        .deleteConversation(widget.conversationId);

    if (!mounted) return;

    if (ok) {
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not delete chat. Please try again.'),
          backgroundColor: AppColors.statusRejected,
        ),
      );
    }
  }

  Future<void> _markJobComplete() async {
    final order = _conversation?.order;
    if (order == null || _isCompletingJob) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Mark booking as Delivered?'),
        content: const Text(
          'This tells the customer the service is done. The chat stays open '
          'until they confirm completion and leave a review.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Not yet'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Mark Delivered'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _isCompletingJob = true);
    try {
      final dio = ref.read(dioProvider);
      await dio.post('${ApiConstants.orders}/${order.id}/deliver');
      if (!mounted) return;
      // Reload so the new banner / waiting state renders.
      await _loadMessages();
      // Refresh chat list for the next time user opens it.
      ref.read(chatProvider.notifier).loadConversations();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Booking marked as Delivered. Waiting on the customer.'),
            backgroundColor: AppColors.statusActive,
          ),
        );
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.response?.data?['message']?.toString()
                ?? 'Could not mark as delivered'),
            backgroundColor: AppColors.statusRejected,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isCompletingJob = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  bool get _isOrderChatClosed {
    // Booking chat stays open through 'delivered' so customer + freelancer can
    // sort out final details before the customer confirms completion.
    final status = _conversation?.order?.status;
    if (status == null) return false;
    return status == 'completed'
        || status == 'cancelled'
        || status == 'rejected';
  }

  bool get _canMarkComplete {
    final myId = ref.read(authProvider).user?.id;
    final order = _conversation?.order;
    if (myId == null || order == null) return false;
    // Only the freelancer (the other side, when current user is freelancer)
    // can close the chat. We infer freelancer-ness via the chat being an
    // order chat where status is still active and current user is not the
    // customer; backend enforces the real authorisation.
    if (order.status != 'active') return false;
    return _conversation?.otherUser != null;
  }

  @override
  Widget build(BuildContext context) {
    final myId = ref.watch(authProvider).user?.id;
    final otherName = _conversation?.otherUser?.name ?? 'Chat';
    final hasSummary = _conversation?.hasServiceSummary == true;

    return Scaffold(
      backgroundColor: AppColors.backgroundWarm,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.primary.withAlpha(20),
              child: Text(
                otherName.isNotEmpty
                    ? otherName.substring(0, 1).toUpperCase()
                    : '?',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                otherName,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textDark,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: AppColors.textDark),
            onSelected: (value) {
              if (value == 'complete') {
                _markJobComplete();
              } else if (value == 'delete') {
                _confirmAndDeleteChat();
              }
            },
            itemBuilder: (ctx) => [
              if (_canMarkComplete)
                const PopupMenuItem(
                  value: 'complete',
                  child: Row(
                    children: [
                      Icon(Icons.local_shipping_outlined,
                          color: AppColors.statusActive, size: 18),
                      SizedBox(width: 10),
                      Text('Mark Delivered'),
                    ],
                  ),
                ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete_outline,
                        color: AppColors.statusRejected, size: 18),
                    SizedBox(width: 10),
                    Text('Delete chat'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          if (hasSummary) _ServiceSummaryHeader(conversation: _conversation!),
          if (_canMarkComplete) _MarkCompleteBar(
            isLoading: _isCompletingJob,
            onPressed: _markJobComplete,
          ),
          if (_conversation?.order?.status == 'delivered')
            const _DeliveredBanner(),
          Expanded(child: _buildBody(myId)),
          _buildInput(),
        ],
      ),
    );
  }

  Widget _buildBody(int? myId) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error!, style: const TextStyle(color: AppColors.textGrey)),
            const SizedBox(height: 12),
            FilledButton(onPressed: _loadMessages, child: const Text('Retry')),
          ],
        ),
      );
    }
    if (_messages.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            'No messages yet. Say hello!',
            style: TextStyle(color: AppColors.textGrey, fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      itemCount: _messages.length,
      itemBuilder: (_, i) {
        final m = _messages[i];
        final isMine = myId != null && m['sender_id'] == myId;
        final body = m['body']?.toString() ?? '';
        final createdAt = m['created_at']?.toString();
        return _MessageBubble(
          body: body,
          isMine: isMine,
          createdAt: createdAt,
          attachmentUrl: m['attachment_url']?.toString(),
          attachmentMime: m['attachment_mime']?.toString(),
          attachmentName: m['attachment_name']?.toString(),
        );
      },
    );
  }

  Widget _buildInput() {
    if (_isOrderChatClosed) {
      final status = _conversation?.order?.status ?? '';
      final closedReason = switch (status) {
        'completed' => 'This booking is completed. Continue via a normal chat.',
        'cancelled' => 'This booking was cancelled. The chat is closed.',
        'rejected' => 'This booking was rejected. The chat is closed.',
        _ => 'This booking chat is closed.',
      };
      return SafeArea(
        top: false,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          color: Colors.white,
          child: Text(
            closedReason,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textGrey,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      );
    }

    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(8, 8, 12, 8),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFEEEEEE))),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            IconButton(
              tooltip: 'Attach file (PDF, JPG, PNG)',
              onPressed: _isSending ? null : _pickAndSendAttachment,
              icon: const Icon(
                Icons.attach_file,
                color: AppColors.primary,
              ),
            ),
            Expanded(
              child: TextField(
                controller: _inputCtrl,
                minLines: 1,
                maxLines: 4,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle:
                      TextStyle(color: Colors.grey.shade400, fontSize: 14),
                  filled: true,
                  fillColor: AppColors.backgroundWarm,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide:
                        const BorderSide(color: AppColors.primary, width: 1.5),
                  ),
                ),
                onSubmitted: (_) => _send(),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: AppColors.primary,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: _isSending ? null : _send,
                child: Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  child: _isSending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send, color: Colors.white, size: 20),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ServiceSummaryHeader extends StatelessWidget {
  final Conversation conversation;
  const _ServiceSummaryHeader({required this.conversation});

  @override
  Widget build(BuildContext context) {
    final title = conversation.summaryTitle ?? '';
    final image = conversation.summaryImage;
    final order = conversation.order;
    final price = order?.agreedPrice != null
        ? 'RM ${order!.agreedPrice!.toStringAsFixed(0)}'
        : conversation.service?.priceDisplay;
    final bookingDate = order?.bookingDate;
    final formattedDate = bookingDate != null
        ? AppDateTime.formatBooking(bookingDate)
        : null;
    final slug = order?.service?.slug ?? conversation.service?.slug;

    return Material(
      color: Colors.white,
      child: InkWell(
        onTap: slug != null
            ? () => context.push('/services/$slug')
            : null,
        child: Container(
          padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
          decoration: BoxDecoration(
            color: AppColors.primary.withAlpha(8),
            border: Border(
              bottom: BorderSide(color: Colors.grey.shade200, width: 1),
            ),
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: SizedBox(
                  width: 48,
                  height: 48,
                  child: image != null && image.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: image,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => Container(
                            color: AppColors.primary.withAlpha(20),
                            child: const Icon(Icons.work,
                                color: AppColors.primary, size: 22),
                          ),
                        )
                      : Container(
                          color: AppColors.primary.withAlpha(20),
                          child: const Icon(Icons.work,
                              color: AppColors.primary, size: 22),
                        ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textDark,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Wrap(
                      spacing: 8,
                      runSpacing: 2,
                      children: [
                        if (price != null)
                          Text(
                            price,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        if (formattedDate != null)
                          Text(
                            formattedDate,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textGrey,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              if (slug != null)
                const Icon(Icons.chevron_right,
                    color: AppColors.textLight, size: 20),
            ],
          ),
        ),
      ),
    );
  }

}

class _MarkCompleteBar extends StatelessWidget {
  final bool isLoading;
  final VoidCallback onPressed;

  const _MarkCompleteBar({
    required this.isLoading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.statusActive.withAlpha(15),
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      child: Row(
        children: [
          const Expanded(
            child: Text(
              'Job done? Mark Delivered — chat stays open until the customer confirms.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textDark,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 8),
          FilledButton.icon(
            onPressed: isLoading ? null : onPressed,
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.statusActive,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              textStyle: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
            icon: isLoading
                ? const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.local_shipping_outlined, size: 16),
            label: const Text('Mark Delivered'),
          ),
        ],
      ),
    );
  }
}

class _DeliveredBanner extends StatelessWidget {
  const _DeliveredBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.statusActive.withAlpha(25),
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
      child: const Row(
        children: [
          Icon(Icons.local_shipping_outlined,
              color: AppColors.statusActive, size: 18),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Marked Delivered. Customer needs to confirm completion in '
              'My Bookings to close this chat.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textDark,
                fontWeight: FontWeight.w500,
                height: 1.3,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final String body;
  final bool isMine;
  final String? createdAt;
  final String? attachmentUrl;
  final String? attachmentMime;
  final String? attachmentName;

  const _MessageBubble({
    required this.body,
    required this.isMine,
    this.createdAt,
    this.attachmentUrl,
    this.attachmentMime,
    this.attachmentName,
  });

  String? _formatTime() {
    if (createdAt == null) return null;
    final dt = DateTime.tryParse(createdAt!)?.toLocal();
    if (dt == null) return null;
    return DateFormat('h:mm a').format(dt);
  }

  bool get _isImage =>
      attachmentMime != null && attachmentMime!.startsWith('image/');
  bool get _isPdf => attachmentMime == 'application/pdf';
  bool get _hasAttachment =>
      attachmentUrl != null && attachmentUrl!.isNotEmpty;

  Future<void> _open(BuildContext context) async {
    if (!_hasAttachment) return;
    final uri = Uri.tryParse(attachmentUrl!);
    if (uri == null) return;
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open attachment')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final time = _formatTime();
    final showText = body.isNotEmpty;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment:
            isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Flexible(
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.78,
              ),
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: isMine ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isMine ? 18 : 4),
                  bottomRight: Radius.circular(isMine ? 4 : 18),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(8),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (_hasAttachment) _buildAttachment(context),
                  if (showText) ...[
                    if (_hasAttachment) const SizedBox(height: 6),
                    Text(
                      body,
                      style: TextStyle(
                        color: isMine ? Colors.white : AppColors.textDark,
                        fontSize: 14,
                        height: 1.35,
                      ),
                    ),
                  ],
                  if (time != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      time,
                      style: TextStyle(
                        color: isMine
                            ? Colors.white.withAlpha(180)
                            : AppColors.textGrey,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttachment(BuildContext context) {
    if (_isImage) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: () => _open(context),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: 220,
              maxHeight: 260,
            ),
            child: CachedNetworkImage(
              imageUrl: attachmentUrl!,
              fit: BoxFit.cover,
              placeholder: (_, __) => Container(
                color: Colors.grey.shade200,
                width: 200,
                height: 160,
                alignment: Alignment.center,
                child: const CircularProgressIndicator(
                  color: AppColors.primary,
                  strokeWidth: 2,
                ),
              ),
              errorWidget: (_, __, ___) => Container(
                color: Colors.grey.shade200,
                width: 200,
                height: 120,
                alignment: Alignment.center,
                child: const Icon(Icons.broken_image,
                    color: AppColors.textGrey),
              ),
            ),
          ),
        ),
      );
    }

    final fg = isMine ? Colors.white : AppColors.primary;
    final bg = isMine
        ? Colors.white.withAlpha(40)
        : AppColors.primary.withAlpha(20);

    return InkWell(
      onTap: () => _open(context),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _isPdf ? Icons.picture_as_pdf : Icons.insert_drive_file,
              color: fg,
              size: 22,
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                attachmentName ?? 'Attachment',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: fg,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
            const SizedBox(width: 6),
            Icon(Icons.open_in_new, color: fg, size: 14),
          ],
        ),
      ),
    );
  }
}
