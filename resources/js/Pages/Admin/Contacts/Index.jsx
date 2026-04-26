import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Mail, Trash2, Phone, AtSign } from 'lucide-react';
import { useState } from 'react';

export default function ContactsIndex({ messages, stats }) {
    const [expanded, setExpanded] = useState(null);

    const remove = (msg) => {
        if (!confirm(`Delete message from ${msg.name}?`)) return;
        router.delete(route('admin.contacts.destroy', msg.id), {
            preserveScroll: true,
        });
    };

    const clearAll = () => {
        if (!stats.total) return;
        if (!confirm(`Permanently delete all ${stats.total} contact message${stats.total === 1 ? '' : 's'}?`)) return;
        router.delete(route('admin.contacts.clearAll'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Contact <span className="text-[#FF6600]">Messages</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Submissions from the public contact form.</p>
                </div>
            }
        >
            <Head title="Contact Messages" />

            {/* Stats + Clear all */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="rounded-2xl px-4 py-3 bg-orange-50 dark:bg-orange-500/10 text-[#FF6600]">
                    <span className="text-xs font-black uppercase opacity-70">Total messages</span>
                    <div className="text-2xl font-black mt-0.5">{stats.total}</div>
                </div>
                {stats.total > 0 && (
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center gap-1.5"
                    >
                        <Trash2 size={14} /> Clear all
                    </button>
                )}
            </div>

            {messages.data.length === 0 ? (
                <div className="bg-white dark:bg-[#0c0c0c] p-12 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 text-center">
                    <Mail size={36} className="text-[#FF6600] mx-auto mb-4" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">No contact messages yet</h3>
                    <p className="text-gray-400 text-sm mt-2">When someone submits the public contact form, it'll appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.data.map(msg => (
                        <div key={msg.id} className="bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-black text-gray-900 dark:text-white truncate">{msg.subject}</h3>
                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">{msg.name}</div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                        <a href={`mailto:${msg.email}`} className="inline-flex items-center gap-1 hover:text-[#FF6600]">
                                            <AtSign size={12} /> {msg.email}
                                        </a>
                                        {msg.phone_number && (
                                            <a href={`tel:${msg.phone_number}`} className="inline-flex items-center gap-1 hover:text-[#FF6600]">
                                                <Phone size={12} /> {msg.phone_number}
                                            </a>
                                        )}
                                        <span className="text-gray-400">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => remove(msg)}
                                    className="size-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 inline-flex items-center justify-center shrink-0"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {expanded === msg.id || (msg.message?.length ?? 0) <= 280
                                    ? msg.message
                                    : msg.message.slice(0, 280) + '…'}
                            </div>
                            {(msg.message?.length ?? 0) > 280 && (
                                <button
                                    onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                                    className="mt-2 text-xs font-black text-[#FF6600] hover:underline"
                                >
                                    {expanded === msg.id ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {messages?.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                    <span>Page {messages.current_page} of {messages.last_page}</span>
                    <div className="flex gap-1">
                        {messages.links?.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                                    link.active
                                        ? 'bg-[#FF6600] text-white'
                                        : link.url
                                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            : 'bg-gray-50 text-gray-300 pointer-events-none'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
