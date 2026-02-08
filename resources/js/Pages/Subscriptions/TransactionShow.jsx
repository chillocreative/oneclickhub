import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { CreditCard, User, Calendar, Wallet, Trash2 } from 'lucide-react';
import { useState } from 'react';

const statusStyles = {
    success: 'bg-emerald-100 text-emerald-600',
    failed: 'bg-red-100 text-red-500',
    pending: 'bg-amber-100 text-amber-600',
    cancelled: 'bg-gray-100 text-gray-500',
};

export default function TransactionShow({ transaction }) {
    const [showDelete, setShowDelete] = useState(false);
    const form = useForm({ status: transaction.status });

    const handleUpdate = (e) => {
        e.preventDefault();
        form.patch(route('subscriptions.transactions.update', transaction.id));
    };

    const handleDelete = () => {
        router.delete(route('subscriptions.transactions.destroy', transaction.id));
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('subscriptions.transactions')} className="text-sm font-bold text-gray-400 hover:text-[#FF6600]">&larr; Back</Link>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Transaction <span className="text-[#FF6600]">#{transaction.order_number}</span>
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Transaction ${transaction.order_number}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Details */}
                    <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Transaction Details</h3>
                            <span className={`px-4 py-2 rounded-xl text-xs font-black ${statusStyles[transaction.status] || 'bg-gray-100 text-gray-500'}`}>
                                {transaction.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Transaction ID</span>
                                <div className="font-black text-gray-900 dark:text-white">{transaction.transaction_id || '-'}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Order Number</span>
                                <div className="font-black text-[#FF6600]">#{transaction.order_number}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Amount</span>
                                <div className="font-black text-gray-900 dark:text-white text-xl">RM {parseFloat(transaction.amount).toFixed(2)}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Currency</span>
                                <div className="font-bold text-gray-900 dark:text-white">{transaction.currency || 'MYR'}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Gateway</span>
                                <div className="flex items-center gap-2">
                                    {(transaction.gateway || '').toLowerCase() === 'manual'
                                        ? <Wallet size={16} className="text-purple-500" />
                                        : <CreditCard size={16} className="text-blue-500" />
                                    }
                                    <span className="font-bold text-gray-900 dark:text-white uppercase">{transaction.gateway}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Payment Method</span>
                                <div className="font-bold text-gray-900 dark:text-white">{transaction.payment_method || '-'}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Created</span>
                                <div className="text-gray-600 dark:text-gray-300">{formatDate(transaction.created_at)}</div>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs font-bold block mb-1">Updated</span>
                                <div className="text-gray-600 dark:text-gray-300">{formatDate(transaction.updated_at)}</div>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    {transaction.user && (
                        <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">User</h3>
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[2.5px]">
                                    <div className="size-full bg-white dark:bg-gray-900 rounded-[13px] flex items-center justify-center font-black text-[#FF6600]">
                                        {transaction.user.name?.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-black text-gray-900 dark:text-white">{transaction.user.name}</div>
                                    <div className="text-xs text-gray-400">{transaction.user.phone_number}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Plan Info */}
                    {transaction.plan && (
                        <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Subscription Plan</h3>
                            <div className="text-sm space-y-2">
                                <div><span className="text-gray-400 font-bold">Plan:</span> <span className="font-black text-gray-900 dark:text-white">{transaction.plan.name}</span></div>
                                <div><span className="text-gray-400 font-bold">Price:</span> <span className="font-bold text-gray-900 dark:text-white">RM {parseFloat(transaction.plan.price).toFixed(2)}</span></div>
                            </div>
                        </div>
                    )}

                    {/* Payload */}
                    {transaction.payload && (
                        <div className="bg-white dark:bg-[#111] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                            <details>
                                <summary className="text-sm font-black text-gray-900 dark:text-white cursor-pointer">Gateway Payload</summary>
                                <pre className="text-xs text-gray-500 mt-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5 whitespace-pre-wrap overflow-auto max-h-60">
                                    {JSON.stringify(transaction.payload, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Update Status */}
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Update Status</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <select
                                value={form.data.status}
                                onChange={e => form.setData('status', e.target.value)}
                                className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                            >
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
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
                                <Trash2 size={14} /> Delete Transaction
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
