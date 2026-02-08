import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, Zap, Shield, Crown, X, Users, Power } from 'lucide-react';
import { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function SubscriptionPlans({ plans }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const openCreateModal = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = (plan) => {
        if (plan.subscriptions_count > 0) {
            alert(`Cannot delete plan with ${plan.subscriptions_count} active subscriber(s).`);
            return;
        }
        if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
            router.delete(route('subscriptions.plans.destroy', plan.id));
        }
    };

    const getIcon = (index) => {
        const icons = [Zap, Crown, Shield];
        return icons[index % icons.length];
    };

    const getColors = (index, isPopular) => {
        if (isPopular) return { color: 'text-[#FF6600]', bg: 'bg-orange-50 dark:bg-orange-500/10' };
        const colors = [
            { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { color: 'text-[#FF6600]', bg: 'bg-orange-50 dark:bg-orange-500/10' },
            { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        ];
        return colors[index % colors.length];
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                            PLAN <span className="text-[#FF6600]">MANAGEMENT</span>
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                            <span>Revenue Center</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span>Subscriptions</span>
                            <span className="size-1 bg-gray-300 rounded-full" />
                            <span className="text-[#FF6600]">Plans Management</span>
                        </div>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-6 py-3 bg-[#34C38F] hover:bg-[#2ca377] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#34C38F]/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        New Plan
                    </button>
                </div>
            }
        >
            <Head title="Manage Subscription Plans" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.map((plan, i) => {
                    const Icon = getIcon(i);
                    const colors = getColors(i, plan.is_popular);

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`bg-white dark:bg-[#111] rounded-[3rem] border ${plan.is_popular ? 'border-[#FF6600]' : 'border-gray-100 dark:border-white/5'} shadow-xl shadow-gray-200/50 dark:shadow-none p-10 relative overflow-hidden group ${!plan.is_active ? 'opacity-60' : ''}`}
                        >
                            {plan.is_popular && (
                                <div className="absolute top-8 -right-8 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest py-1 px-10 rotate-45 shadow-lg">
                                    Popular
                                </div>
                            )}

                            {!plan.is_active && (
                                <div className="absolute top-4 left-4 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">
                                    Inactive
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`size-16 rounded-3xl ${colors.bg} flex items-center justify-center ${colors.color} mb-6`}>
                                    <Icon size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">RM {parseFloat(plan.price).toFixed(0)}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/yr</span>
                                </div>

                                {plan.subscriptions_count > 0 && (
                                    <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-[#34C38F]">
                                        <Users size={14} />
                                        {plan.subscriptions_count} active subscriber{plan.subscriptions_count !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 mb-10">
                                {(plan.features || []).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="size-5 rounded-full bg-[#34C38F]/10 flex items-center justify-center">
                                            <Check size={12} className="text-[#34C38F]" strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 pt-8 border-t border-gray-50 dark:border-white/5">
                                <button
                                    onClick={() => openEditModal(plan)}
                                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(plan)}
                                    className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}

                {plans.length === 0 && (
                    <div className="col-span-3 text-center py-20">
                        <div className="text-gray-400 mb-4">No subscription plans yet</div>
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 bg-[#FF6600] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF6600]/30"
                        >
                            Create Your First Plan
                        </button>
                    </div>
                )}
            </div>

            <PlanModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={editingPlan}
            />
        </AuthenticatedLayout>
    );
}

function PlanModal({ show, onClose, plan }) {
    const isEditing = !!plan;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: plan?.name || '',
        price: plan?.price || '',
        interval: 'year',
        features: plan?.features || [''],
        is_active: plan?.is_active ?? true,
        is_popular: plan?.is_popular ?? false,
        description: plan?.description || '',
    });

    // Reset form when plan changes
    useEffect(() => {
        if (plan) {
            setData({
                name: plan.name || '',
                price: plan.price || '',
                interval: 'year',
                features: plan.features || [''],
                is_active: plan.is_active ?? true,
                is_popular: plan.is_popular ?? false,
                description: plan.description || '',
            });
        } else {
            reset();
        }
    }, [plan]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Filter out empty features
        const cleanedData = {
            ...data,
            features: data.features.filter(f => f.trim() !== '')
        };

        if (isEditing) {
            patch(route('subscriptions.plans.update', plan.id), {
                data: cleanedData,
                onSuccess: () => {
                    onClose();
                    reset();
                }
            });
        } else {
            post(route('subscriptions.plans.store'), {
                data: cleanedData,
                onSuccess: () => {
                    onClose();
                    reset();
                }
            });
        }
    };

    const addFeature = () => {
        setData('features', [...data.features, '']);
    };

    const removeFeature = (index) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    const updateFeature = (index, value) => {
        const newFeatures = [...data.features];
        newFeatures[index] = value;
        setData('features', newFeatures);
    };

    if (!show) return null;

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
                    className="relative bg-white dark:bg-[#111] rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-8 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                                {isEditing ? 'Edit' : 'New'} <span className="text-[#FF6600]">Plan</span>
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <InputLabel value="Plan Name" />
                            <TextInput
                                className="w-full"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. Premium Pro"
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <InputLabel value="Price (RM)" />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    className="w-full"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                            </div>
                            <div className="space-y-2">
                                <InputLabel value="Billing Interval" />
                                <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-sm font-bold py-3 px-4 text-gray-600 dark:text-gray-300">
                                    Yearly (365 days)
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <InputLabel value="Features" />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="text-xs font-bold text-[#FF6600] hover:underline"
                                >
                                    + Add Feature
                                </button>
                            </div>
                            {data.features.map((feature, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <TextInput
                                        className="flex-1"
                                        value={feature}
                                        onChange={e => updateFeature(idx, e.target.value)}
                                        placeholder={`Feature ${idx + 1}`}
                                    />
                                    {data.features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(idx)}
                                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {errors.features && <p className="text-red-500 text-xs">{errors.features}</p>}
                        </div>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-gray-300 text-[#FF6600] focus:ring-[#FF6600]/20"
                                />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_popular}
                                    onChange={e => setData('is_popular', e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-gray-300 text-[#FF6600] focus:ring-[#FF6600]/20"
                                />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Mark as Popular</span>
                            </label>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 px-6 py-4 bg-[#FF6600] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF6600]/30 hover:bg-[#e65c00] transition-all disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
