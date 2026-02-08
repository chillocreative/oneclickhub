import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Search,
    Download,
    ArrowUpRight,
    Clock,
    CheckCircle,
    XCircle,
    CreditCard,
    Wallet,
    User,
    Trash2,
    Eye,
} from 'lucide-react';
import { useState } from 'react';

export default function Transactions({ transactions, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const getStatusStyle = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'success': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600';
            case 'failed': return 'bg-red-100 dark:bg-red-500/10 text-red-500';
            case 'pending': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-600';
            default: return 'bg-gray-100 dark:bg-white/5 text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'success': return <CheckCircle size={14} />;
            case 'failed': return <XCircle size={14} />;
            case 'pending': return <Clock size={14} />;
            default: return null;
        }
    };

    const getGatewayIcon = (gateway) => {
        switch ((gateway || '').toLowerCase()) {
            case 'manual': return <Wallet size={16} className="text-purple-500" />;
            default: return <CreditCard size={16} className="text-blue-500" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('subscriptions.transactions'), { ...filters, search }, { preserveState: true });
    };

    const filterByStatus = (status) => {
        router.get(route('subscriptions.transactions'), { ...filters, status, search: filters.search }, { preserveState: true });
    };

    const totalVolume = (transactions.data || []).reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const successCount = (transactions.data || []).filter(t => t.status === 'success').length;
    const successRate = (transactions.data || []).length > 0 ? Math.round((successCount / transactions.data.length) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                            REVENUE <span className="text-[#FF6600]">TRANSACTIONS</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            <span>Revenue Center</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span className="text-[#FF6600]">Transactions</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Transaction History" />

            <div className="space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#111] rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Volume</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">RM {totalVolume.toLocaleString()}</h3>
                        <div className="flex items-center gap-2 mt-4 text-emerald-500">
                            <span className="size-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><ArrowUpRight size={16} /></span>
                            <span className="text-sm font-bold">This page</span>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#111] rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Success Rate</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{successRate}%</h3>
                        <div className="flex items-center gap-2 mt-4 text-blue-500">
                            <span className="size-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><CheckCircle size={16} /></span>
                            <span className="text-sm font-bold">Verified</span>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#111] rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Transactions</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{transactions.total}</h3>
                        <div className="flex items-center gap-2 mt-4 text-[#FF6600]">
                            <span className="size-8 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center"><Clock size={16} /></span>
                            <span className="text-sm font-bold">Processed</span>
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Area */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-md flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, User..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#FF6600]/20"
                                />
                            </div>
                            <button type="submit" className="btn-gradient px-5 py-3 text-xs font-black">Search</button>
                        </form>
                        <div className="flex items-center gap-3">
                            {/* Status filter pills */}
                            {['success', 'pending', 'failed'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => filterByStatus(filters.status === s ? null : s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filters.status === s ? 'bg-[#FF6600] text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {s}
                                </button>
                            ))}
                            {(filters.status || filters.search) && (
                                <Link href={route('subscriptions.transactions')} className="px-4 py-2 text-xs font-black text-gray-400 hover:text-gray-600">Clear</Link>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5 text-left">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction / User</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {transactions.data.map((transaction, idx) => (
                                    <motion.tr key={transaction.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF6600]">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">#{transaction.order_number}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                        <User size={12} />
                                                        {transaction.user?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {transaction.plan?.name || 'Manual'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-gray-900 dark:text-white">RM {parseFloat(transaction.amount).toFixed(2)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{formatDate(transaction.created_at)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {getGatewayIcon(transaction.gateway)}
                                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">{transaction.gateway}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${getStatusStyle(transaction.status)}`}>
                                                {getStatusIcon(transaction.status)}
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link href={route('subscriptions.transactions.show', transaction.id)} className="p-2 text-gray-400 hover:text-[#FF6600] rounded-xl transition-colors inline-block">
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-gray-400 text-sm">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="p-8 border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/2 flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Showing {transactions.from}-{transactions.to} of {transactions.total} transactions
                            </p>
                            <div className="flex items-center gap-2">
                                {transactions.links.map((link, i) => (
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${link.active ? 'bg-[#FF6600] text-white shadow-lg shadow-[#FF6600]/30' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={i} className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-300 pointer-events-none" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
