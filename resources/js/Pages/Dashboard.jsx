import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    DollarSign,
    TrendingUp,
    ShoppingBag,
    BarChart3,
    PieChart as PieChartIcon,
    MessageCircle,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    MoreVertical
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';

const statsData = [
    { label: 'Registered Freelancers', value: '45,231', icon: Users, color: '#FF6600', trend: '+12.5%', isUp: true },
    { label: 'Registered Customers', value: '12,845', icon: UserCheck, color: '#FFB800', trend: '+5.2%', isUp: true },
    { label: 'Total Revenue', value: 'RM 284,500', icon: DollarSign, color: '#2B313F', trend: '+18.7%', isUp: true },
    { label: 'Orders Received', value: '1,540', icon: ShoppingBag, color: '#FF6600', trend: '-2.4%', isUp: false },
];

const chartData = [
    { name: 'Mon', orders: 45, revenue: 1200 },
    { name: 'Tue', orders: 52, revenue: 1500 },
    { name: 'Wed', orders: 48, revenue: 1100 },
    { name: 'Thu', orders: 70, revenue: 2100 },
    { name: 'Fri', orders: 61, revenue: 1800 },
    { name: 'Sat', orders: 38, revenue: 900 },
    { name: 'Sun', orders: 42, revenue: 1300 },
];

const categoryData = [
    { name: 'Web Design', value: 40, color: '#FF6600' },
    { name: 'Photography', value: 25, color: '#FFB800' },
    { name: 'Web Design', value: 20, color: '#2B313F' },
    { name: 'Web Design', value: 15, color: '#FFD700' },
];

const freelancers = [
    { name: 'Ahmad Faiz', category: 'Photography', rating: 4.9, earnings: 'RM 4,250', image: 'AF' },
    { name: 'Siti Nurhaliza', category: 'Web Design', rating: 4.8, earnings: 'RM 3,840', image: 'SN' },
    { name: 'Kevin Tan', category: 'Graphic Design', rating: 4.7, earnings: 'RM 2,900', image: 'KT' },
    { name: 'Maya Sari', category: 'Proofreading', rating: 4.9, earnings: 'RM 1,500', image: 'MS' },
    { name: 'John Doe', category: 'Catering', rating: 4.5, earnings: 'RM 850', image: 'JD' },
];

const StatCard = ({ label, value, icon: Icon, color, trend, isUp }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
                <Icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                {trend} {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </div>
        </div>
        <div>
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
            <div className="text-3xl font-black text-gray-900 dark:text-white leading-none">{value}</div>
        </div>
    </motion.div>
);

export default function Dashboard() {
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsData.map((stat, idx) => (stat && <StatCard key={idx} {...stat} />))}
                </div>

                {/* Growth & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Orders Analytics */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Order Analytics</h3>
                                <p className="text-gray-400 text-xs font-semibold">Weekly performance overview</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 rounded-lg text-[10px] font-bold bg-orange-50 dark:bg-orange-500/10 text-[#FF6600] border border-[#FF6600]/20">ORDERS</button>
                                <button className="px-3 py-1 rounded-lg text-[10px] font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">REVENUE</button>
                            </div>
                        </div>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FF6600" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#FFB800" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB33" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0c0c0c', border: 'none', borderRadius: '16px', color: '#fff' }}
                                        cursor={{ fill: '#F3F4F6', opacity: 0.1 }}
                                    />
                                    <Bar
                                        dataKey="orders"
                                        fill="url(#barGrad)"
                                        radius={[10, 10, 0, 0]}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subscriber Growth (Donut Chart) */}
                    <div className="bg-[#2B313F] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6600]/10 blur-[60px] rounded-full" />
                        <div className="relative flex-1">
                            <h3 className="text-xl font-bold text-white tracking-tight mb-2 text-center">Subscriber Growth</h3>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center mb-8">Growth since last week</p>
                            <div className="h-48 relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-3xl font-black text-white">+24%</div>
                                    <div className="text-[10px] font-bold text-white/50 tracking-widest">TOTAL GROWTH</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="size-3 bg-[#FF6600] rounded-full" />
                                    <span className="text-xs font-bold text-white/70">Social Referrals</span>
                                </div>
                                <span className="text-xs font-black text-white">65%</span>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="size-3 bg-[#FFB800] rounded-full" />
                                    <span className="text-xs font-bold text-white/70">Organic Ads</span>
                                </div>
                                <span className="text-xs font-black text-white">35%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Row: Freelancers & Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top 5 Freelancers */}
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Top 5 Freelancers</h3>
                            <button className="text-[#FF6600] text-xs font-bold flex items-center gap-1 hover:underline">View All <ArrowUpRight size={14} /></button>
                        </div>
                        <div className="space-y-6">
                            {freelancers.map((f, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#FF6600]/10 to-[#FFB800]/10 flex items-center justify-center font-black text-[#FF6600] group-hover:scale-110 transition-transform">
                                            {f.image}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{f.name}</div>
                                            <div className="text-[10px] font-semibold text-gray-400">{f.category}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-gray-900 dark:text-white">{f.earnings}</div>
                                        <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-yellow-500">
                                            <Star size={10} fill="currentColor" /> {f.rating}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Order Category */}
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#FF6600]/5 rounded-full blur-[80px]" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-8">Top Order Categories</h3>
                        <div className="space-y-8 relative z-10">
                            {[
                                { name: 'Photography', count: '1,240 orders', percent: 85, color: '#FF6600' },
                                { name: 'Catering Services', count: '854 orders', percent: 65, color: '#FFB800' },
                                { name: 'Web Development', count: '640 orders', percent: 45, color: '#2B313F' },
                                { name: 'Proofreading', count: '320 orders', percent: 25, color: '#FF6600' }
                            ].map((cat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">{cat.name}</span>
                                        <span className="text-[10px] font-bold text-gray-400">{cat.count}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${cat.percent}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
