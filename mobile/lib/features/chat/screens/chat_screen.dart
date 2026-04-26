import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';

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
  Map<String, dynamic>? _otherUser;
  bool _isLoading = true;
  bool _isSending = false;
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
        final convo = data['conversation'] as Map<String, dynamic>?;
        final msgs = (data['messages'] as List? ?? [])
            .map((m) => Map<String, dynamic>.from(m as Map))
            .toList();

        setState(() {
          _otherUser = convo?['other_user'] as Map<String, dynamic>?;
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

  @override
  Widget build(BuildContext context) {
    final myId = ref.watch(authProvider).user?.id;
    final otherName = _otherUser?['name']?.toString() ?? 'Chat';

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
      ),
      body: Column(
        children: [
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
        );
      },
    );
  }

  Widget _buildInput() {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFEEEEEE))),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
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

class _MessageBubble extends StatelessWidget {
  final String body;
  final bool isMine;
  final String? createdAt;

  const _MessageBubble({
    required this.body,
    required this.isMine,
    this.createdAt,
  });

  String? _formatTime() {
    if (createdAt == null) return null;
    final dt = DateTime.tryParse(createdAt!)?.toLocal();
    if (dt == null) return null;
    return DateFormat('h:mm a').format(dt);
  }

  @override
  Widget build(BuildContext context) {
    final time = _formatTime();
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
                  horizontal: 14, vertical: 10),
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
                  Text(
                    body,
                    style: TextStyle(
                      color: isMine ? Colors.white : AppColors.textDark,
                      fontSize: 14,
                      height: 1.35,
                    ),
                  ),
                  if (time != null) ...[
                    const SizedBox(height: 2),
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
}
