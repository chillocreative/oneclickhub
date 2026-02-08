import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function SubscriptionIndex() {
    const stats = [
        { label: 'Active Subscribers', value: '1,284', grow: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Monthly Revenue', value: 'RM 12,450', grow: '+8.4%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Subscription Rate', value: '42%', grow: '+2.1%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                        REVENUE <span className="text-[#FF6600]">OVERVIEW</span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        <span>Revenue Center</span>
                        <span className="size-1 bg-gray-300 rounded-full" />
                        <span className="text-[#FF6600]">Subscriptions</span>
                    </div>
                </div>
            }
        >
            <Head title="Subscription Overview" />

            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group"
                        >
                            <div className="relative z-10 flex items-center justify-between mb-4">
                                <div className={`size-14 rounded-2xl ${stat.bg} dark:bg-white/5 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon size={28} />
                                </div>
                                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg">
                                    {stat.grow}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</div>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-6 -right-6' opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                                <stat.icon size={120} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">
                                Subscription <span className="text-[#FF6600]">Analytics</span>
                            </h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-lg">
                                Track the growth and performance of your subscription models across Malaysia.
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-8 py-4 bg-[#FF6600] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF6600]/30 hover:bg-[#e65c00] transition-all active:scale-95">
                            Extract Data Report
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Highlights Chart Placeholder */}
                        <div className="aspect-video bg-[#fcfcfc] dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center flex-col gap-4">
                            <CreditCard size={48} className="text-gray-300" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue Growth Chart coming soon</span>
                        </div>

                        {/* Recent Subscribers List */}
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Recent Subscribers</h4>
                            {[
                                { name: 'Ahmad Faisal', plan: 'Premium Pro', date: '2 mins ago', amount: 'RM 199' },
                                { name: 'Tristan Tan', plan: 'Starter Hub', date: '3 hours ago', amount: 'RM 49' },
                                { name: 'Siti Norhaliza', plan: 'Premium Pro', date: '5 hours ago', amount: 'RM 199' },
                                { name: 'Marcus Wong', plan: 'Starter Hub', date: 'Yesterday', amount: 'RM 49' },
                            ].map((sub, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[#fcfcfc] dark:bg-white/5 rounded-2xl border border-gray-50 dark:border-white/5 group hover:border-[#FF6600]/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[2px]">
                                            <div className="size-full bg-white dark:bg-[#111] rounded-full flex items-center justify-center font-black text-[#FF6600] text-xs uppercase">
                                                {sub.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">{sub.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sub.plan} • {sub.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-emerald-500">+{sub.amount}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
