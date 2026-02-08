import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import ChatBubble from '@/Components/ChatBubble';

export default function ChatShow({ conversation, messages: initialMessages, otherUser }) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState(initialMessages);
    const messagesEndRef = useRef(null);
    const { data, setData, post, processing, reset } = useForm({ body: '', attachment: null });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for new messages every 5s
    useEffect(() => {
        const interval = setInterval(async () => {
            if (messages.length === 0) return;
            const lastMsg = messages[messages.length - 1];
            try {
                const response = await fetch(route('chat.poll', conversation.id) + `?after=${lastMsg.created_at}`);
                const data = await response.json();
                if (data.messages?.length > 0) {
                    setMessages(prev => [...prev, ...data.messages]);
                }
            } catch (e) {
                // Silent fail on poll
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [messages, conversation.id]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!data.body.trim() && !data.attachment) return;

        post(route('chat.send', conversation.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                // Messages will be refreshed by poll or page reload
            },
        });
    };

    const isClosed = conversation.type === 'order' && conversation.order?.status === 'completed';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Chat with <span className="text-[#FF6600]">{otherUser?.name}</span>
                    </h2>
                    {conversation.order && (
                        <p className="text-gray-400 text-xs font-semibold">Order: {conversation.order.service?.title}</p>
                    )}
                </div>
            }
        >
            <Head title={`Chat with ${otherUser?.name}`} />

            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-1">
                    {messages.length === 0 && (
                        <div className="text-center text-sm text-gray-400 py-12">No messages yet. Start the conversation!</div>
                    )}
                    {messages.map(msg => (
                        <ChatBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.sender_id === auth.user.id}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {isClosed ? (
                    <div className="p-4 border-t border-gray-100 dark:border-white/5 text-center">
                        <span className="text-xs font-bold text-gray-400">This order chat is closed.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-3">
                        <label className="p-2 text-gray-400 hover:text-[#FF6600] cursor-pointer transition-colors">
                            <Paperclip size={18} />
                            <input
                                type="file"
                                className="hidden"
                                onChange={e => setData('attachment', e.target.files[0])}
                            />
                        </label>
                        <input
                            type="text"
                            value={data.body}
                            onChange={e => setData('body', e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 dark:bg-white/5 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FF6600]/20"
                        />
                        <button
                            type="submit"
                            disabled={processing || (!data.body.trim() && !data.attachment)}
                            className="p-3 bg-[#FF6600] text-white rounded-xl hover:bg-[#FF6600]/90 transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
