import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import UserEditModal from '@/Components/UserEditModal';
import UserAddModal from '@/Components/UserAddModal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit2, Trash2, Crown, Zap, Shield,
    Calendar, Clock, XCircle, CheckCircle, Users, CreditCard
} from 'lucide-react';

export default function Freelancers({ users, plans }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    const handleManageSubscription = (user) => {
        setSelectedUser(user);
        setIsSubscriptionModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number?.includes(searchQuery)
    );

    const getSubscriptionBadge = (subscription) => {
        if (!subscription) {
            return (
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                    No Plan
                </span>
            );
        }

        const isExpiring = subscription.ends_at && new Date(subscription.ends_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return (
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 ${subscription.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-red-100 dark:bg-red-500/10 text-red-500'} text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1`}>
                    {subscription.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {subscription.plan?.name || 'Unknown'}
                </span>
                {isExpiring && subscription.status === 'active' && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                        Expiring Soon
                    </span>
                )}
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                            FREELANCER <span className="text-[#FF6600]">LIST</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            <span>Users</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span>User Control</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span className="text-[#FF6600]">Freelancers</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#34C38F] hover:bg-[#2ca377] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#34C38F]/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add Freelancer
                    </button>
                </div>
            }
        >
            <Head title="Freelancers" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-100 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                                <Users size={24} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{users.length}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Freelancers</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-100 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle size={24} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                    {users.filter(u => u.subscription?.status === 'active').length}
                                </p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Subs</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-100 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                                <Clock size={24} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">
                                    {users.filter(u => !u.subscription).length}
                                </p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Plan</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-100 dark:border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                                <CreditCard size={24} className="text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{plans.length}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Plans</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Search & Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-[#111] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-white/5">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search freelancers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#FF6600]/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Freelancer</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Valid Until</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {filteredUsers.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-gradient-to-br from-[#FF6600] to-[#FF8533] flex items-center justify-center text-white font-black text-sm">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.position || 'Freelancer'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{user.phone_number}</p>
                                            <p className="text-xs text-gray-400">{user.email || 'No email'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getSubscriptionBadge(user.subscription)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.subscription?.ends_at ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {formatDate(user.subscription.ends_at)}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleManageSubscription(user)}
                                                    className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors"
                                                    title="Manage Subscription"
                                                >
                                                    <Crown size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-[#FF6600] hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            {searchQuery ? 'No freelancers found matching your search.' : 'No freelancers yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <UserEditModal
                show={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                user={selectedUser}
                role="Freelancer"
            />

            <UserAddModal
                show={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                role="Freelancer"
            />

            <SubscriptionModal
                show={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                user={selectedUser}
                plans={plans}
            />
        </AuthenticatedLayout>
    );
}

function SubscriptionModal({ show, onClose, user, plans }) {
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [processing, setProcessing] = useState(false);

    if (!show || !user) return null;

    const handleAssign = () => {
        if (!selectedPlanId) return;
        setProcessing(true);
        router.post(route('users.subscription.assign', user.id), {
            plan_id: selectedPlanId
        }, {
            onSuccess: () => {
                onClose();
                setSelectedPlanId('');
            },
            onFinish: () => setProcessing(false)
        });
    };

    const handleCancel = () => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return;
        setProcessing(true);
        router.delete(route('users.subscription.cancel', user.id), {
            onSuccess: onClose,
            onFinish: () => setProcessing(false)
        });
    };

    const getPlanIcon = (index) => {
        const icons = [Zap, Crown, Shield];
        return icons[index % icons.length];
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white dark:bg-[#111] rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    <div className="p-8 border-b border-gray-100 dark:border-white/5">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                            Manage <span className="text-[#FF6600]">Subscription</span>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">for {user.name}</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Current Subscription */}
                        {user.subscription ? (
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5 rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Current Plan</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{user.subscription.plan?.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            RM {parseFloat(user.subscription.plan?.price || 0).toFixed(2)} / {user.subscription.plan?.interval}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {user.subscription.ends_at ? new Date(user.subscription.ends_at).toLocaleDateString('en-MY') : 'Never'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    disabled={processing}
                                    className="mt-4 w-full px-4 py-3 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-200 dark:hover:bg-red-500/20 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : 'Cancel Subscription'}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 text-center">
                                <p className="text-gray-500">No active subscription</p>
                            </div>
                        )}

                        {/* Assign New Plan */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {user.subscription ? 'Change Plan' : 'Assign Plan'}
                            </p>
                            <div className="space-y-3">
                                {plans.map((plan, i) => {
                                    const Icon = getPlanIcon(i);
                                    const isCurrentPlan = user.subscription?.plan?.id === plan.id;

                                    return (
                                        <label
                                            key={plan.id}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlanId == plan.id
                                                ? 'border-[#FF6600] bg-orange-50 dark:bg-orange-500/10'
                                                : isCurrentPlan
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                                    : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="plan"
                                                value={plan.id}
                                                checked={selectedPlanId == plan.id}
                                                onChange={(e) => setSelectedPlanId(e.target.value)}
                                                className="hidden"
                                                disabled={isCurrentPlan}
                                            />
                                            <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-[#FF6600]">
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white">{plan.name}</p>
                                                <p className="text-sm text-gray-500">RM {parseFloat(plan.price).toFixed(0)} / {plan.interval}</p>
                                            </div>
                                            {isCurrentPlan && (
                                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={processing || !selectedPlanId}
                                className="flex-1 px-6 py-4 bg-[#FF6600] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF6600]/30 hover:bg-[#e65c00] transition-all disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Assign Plan'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
