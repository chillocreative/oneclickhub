import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, Zap, Shield, Crown } from 'lucide-react';

export default function SubscriptionPlans() {
    const plans = [
        {
            id: 1,
            name: 'Starter Hub',
            price: '49',
            period: 'mo',
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            features: ['5 Service Categories', 'Basic CRM', 'Local SEO basic', 'WhatsApp integration limited'],
            status: 'Active'
        },
        {
            id: 2,
            name: 'Premium Pro',
            price: '199',
            period: 'mo',
            icon: Crown,
            color: 'text-[#FF6600]',
            bg: 'bg-orange-50',
            features: ['Unlimited Categories', 'Advanced Analytics', 'Local SEO plus', 'Full WhatsApp Hub', 'Priority Support'],
            status: 'Active',
            popular: true
        },
        {
            id: 3,
            name: 'Enterprise Hub',
            price: '999',
            period: 'yr',
            icon: Shield,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            features: ['Custom Solutions', 'Dedicated Account Mgr', 'API Access', 'White Label Options'],
            status: 'Draft'
        }
    ];

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
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#34C38F] hover:bg-[#2ca377] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#34C38F]/20 transition-all active:scale-95">
                        <Plus size={18} />
                        New Plan
                    </button>
                </div>
            }
        >
            <Head title="Manage Subscription Plans" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-white dark:bg-[#111] rounded-[3rem] border ${plan.popular ? 'border-[#FF6600]' : 'border-gray-100 dark:border-white/5'} shadow-xl shadow-gray-200/50 dark:shadow-none p-10 relative overflow-hidden group`}
                    >
                        {plan.popular && (
                            <div className="absolute top-8 -right-8 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest py-1 px-10 rotate-45 shadow-lg">
                                Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <div className={`size-16 rounded-3xl ${plan.bg} dark:bg-white/5 flex items-center justify-center ${plan.color} mb-6`}>
                                <plan.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">RM {plan.price}</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/{plan.period}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="size-5 rounded-full bg-[#34C38F]/10 flex items-center justify-center">
                                        <Check size={12} className="text-[#34C38F]" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-tight">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 pt-8 border-t border-gray-50 dark:border-white/5">
                            <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all">
                                <Edit2 size={16} />
                                Edit
                            </button>
                            <button className="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
