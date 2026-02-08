import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ShoppingBag, Eye } from 'lucide-react';

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

const tabs = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending_approval' },
    { label: 'Active', value: 'active' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Completed', value: 'completed' },
];

export default function FreelancerOrders({ orders, filters }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        My <span className="text-[#FF6600]">Orders</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Manage orders from customers.</p>
                </div>
            }
        >
            <Head title="My Orders" />

            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => router.get(route('orders.freelancer'), tab.value ? { status: tab.value } : {}, { preserveState: true })}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            (filters.status || '') === tab.value
                                ? 'bg-[#FF6600] text-white'
                                : 'bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {orders.data.length === 0 ? (
                <div className="bg-white dark:bg-[#0c0c0c] p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 text-center">
                    <div className="size-20 mx-auto mb-6 rounded-3xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                        <ShoppingBag size={40} className="text-[#FF6600]" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
                    <p className="text-gray-400 text-sm">Orders from customers will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.data.map(order => (
                        <Link
                            key={order.id}
                            href={route('orders.show', order.id)}
                            className="block bg-white dark:bg-[#0c0c0c] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 hover:border-[#FF6600]/30 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-black text-gray-400 mb-1">#{order.order_number}</div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white">{order.service?.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Customer: {order.customer?.name} &middot; {order.booking_date}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-[#FF6600]">RM {order.agreed_price}</span>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${statusColors[order.status]}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
