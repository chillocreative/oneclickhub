import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Package, Upload, Check, X, Truck, Star, Clock, AlertTriangle, Landmark } from 'lucide-react';

const statusColors = {
    pending_payment: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10',
    pending_approval: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
    active: 'bg-green-50 text-green-600 dark:bg-green-500/10',
    delivered: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
    completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
    cancelled: 'bg-gray-100 text-gray-500 dark:bg-white/5',
    rejected: 'bg-red-50 text-red-600 dark:bg-red-500/10',
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

export default function OrderShow({ order, isFreelancer, isCustomer }) {
    const slipForm = useForm({ payment_slip: null });
    const rejectForm = useForm({ reason: '' });
    const reviewForm = useForm({ rating: 5, comment: '' });

    const handleUploadSlip = (e) => {
        e.preventDefault();
        slipForm.post(route('orders.uploadSlip', order.id), { forceFormData: true });
    };

    const handleAccept = () => {
        if (confirm('Accept this order?')) {
            router.post(route('orders.accept', order.id));
        }
    };

    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.post(route('orders.reject', order.id));
    };

    const handleDeliver = () => {
        if (confirm('Mark this order as delivered?')) {
            router.post(route('orders.deliver', order.id));
        }
    };

    const handleComplete = (e) => {
        e.preventDefault();
        reviewForm.post(route('orders.complete', order.id));
    };

    const banking = order.freelancer?.banking_detail;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Order <span className="text-[#FF6600]">#{order.order_number}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">{order.service?.title}</p>
                </div>
            }
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status */}
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-4 py-2 rounded-xl text-xs font-black ${statusColors[order.status]}`}>
                                {statusLabels[order.status]}
                            </span>
                            <span className="text-sm font-bold text-gray-400">
                                {new Date(order.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400 text-xs font-bold">Booking Date</span>
                                <div className="font-black text-gray-900 dark:text-white">{order.booking_date}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold">Agreed Price</span>
                                <div className="font-black text-[#FF6600]">RM {order.agreed_price}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold">Customer</span>
                                <div className="font-bold text-gray-900 dark:text-white">{order.customer?.name}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold">Freelancer</span>
                                <div className="font-bold text-gray-900 dark:text-white">{order.freelancer?.name}</div>
                            </div>
                        </div>

                        {order.customer_notes && (
                            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                                <span className="text-xs font-bold text-gray-400">Customer Notes</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{order.customer_notes}</p>
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

                    {/* Customer: Upload Slip */}
                    {isCustomer && order.status === 'pending_payment' && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Upload size={18} className="text-[#FF6600]" /> Upload Payment Slip
                            </h3>
                            {banking && (
                                <div className="mb-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Landmark size={16} className="text-[#FF6600]" />
                                        <span className="text-xs font-black text-[#FF6600]">Transfer to this account</span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div><span className="font-bold text-gray-500">Bank:</span> <span className="font-black text-gray-900 dark:text-white">{banking.bank_name}</span></div>
                                        <div><span className="font-bold text-gray-500">Account:</span> <span className="font-black text-gray-900 dark:text-white">{banking.account_number}</span></div>
                                        <div><span className="font-bold text-gray-500">Name:</span> <span className="font-black text-gray-900 dark:text-white">{banking.account_holder_name}</span></div>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handleUploadSlip}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => slipForm.setData('payment_slip', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-orange-50 file:text-[#FF6600] hover:file:bg-orange-100"
                                />
                                {slipForm.errors.payment_slip && <p className="text-red-500 text-xs mt-1">{slipForm.errors.payment_slip}</p>}
                                <button type="submit" disabled={slipForm.processing || !slipForm.data.payment_slip} className="mt-4 w-full btn-gradient py-3 text-xs font-black disabled:opacity-50">
                                    {slipForm.processing ? 'Uploading...' : 'Upload Slip'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Freelancer: Accept/Reject */}
                    {isFreelancer && order.status === 'pending_approval' && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white">Respond to Order</h3>
                            <button onClick={handleAccept} className="w-full btn-gradient py-3 text-xs font-black flex items-center justify-center gap-2">
                                <Check size={16} /> Accept Order
                            </button>
                            <form onSubmit={handleReject} className="space-y-3">
                                <textarea
                                    value={rejectForm.data.reason}
                                    onChange={e => rejectForm.setData('reason', e.target.value)}
                                    placeholder="Reason for rejection (optional)"
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                    rows={2}
                                />
                                <button type="submit" disabled={rejectForm.processing} className="w-full py-3 text-xs font-black text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100">
                                    <X size={14} className="inline mr-1" /> Reject Order
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Freelancer: Deliver */}
                    {isFreelancer && order.status === 'active' && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <button onClick={handleDeliver} className="w-full btn-gradient py-4 text-sm font-black flex items-center justify-center gap-2">
                                <Truck size={18} /> Mark as Delivered
                            </button>
                        </div>
                    )}

                    {/* Customer: Complete + Review */}
                    {isCustomer && order.status === 'delivered' && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Confirm & Review</h3>
                            <form onSubmit={handleComplete} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => reviewForm.setData('rating', n)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={28}
                                                    className={n <= reviewForm.data.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    value={reviewForm.data.comment}
                                    onChange={e => reviewForm.setData('comment', e.target.value)}
                                    placeholder="Share your experience (optional)"
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                    rows={3}
                                />
                                <button type="submit" disabled={reviewForm.processing} className="w-full btn-gradient py-3 text-xs font-black">
                                    {reviewForm.processing ? 'Submitting...' : 'Complete Order & Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Review */}
                    {order.review && (
                        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-3">Customer Review</h3>
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
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Service</h3>
                        <Link href={route('services.show', order.service?.slug || order.service_id)} className="text-sm font-bold text-[#FF6600] hover:underline">
                            {order.service?.title}
                        </Link>
                    </div>

                    {order.conversation && (
                        <Link
                            href={route('chat.show', order.conversation.id)}
                            className="block bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 hover:border-[#FF6600]/30 transition-all text-center"
                        >
                            <span className="text-sm font-black text-[#FF6600]">Open Order Chat</span>
                        </Link>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
