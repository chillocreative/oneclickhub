import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';

export default function GuestLayout({ children, maxWidth = 'max-w-md' }) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-white dark:bg-[#0c0c0c] font-sans">
            {/* Background Effects */}
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
            <nav className="fixed top-0 w-full z-[100] glass border-b border-white/20 dark:border-white/5 h-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group flex-none cursor-pointer border-none shadow-none bg-transparent hover:bg-transparent">
                        <div className="flex-none flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 w-10 h-10 md:w-12 md:h-12">
                            <ApplicationLogo />
                        </div>
                        <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ONECLICK<span className="text-[#FF6600]">HUB</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <Link href="/#features" className="hover:text-[#FF6600] transition-colors">Features</Link>
                        <Link href="/#solutions" className="hover:text-[#FF6600] transition-colors">Solutions</Link>
                        <Link href="/#market" className="hover:text-[#FF6600] transition-colors">ASEAN Market</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="hidden lg:inline-flex btn-gradient px-6 py-2 text-sm">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="hidden lg:block text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-[#FF6600]">
                                    Sign In
                                </Link>
                                <Link href={route('register')} className="hidden lg:inline-flex btn-gradient px-6 py-2 text-sm">
                                    Get Started
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-[#FF6600]" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="lg:hidden fixed inset-0 z-[999] bg-[#FF6600] text-white flex flex-col"
                    >
                        {/* Background Gradient Layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600] via-[#FF8800] to-[#FFB800] z-[-1]" />

                        {/* Menu Header */}
                        <div className="flex items-center justify-between px-6 h-20 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-4 flex-none">
                                <div className="flex-none w-10 h-10 flex items-center justify-center overflow-hidden">
                                    <ApplicationLogo />
                                </div>
                                <span className="text-xl font-black tracking-tighter text-white uppercase whitespace-nowrap">
                                    OneClickHub
                                </span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                            >
                                <X className="w-8 h-8 text-white" />
                            </button>
                        </div>

                        {/* Menu Links */}
                        <div className="flex-1 overflow-y-auto px-8 py-12 flex flex-col justify-center">
                            <div className="space-y-2">
                                {[
                                    { name: 'Features', href: '/#features' },
                                    { name: 'Solutions', href: '/#solutions' },
                                    { name: 'ASEAN Market', href: '/#market' },
                                    { name: 'Pricing', href: '/#pricing' }
                                ].map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-4xl font-black tracking-tighter hover:translate-x-4 transition-transform py-4 block uppercase"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-12 pt-12 border-t border-white/10"
                            >
                                {!auth?.user ? (
                                    <div className="grid gap-6">
                                        <Link href={route('login')} className="text-2xl font-bold py-2">Sign In</Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-white text-[#FF6600] text-center py-6 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-black/20"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-white text-[#FF6600] text-center py-6 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-black/20 block"
                                    >
                                        Go to Dashboard
                                    </Link>
                                )}
                            </motion.div>
                        </div>

                        {/* Decorative element */}
                        <Zap className="absolute bottom-10 right-10 w-32 h-32 text-white opacity-10 pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

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
