import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';

export default function ChatIndex({ conversations }) {
    const general = conversations.filter(c => c.type === 'general');
    const order = conversations.filter(c => c.type === 'order');

    const ConversationItem = ({ conv }) => (
        <Link
            href={route('chat.show', conv.id)}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
        >
            <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[2px] flex-none">
                <div className="size-full bg-white dark:bg-gray-900 rounded-[14px] flex items-center justify-center font-black text-[#FF6600]">
                    {conv.other_user?.name?.charAt(0) || '?'}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-gray-900 dark:text-white truncate">{conv.other_user?.name}</span>
                    {conv.unread_count > 0 && (
                        <span className="size-5 bg-[#FF6600] rounded-full text-[10px] text-white font-black flex items-center justify-center flex-none">
                            {conv.unread_count}
                        </span>
                    )}
                </div>
                {conv.order && (
                    <span className="text-[10px] font-bold text-[#FF6600]">Order: {conv.order.service?.title}</span>
                )}
                <p className="text-xs text-gray-400 truncate">
                    {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'No messages yet'}
                </p>
            </div>
        </Link>
    );

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        <span className="text-[#FF6600]">Messages</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Your conversations.</p>
                </div>
            }
        >
            <Head title="Messages" />

            {conversations.length === 0 ? (
                <div className="bg-white dark:bg-[#0c0c0c] p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 text-center">
                    <div className="size-20 mx-auto mb-6 rounded-3xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                        <MessageCircle size={40} className="text-[#FF6600]" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Messages Yet</h3>
                    <p className="text-gray-400 text-sm">Start a conversation by messaging a freelancer from their service page.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {order.length > 0 && (
                        <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                            <div className="px-6 pt-5 pb-2">
                                <h3 className="text-xs font-black text-[#FF6600] uppercase tracking-widest">Order Chats</h3>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-white/5 px-2 pb-2">
                                {order.map(conv => <ConversationItem key={conv.id} conv={conv} />)}
                            </div>
                        </div>
                    )}

                    {general.length > 0 && (
                        <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                            <div className="px-6 pt-5 pb-2">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">General</h3>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-white/5 px-2 pb-2">
                                {general.map(conv => <ConversationItem key={conv.id} conv={conv} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
