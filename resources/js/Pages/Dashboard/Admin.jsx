import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    DollarSign,
    ShoppingBag,
    CreditCard,
    FileCheck,
    Star,
    ArrowUpRight,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#FF6600', '#FFB800', '#2B313F', '#FFD700', '#4CAF50', '#9C27B0'];

const formatRM = (value) => {
    return 'RM ' + Number(value || 0).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
                <Icon size={24} />
            </div>
        </div>
        <div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
            <div className="text-3xl font-black text-gray-900 dark:text-white leading-none">{value}</div>
        </div>
    </motion.div>
);

export default function AdminDashboard({ stats = {}, chartData = [], categoryBreakdown = [], topFreelancers = [], topCategories = [] }) {
    const statsCards = [
        { label: 'Registered Freelancers', value: (stats.freelancers ?? 0).toLocaleString(), icon: Users, color: '#FF6600' },
        { label: 'Registered Customers', value: (stats.customers ?? 0).toLocaleString(), icon: UserCheck, color: '#FFB800' },
        { label: 'Total Revenue', value: formatRM(stats.revenue), icon: DollarSign, color: '#2B313F' },
        { label: 'Total Orders', value: (stats.orders ?? 0).toLocaleString(), icon: ShoppingBag, color: '#FF6600' },
        { label: 'Active Subscriptions', value: (stats.activeSubscriptions ?? 0).toLocaleString(), icon: CreditCard, color: '#FFB800' },
        { label: 'Pending SSM', value: (stats.pendingSsm ?? 0).toLocaleString(), icon: FileCheck, color: '#2B313F' },
    ];

    const categoryWithColors = categoryBreakdown.map((c, i) => ({
        ...c,
        color: COLORS[i % COLORS.length],
    }));

    const totalServices = categoryBreakdown.reduce((sum, c) => sum + c.value, 0);

    const maxOrders = topCategories.length > 0 ? Math.max(...topCategories.map(c => c.order_count)) : 1;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Overview <span className="text-[#FF6600]">Dashboard</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">Welcome back! Here's what's happening with Hub today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Whatsapp Online</span>
                        </div>
                        <button className="btn-gradient px-6 py-2 text-xs">Generate Report</button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statsCards.map((stat, idx) => (
                        <StatCard key={idx} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Order Analytics</h3>
                                <p className="text-gray-400 text-xs font-semibold">Last 7 days performance</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#FF6600" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#FFB800" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB33" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0c0c0c', border: 'none', borderRadius: '16px', color: '#fff' }} cursor={{ fill: '#F3F4F6', opacity: 0.1 }} />
                                        <Bar dataKey="orders" fill="url(#barGrad)" radius={[10, 10, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No order data for the last 7 days</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#2B313F] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6600]/10 blur-[60px] rounded-full" />
                        <div className="relative flex-1">
                            <h3 className="text-xl font-bold text-white tracking-tight mb-2 text-center">Service Categories</h3>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center mb-8">Distribution by category</p>
                            <div className="h-48 relative flex items-center justify-center">
                                {categoryWithColors.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={categoryWithColors} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                                {categoryWithColors.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : null}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-3xl font-black text-white">{totalServices}</div>
                                    <div className="text-[10px] font-bold text-white/50 tracking-widest">TOTAL SERVICES</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            {categoryWithColors.slice(0, 4).map((cat, i) => (
                                <div key={i} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className="text-xs font-bold text-white/70">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{totalServices > 0 ? Math.round((cat.value / totalServices) * 100) : 0}%</span>
                                </div>
                            ))}
                            {categoryWithColors.length === 0 && (
                                <p className="text-white/40 text-xs text-center">No categories yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Top 5 Freelancers</h3>
                        </div>
                        <div className="space-y-6">
                            {topFreelancers.length > 0 ? topFreelancers.map((f, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#FF6600]/10 to-[#FFB800]/10 flex items-center justify-center font-black text-[#FF6600] group-hover:scale-110 transition-transform">
                                            {f.initials}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{f.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-gray-900 dark:text-white">{formatRM(f.earnings)}</div>
                                        {f.rating && (
                                            <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-yellow-500">
                                                <Star size={10} fill="currentColor" /> {f.rating}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-400 text-sm text-center py-8">No completed orders yet</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#FF6600]/5 rounded-full blur-[80px]" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-8">Top Order Categories</h3>
                        <div className="space-y-8 relative z-10">
                            {topCategories.length > 0 ? topCategories.map((cat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{cat.name}</span>
                                        <span className="text-[10px] font-bold text-gray-400">{cat.order_count.toLocaleString()} orders</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(cat.order_count / maxOrders) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
