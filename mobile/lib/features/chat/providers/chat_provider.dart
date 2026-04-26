import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/conversation.dart';

class ChatState {
  final bool isLoading;
  final String? error;
  final List<Conversation> orderChats;
  final List<Conversation> generalChats;

  const ChatState({
    this.isLoading = false,
    this.error,
    this.orderChats = const [],
    this.generalChats = const [],
  });

  ChatState copyWith({
    bool? isLoading,
    String? error,
    List<Conversation>? orderChats,
    List<Conversation>? generalChats,
  }) {
    return ChatState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      orderChats: orderChats ?? this.orderChats,
      generalChats: generalChats ?? this.generalChats,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  final Dio _dio;

  ChatNotifier(this._dio) : super(const ChatState());

  Future<void> loadConversations() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get(ApiConstants.chat);
      if (response.data['success'] == true) {
        final data = response.data['data'] as List;
        final all =
            data.map((e) => Conversation.fromJson(e)).toList();

        state = ChatState(
          orderChats: all.where((c) => c.type == 'order').toList(),
          generalChats: all.where((c) => c.type != 'order').toList(),
        );
      }
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.response?.data?['message'] ?? 'Failed to load conversations',
      );
    }
  }

  /// Soft-delete the conversation for the current user. Drops it from
  /// the local list immediately and lets the server reconcile.
  Future<bool> deleteConversation(int conversationId) async {
    // Optimistic local removal
    state = state.copyWith(
      orderChats:
          state.orderChats.where((c) => c.id != conversationId).toList(),
      generalChats:
          state.generalChats.where((c) => c.id != conversationId).toList(),
    );
    try {
      await _dio.delete('${ApiConstants.chat}/$conversationId');
      return true;
    } on DioException {
      // Reload to recover from a failed delete.
      await loadConversations();
      return false;
    }
  }
}

final chatProvider =
    StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  final dio = ref.watch(dioProvider);
  return ChatNotifier(dio);
});
