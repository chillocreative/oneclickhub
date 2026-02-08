import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
    pending_payment: 'bg-yellow-50 text-yellow-600',
    pending_approval: 'bg-blue-50 text-blue-600',
    active: 'bg-green-50 text-green-600',
    delivered: 'bg-purple-50 text-purple-600',
    completed: 'bg-emerald-50 text-emerald-600',
    cancelled: 'bg-gray-100 text-gray-500',
    rejected: 'bg-red-50 text-red-600',
};

const statusLabels = {
    pending_payment: 'Pending Payment',
    pending_approval: 'Pending Approval',
    active: 'Active',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
};

const allStatuses = ['pending_payment', 'pending_approval', 'active', 'delivered', 'completed', 'cancelled', 'rejected'];

export default function AdminOrderShow({ order }) {
    const [showDelete, setShowDelete] = useState(false);
    const form = useForm({
        status: order.status,
        cancellation_reason: order.cancellation_reason || '',
    });

    const handleStatusUpdate = (e) => {
        e.preventDefault();
        form.patch(route('admin.orders.update', order.id));
    };

    const handleDelete = () => {
        router.delete(route('admin.orders.destroy', order.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.orders.index')} className="text-sm font-bold text-gray-400 hover:text-[#FF6600]">&larr; Back</Link>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Order <span className="text-[#FF6600]">#{order.order_number}</span>
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Details */}
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <span className={`px-4 py-2 rounded-xl text-xs font-black ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                        </span>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div><span className="text-gray-400 text-xs font-bold">Service</span><div className="font-black text-gray-900 dark:text-white">{order.service?.title}</div></div>
                            <div><span className="text-gray-400 text-xs font-bold">Booking Date</span><div className="font-black text-gray-900 dark:text-white">{order.booking_date}</div></div>
                            <div><span className="text-gray-400 text-xs font-bold">Customer</span><div className="font-bold text-gray-900 dark:text-white">{order.customer?.name}</div></div>
                            <div><span className="text-gray-400 text-xs font-bold">Freelancer</span><div className="font-bold text-gray-900 dark:text-white">{order.freelancer?.name}</div></div>
                            <div><span className="text-gray-400 text-xs font-bold">Agreed Price</span><div className="font-black text-[#FF6600]">RM {order.agreed_price}</div></div>
                            <div><span className="text-gray-400 text-xs font-bold">Created</span><div className="text-gray-600 dark:text-gray-300">{new Date(order.created_at).toLocaleString()}</div></div>
                        </div>
                        {order.customer_notes && (
                            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                <span className="text-xs font-bold text-gray-400">Customer Notes</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{order.customer_notes}</p>
                            </div>
                        )}
                        {order.cancellation_reason && (
                            <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10">
                                <span className="text-xs font-bold text-red-400">Rejection Reason</span>
                                <p className="text-sm text-red-600 mt-1">{order.cancellation_reason}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Slip */}
                    {order.payment_slip && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Payment Slip</h3>
                            <img src={`/storage/${order.payment_slip}`} alt="Payment Slip" className="rounded-2xl max-h-80 object-contain" />
                        </div>
                    )}

                    {/* Chat History */}
                    {order.conversation?.messages?.length > 0 && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Chat History</h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {order.conversation.messages.map(msg => (
                                    <div key={msg.id} className="flex gap-3">
                                        <span className="text-xs font-black text-[#FF6600] w-24 flex-none">{msg.sender?.name}</span>
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{msg.body}</p>
                                            <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Review */}
                    {order.review && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3">Review</h3>
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <Star key={n} size={16} className={n <= order.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                ))}
                            </div>
                            {order.review.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{order.review.comment}</p>}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Banking Details */}
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white">Banking Details</h3>
                        {order.freelancer?.banking_detail ? (
                            <div className="text-sm space-y-1">
                                <div><span className="text-gray-400 font-bold">Bank:</span> {order.freelancer.banking_detail.bank_name}</div>
                                <div><span className="text-gray-400 font-bold">Account:</span> {order.freelancer.banking_detail.account_number}</div>
                                <div><span className="text-gray-400 font-bold">Name:</span> {order.freelancer.banking_detail.account_holder_name}</div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">No banking details set.</p>
                        )}
                    </div>

                    {/* Update Status */}
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Update Status</h3>
                        <form onSubmit={handleStatusUpdate} className="space-y-4">
                            <select
                                value={form.data.status}
                                onChange={e => form.setData('status', e.target.value)}
                                className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                            >
                                {allStatuses.map(s => (
                                    <option key={s} value={s}>{statusLabels[s]}</option>
                                ))}
                            </select>
                            {(form.data.status === 'cancelled' || form.data.status === 'rejected') && (
                                <textarea
                                    value={form.data.cancellation_reason}
                                    onChange={e => form.setData('cancellation_reason', e.target.value)}
                                    placeholder="Reason (optional)"
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                    rows={2}
                                />
                            )}
                            <button type="submit" disabled={form.processing} className="w-full btn-gradient py-3 text-xs font-black disabled:opacity-50">
                                {form.processing ? 'Updating...' : 'Update Status'}
                            </button>
                        </form>
                    </div>

                    {/* Delete */}
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-red-100 dark:border-red-500/10">
                        <h3 className="text-sm font-black text-red-600 mb-3">Danger Zone</h3>
                        {!showDelete ? (
                            <button onClick={() => setShowDelete(true)} className="w-full py-3 text-xs font-black text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 flex items-center justify-center gap-2">
                                <Trash2 size={14} /> Delete Order
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs text-red-500 font-bold">This action cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowDelete(false)} className="flex-1 py-2 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                                    <button onClick={handleDelete} className="flex-1 py-2 text-xs font-black text-white bg-red-500 rounded-xl hover:bg-red-600">Confirm</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
