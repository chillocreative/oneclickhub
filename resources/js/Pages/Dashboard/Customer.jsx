import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Heart, ArrowRight } from 'lucide-react';

export default function CustomerDashboard() {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Welcome, <span className="text-[#FF6600]">{auth.user.name}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Discover and book amazing services.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div whileHover={{ y: -5 }}>
                        <Link
                            href={route('services.browse')}
                            className="block bg-gradient-to-br from-[#FF6600] to-[#FFB800] p-8 rounded-[2rem] text-white shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <Search size={32} className="mb-4" />
                            <h3 className="text-lg font-black mb-1">Browse Services</h3>
                            <p className="text-white/80 text-sm">Find the perfect freelancer for your needs</p>
                            <ArrowRight size={20} className="mt-4" />
                        </Link>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }}>
                        <div className="block bg-white dark:bg-[#0c0c0c] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                            <ShoppingBag size={32} className="mb-4 text-[#FF6600]" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">My Bookings</h3>
                            <p className="text-gray-400 text-sm">No bookings yet</p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-4">Coming Soon</p>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }}>
                        <div className="block bg-white dark:bg-[#0c0c0c] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                            <Heart size={32} className="mb-4 text-[#FF6600]" />
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Favorites</h3>
                            <p className="text-gray-400 text-sm">Save services you love</p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-4">Coming Soon</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
