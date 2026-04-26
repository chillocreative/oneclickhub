import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';

export default function MyReviews({ reviews, stats }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        My <span className="text-[#FF6600]">Reviews</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">
                        Reply to customer reviews on your services.
                    </p>
                </div>
            }
        >
            <Head title="My Reviews" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Avg rating" value={stats.avg_rating || '—'} icon={<Star className="text-yellow-400 fill-yellow-400" size={18} />} />
                <StatCard label="Total reviews" value={stats.total} />
                <StatCard label="Responded" value={`${stats.with_response} / ${stats.total}`} />
            </div>

            {reviews.data.length === 0 ? (
                <div className="bg-white dark:bg-[#0c0c0c] p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 text-center">
                    <MessageSquare size={36} className="text-[#FF6600] mx-auto mb-4" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">No reviews yet</h3>
                    <p className="text-gray-400 text-sm mt-2">
                        When customers complete a booking and rate your service, their reviews appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.data.map(review => (
                        <Row key={review.id} review={review} />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="rounded-2xl p-4 bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5">
            <div className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                {icon} {label}
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</div>
        </div>
    );
}

function Row({ review }) {
    const [editing, setEditing] = useState(false);
    const [body, setBody] = useState(review.freelancer_response || '');

    const save = () => {
        if (!body.trim()) return;
        router.post(route('reviews.respond', review.id), { body }, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const remove = () => {
        if (!confirm('Remove your reply?')) return;
        router.delete(route('reviews.respond.destroy', review.id), {
            preserveScroll: true,
            onSuccess: () => { setEditing(false); setBody(''); },
        });
    };

    return (
        <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                    {review.service && (
                        <Link
                            href={route('services.show', review.service.slug || review.service.id)}
                            className="text-xs font-black text-[#FF6600] hover:underline"
                        >
                            {review.service.title}
                        </Link>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {review.customer?.name || 'Anonymous'}
                        </span>
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => (
                                <Star
                                    key={n}
                                    size={12}
                                    className={n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                    {review.created_at && new Date(review.created_at).toLocaleDateString()}
                </span>
            </div>

            {review.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
            )}

            {/* Existing reply */}
            {review.freelancer_response && !editing && (
                <div className="mt-3 ml-3 pl-3 border-l-2 border-[#FF6600]/40 bg-[#FF6600]/5 p-3 rounded">
                    <div className="text-[10px] font-black text-[#FF6600] mb-1">
                        Your reply
                        {review.responded_at && ` · ${new Date(review.responded_at).toLocaleDateString()}`}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{review.freelancer_response}</p>
                </div>
            )}

            {/* Reply controls */}
            <div className="mt-3 flex flex-wrap gap-2 justify-end">
                {editing ? (
                    <div className="w-full">
                        <textarea
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            rows={3}
                            maxLength={2000}
                            placeholder="Thanks for the feedback…"
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                        />
                        <div className="mt-2 flex gap-2 justify-end">
                            <button
                                onClick={() => { setEditing(false); setBody(review.freelancer_response || ''); }}
                                className="px-3 py-1.5 rounded-xl text-xs font-black bg-gray-100 text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={save}
                                className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#FF6600] text-white"
                            >
                                Save reply
                            </button>
                        </div>
                    </div>
                ) : review.freelancer_response ? (
                    <>
                        <button
                            onClick={remove}
                            className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-600"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setEditing(true)}
                            className="px-3 py-1.5 rounded-xl text-xs font-black bg-gray-100 text-gray-600"
                        >
                            Edit reply
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#FF6600]/10 text-[#FF6600]"
                    >
                        Reply
                    </button>
                )}
            </div>
        </div>
    );
}
