import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';

export default function Failed({ error, orderNumber }) {
    return (
        <GuestLayout>
            <Head title="Payment Failed" />

            <div className="min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none p-12 text-center max-w-lg w-full"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center"
                    >
                        <XCircle className="w-12 h-12 text-red-500" />
                    </motion.div>

                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Payment <span className="text-red-500">Failed</span>
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {error || 'Your payment was not successful. Please try again.'}
                    </p>

                    {orderNumber && (
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Order Number</span>
                                <span className="font-bold text-gray-900 dark:text-white">{orderNumber}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href={route('subscriptions.plans')}
                            className="flex-1 px-6 py-4 bg-[#FF6600] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#FF6600]/30 hover:bg-[#e65c00] transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} /> Try Again
                        </Link>
                        <Link
                            href="/"
                            className="flex-1 px-6 py-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Home size={16} /> Home
                        </Link>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                        <p className="text-xs text-gray-400 mb-4">Need help with your payment?</p>
                        <a
                            href="mailto:support@oneclickhub.com"
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#FF6600] hover:underline"
                        >
                            <MessageCircle size={16} /> Contact Support
                        </a>
                    </div>
                </motion.div>
            </div>
        </GuestLayout>
    );
}
