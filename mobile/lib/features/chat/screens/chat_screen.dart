import 'package:flutter/material.dart';

class ChatScreen extends StatelessWidget {
  final int conversationId;
  const ChatScreen({super.key, required this.conversationId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chat')),
      body: Center(child: Text('Conversation: $conversationId')),
    );
  }
}
