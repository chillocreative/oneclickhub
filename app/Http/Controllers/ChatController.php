<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $conversations = ChatConversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne', 'userTwo', 'order.service'])
            ->withCount(['messages as unread_count' => function ($q) use ($userId) {
                $q->where('sender_id', '!=', $userId)->whereNull('read_at');
            }])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($conv) use ($userId) {
                $conv->other_user = $conv->getOtherUser($userId);
                return $conv;
            });

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(ChatConversation $conversation)
    {
        $userId = auth()->id();

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            abort(403);
        }

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at')
            ->get();

        $conversation->load(['userOne', 'userTwo', 'order.service']);
        $otherUser = $conversation->getOtherUser($userId);

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'messages' => $messages,
            'otherUser' => $otherUser,
        ]);
    }

    public function sendMessage(Request $request, ChatConversation $conversation)
    {
        $userId = auth()->id();

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            abort(403);
        }

        // Block sending in completed order chats
        if ($conversation->type === 'order' && $conversation->order && $conversation->order->status === 'completed') {
            return back()->with('error', 'This order chat is closed.');
        }

        $request->validate([
            'body' => 'required_without:attachment|nullable|string|max:2000',
            'attachment' => 'nullable|file|max:5120',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('chat-attachments', 'public');
        }

        $conversation->messages()->create([
            'sender_id' => $userId,
            'body' => $request->body ?? '',
            'attachment' => $attachmentPath,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return back();
    }

    public function startConversation(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = auth()->id();
        $otherId = (int) $request->user_id;

        if ($userId === $otherId) {
            return back()->with('error', 'Cannot chat with yourself.');
        }

        $userIds = collect([$userId, $otherId])->sort()->values();

        $conversation = ChatConversation::firstOrCreate([
            'user_one_id' => $userIds[0],
            'user_two_id' => $userIds[1],
            'order_id' => null,
        ], [
            'type' => 'general',
            'last_message_at' => now(),
        ]);

        return redirect()->route('chat.show', $conversation);
    }

    public function poll(ChatConversation $conversation, Request $request)
    {
        $userId = auth()->id();

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            abort(403);
        }

        $request->validate([
            'after' => 'required|date',
        ]);

        // Mark new messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()
            ->with('sender')
            ->where('created_at', '>', $request->after)
            ->orderBy('created_at')
            ->get();

        return response()->json(['messages' => $messages]);
    }
}
