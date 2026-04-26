<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ChatConversationResource;
use App\Http\Resources\V1\ChatMessageResource;
use App\Models\ChatConversation;
use App\Services\FcmService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $conversations = ChatConversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne', 'userTwo', 'order.service', 'messages' => function ($q) {
                $q->latest()->limit(1);
            }])
            ->withCount(['messages as unread_count' => function ($q) use ($userId) {
                $q->where('sender_id', '!=', $userId)->whereNull('read_at');
            }])
            ->orderByDesc('last_message_at')
            ->get();

        return $this->success(ChatConversationResource::collection($conversations));
    }

    public function show(ChatConversation $conversation, Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            return $this->forbidden();
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

        return $this->success([
            'conversation' => new ChatConversationResource($conversation),
            'messages' => ChatMessageResource::collection($messages),
        ]);
    }

    public function sendMessage(Request $request, ChatConversation $conversation): JsonResponse
    {
        $userId = $request->user()->id;

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            return $this->forbidden();
        }

        if ($conversation->type === 'order' && $conversation->order && $conversation->order->status === 'completed') {
            return $this->error('This order chat is closed.', 422);
        }

        $request->validate([
            'body' => 'required_without:attachment|nullable|string|max:2000',
            'attachment' => 'nullable|file|max:5120',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('chat-attachments', 'public');
        }

        $message = $conversation->messages()->create([
            'sender_id' => $userId,
            'body' => $request->body ?? '',
            'attachment' => $attachmentPath,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Push-notify the other participant so they see the new message
        // outside the app and can deep-link straight into this conversation.
        $recipientId = $conversation->user_one_id === $userId
            ? $conversation->user_two_id
            : $conversation->user_one_id;

        $sender = $request->user();
        $title = $sender->name ?: 'New message';
        $body = $message->body !== ''
            ? Str::limit($message->body, 100)
            : ($attachmentPath ? '📎 Sent an attachment' : '');

        try {
            app(FcmService::class)->sendToUser($recipientId, $title, $body, [
                'type' => 'chat',
                'conversation_id' => (string) $conversation->id,
                'sender_id' => (string) $userId,
            ]);
        } catch (\Throwable $e) {
            // FCM failure must not block the message itself.
            \Log::warning('Chat FCM send failed', ['error' => $e->getMessage()]);
        }

        return $this->success(
            new ChatMessageResource($message->load('sender')),
            'Message sent',
            201
        );
    }

    public function startConversation(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $userId = $request->user()->id;
        $otherId = (int) $request->user_id;

        if ($userId === $otherId) {
            return $this->error('Cannot chat with yourself.', 422);
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

        return $this->success(
            new ChatConversationResource($conversation),
            'Conversation started'
        );
    }

    public function poll(ChatConversation $conversation, Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        if ($conversation->user_one_id !== $userId && $conversation->user_two_id !== $userId) {
            return $this->forbidden();
        }

        $request->validate([
            'after' => 'required|date',
        ]);

        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()
            ->with('sender')
            ->where('created_at', '>', $request->after)
            ->orderBy('created_at')
            ->get();

        return $this->success(ChatMessageResource::collection($messages));
    }
}
