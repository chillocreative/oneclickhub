import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ShoppingBag, Package, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';

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

export default function AdminOrders({ orders, filters, stats }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.orders.index'), { ...filters, search }, { preserveState: true });
    };

    const filterByStatus = (status) => {
        router.get(route('admin.orders.index'), { ...filters, status, search: filters.search }, { preserveState: true });
    };

    const statCards = [
        { label: 'Total', value: stats.total, icon: ShoppingBag, color: 'text-[#FF6600]', status: null },
        { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500', status: 'pending_payment' },
        { label: 'Active', value: stats.active, icon: Package, color: 'text-green-500', status: 'active' },
        { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-500', status: 'completed' },
        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-red-500', status: 'cancelled' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Order <span className="text-[#FF6600]">Management</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Overview of all platform orders.</p>
                </div>
            }
        >
            <Head title="Admin Orders" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {statCards.map(s => (
                    <div
                        key={s.label}
                        onClick={() => filterByStatus(s.status)}
                        className={`bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md transition-all ${filters.status === s.status ? 'ring-2 ring-[#FF6600]' : ''}`}
                    >
                        <s.icon size={20} className={s.color} />
                        <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{s.value}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="mb-6 flex gap-3 items-center">
                <form onSubmit={handleSearch} className="flex gap-3 flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by order number or name..."
                        className="flex-1 rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                    />
                    <button type="submit" className="btn-gradient px-6 py-3 text-xs font-black">Search</button>
                </form>
                {(filters.status || filters.search) && (
                    <Link href={route('admin.orders.index')} className="px-4 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200">
                        Clear
                    </Link>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5">
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase">Order</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase">Service</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase">Customer</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase">Freelancer</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase">Amount</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase">Status</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {orders.data.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                <td className="p-4">
                                    <Link href={route('admin.orders.show', order.id)} className="font-black text-[#FF6600] hover:underline text-xs">
                                        {order.order_number}
                                    </Link>
                                </td>
                                <td className="p-4 font-bold text-gray-900 dark:text-white text-xs truncate max-w-[150px]">{order.service?.title}</td>
                                <td className="p-4 text-gray-500 text-xs">{order.customer?.name}</td>
                                <td className="p-4 text-gray-500 text-xs">{order.freelancer?.name}</td>
                                <td className="p-4 font-black text-gray-900 dark:text-white">RM {order.agreed_price}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${statusColors[order.status]}`}>
                                        {statusLabels[order.status]}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {orders.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="p-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400">
                            Showing {orders.from}-{orders.to} of {orders.total}
                        </p>
                        <div className="flex gap-1">
                            {orders.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1 rounded-lg text-xs font-black ${link.active ? 'bg-[#FF6600] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="px-3 py-1 text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
