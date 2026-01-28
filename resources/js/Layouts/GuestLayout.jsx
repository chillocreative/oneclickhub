import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function GuestLayout({ children, maxWidth = 'max-w-md' }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-white dark:bg-[#0c0c0c] font-sans">
            {/* ... (background code remains the same) ... */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF6600]/10 dark:bg-[#FF6600]/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        x: [0, -40, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFB800]/15 dark:bg-[#FFB800]/25 rounded-full blur-[100px]"
                />
                <div className="absolute inset-0 hero-pattern opacity-30 pointer-events-none" />
            </div>

            {/* Navigation Header */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/20 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer border-none shadow-none bg-transparent hover:bg-transparent">
                        <ApplicationLogo className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ONECLICK<span className="text-[#FF6600]">HUB</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <Link href="/#features" className="hover:text-[#FF6600] transition-colors">Features</Link>
                        <Link href="/#solutions" className="hover:text-[#FF6600] transition-colors">Solutions</Link>
                        <Link href="/#market" className="hover:text-[#FF6600] transition-colors">ASEAN Market</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="btn-gradient px-6 py-2 text-sm">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-[#FF6600]">
                                    Sign In
                                </Link>
                                <Link href={route('register')} className="btn-gradient px-6 py-2 text-sm">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6 pt-24"
            >
                <div className={`w-full ${maxWidth} overflow-hidden glass p-8 shadow-2xl rounded-[2.5rem] border border-white/40 dark:border-white/10 relative transition-all duration-500`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6600] to-[#FFB800]" />
                    {children}
                </div>

                <p className="mt-8 text-sm text-gray-500 font-bold tracking-tight">
                    &copy; 2026 OneClickHub Enterprise &bull; ASEAN Trusted
                </p>
            </motion.div>
        </div>
    );
}
