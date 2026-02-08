import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import {
    MousePointerClick,
    Users,
    Globe,
    Zap,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Camera,
    Utensils,
    Layout,
    Code,
    Search,
    PenTool,
    Menu,
    X
} from 'lucide-react';

export default function Welcome({ auth, plans }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const categories = [
        { name: 'Catering', icon: <Utensils className="w-6 h-6" />, slug: 'catering' },
        { name: 'Event Hall', icon: <ShieldCheck className="w-6 h-6" />, slug: 'event-hall' },
        { name: 'Photography', icon: <Camera className="w-6 h-6" />, slug: 'photography' },
        { name: 'Web Design', icon: <Code className="w-6 h-6" />, slug: 'web-design' },
        { name: 'Graphic Design', icon: <PenTool className="w-6 h-6" />, slug: 'graphic-design' },
        { name: 'Proofreading', icon: <Search className="w-6 h-6" />, slug: 'proofreading' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c] selection:bg-[#FF6600] selection:text-white overflow-x-hidden font-sans">
            <Head title="One Click Hub - ASEAN's #1 Freelancer SAAS" />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6600]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB800]/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[100] glass border-b border-white/20 dark:border-white/5 h-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3 group flex-none cursor-pointer">
                        <div className="flex-none flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 w-10 h-10 md:w-12 md:h-12">
                            <ApplicationLogo />
                        </div>
                        <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ONECLICK<span className="text-gradient">HUB</span>
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <a href="#features" className="hover:text-[#FF6600] transition-colors">Features</a>
                        <a href="#solutions" className="hover:text-[#FF6600] transition-colors">Solutions</a>
                        <a href="#market" className="hover:text-[#FF6600] transition-colors">ASEAN Market</a>
                        <a href="#pricing" className="hover:text-[#FF6600] transition-colors">Pricing</a>
                        <Link href={route('services.browse')} className="hover:text-[#FF6600] transition-colors">Services</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth.user ? (
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
                                    { name: 'Features', href: '#features' },
                                    { name: 'Solutions', href: '#solutions' },
                                    { name: 'ASEAN Market', href: '#market' },
                                    { name: 'Pricing', href: '#pricing' },
                                    { name: 'Services', href: route('services.browse') }
                                ].map((item, idx) => (
                                    <motion.a
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-4xl font-black tracking-tighter hover:translate-x-4 transition-transform py-4 block uppercase"
                                    >
                                        {item.name}
                                    </motion.a>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-12 pt-12 border-t border-white/10"
                            >
                                {!auth.user ? (
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

            {/* Hero Section */}
            <header className="relative pt-40 pb-20 px-6 hero-pattern">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter mb-8 max-w-2xl">
                            Marketing <span className="text-gradient">Simplified</span> in One Click.
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-lg leading-relaxed">
                            The definitive SAAS platform for freelancers across Southeast Asia. Build your brand, find local customers, and manage your business from a single hub.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={route('register')} className="btn-gradient text-lg px-10 py-4 flex items-center justify-center gap-2">
                                Start Your Subscription <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href="#pricing" className="px-10 py-4 border-2 border-gray-200 dark:border-gray-800 rounded-full font-bold text-center text-gray-900 dark:text-gray-100 hover:border-[#FF6600] transition-colors">
                                View Pricing Plans
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/20 to-[#FFB800]/20 blur-[80px] -z-10" />
                        <div className="glass rounded-[2rem] p-4 p-8 transform rotate-3 animate-float overflow-hidden relative border-white/40 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-12 rounded-full bg-gradient-to-tr from-[#FF6600] to-[#FFB800]" />
                                <div className="space-y-2">
                                    <div className="w-32 h-3 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                    <div className="w-20 h-2 bg-gray-100 dark:bg-gray-900 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-40 bg-gray-100 dark:bg-gray-900 rounded-xl flex items-center justify-center">
                                    < TrendingUp className="w-16 h-16 text-[#FF6600] opacity-20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-20 bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4">
                                        <div className="text-xs font-bold text-[#FF6600]">REVENUE</div>
                                        <div className="text-2xl font-black dark:text-white">$12,450</div>
                                    </div>
                                    <div className="h-20 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-4">
                                        <div className="text-xs font-bold text-[#FFB800]">LEADS</div>
                                        <div className="text-2xl font-black dark:text-white">+84%</div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-xl animate-bounce">
                                <PenTool className="w-6 h-6 text-[#FF6600]" />
                            </div>
                            <div className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl shadow-xl animate-pulse">
                                <Users className="w-6 h-6 text-[#FFB800]" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Social Proof */}
            <section className="py-20 border-y border-gray-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-12">Trusted by Freelance Leaders in</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-2xl font-bold dark:text-white italic">SINGAPORE</span>
                        <span className="text-2xl font-bold dark:text-white italic">MALAYSIA</span>
                        <span className="text-2xl font-bold dark:text-white italic">INDONESIA</span>
                        <span className="text-2xl font-bold dark:text-white italic">THAILAND</span>
                        <span className="text-2xl font-bold dark:text-white italic">VIETNAM</span>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-32 px-6 bg-white dark:bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">
                                Built for every <span className="text-gradient">Sector</span>.
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Whether you're a gourmet caterer or a code ninja, OneClickHub provides the tools you need to dominate your local market.
                            </p>
                        </div>
                        <Link href={route('register')} className="mt-8 md:mt-0 text-[#FF6600] font-bold flex items-center gap-2 hover:underline">
                            Explore All Categories <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
                    >
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -10, scale: 1.05 }}
                                className="glass p-8 rounded-3xl text-center group cursor-pointer hover:border-[#FF6600] transition-colors"
                            >
                                <div className="size-16 mx-auto rounded-2xl bg-gray-50 dark:bg-gray-9010/10 flex items-center justify-center mb-6 group-hover:bg-[#FF6600]/10 transition-colors">
                                    <div className="text-gray-900 dark:text-white group-hover:text-[#FF6600] transition-colors">
                                        {cat.icon}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{cat.name}</h3>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features (Market Section) */}
            <section id="market" className="py-32 px-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-orange-500/5 blur-[150px] rounded-full" />
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
                    <div className="order-2 lg:order-1 lg:grid grid-cols-2 gap-6 space-y-6 lg:space-y-0">
                        <div className="space-y-6 pt-12">
                            <div className="glass p-8 rounded-[2rem] shadow-xl">
                                <TrendingUp className="w-8 h-8 text-[#FF6600] mb-4" />
                                <h4 className="font-bold text-xl mb-2 dark:text-white">Local SEO Max</h4>
                                <p className="text-sm text-gray-500">Optimized specifically for Southeast Asian search trends.</p>
                            </div>
                            <div className="glass p-8 rounded-[2rem] shadow-xl">
                                <Globe className="w-8 h-8 text-[#FFB800] mb-4" />
                                <h4 className="font-bold text-xl mb-2 dark:text-white">Region Ready</h4>
                                <p className="text-sm text-gray-500">Multi-currency and local payment gateway integrations.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="glass p-8 rounded-[2rem] shadow-xl">
                                <Users className="w-8 h-8 text-[#FFB800] mb-4" />
                                <h4 className="font-bold text-xl mb-2 dark:text-white">Community</h4>
                                <p className="text-sm text-gray-500">Access to the largest network of freelancers in ASEAN.</p>
                            </div>
                            <div className="glass p-8 rounded-[2rem] shadow-xl">
                                <ShieldCheck className="w-8 h-8 text-[#FF6600] mb-4" />
                                <h4 className="font-bold text-xl mb-2 dark:text-white">Smart Trust</h4>
                                <p className="text-sm text-gray-500">Verified reviews and secure escrow for peace of mind.</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9] mb-8">
                            Market your skills to the <span className="text-gradient">Right</span> people.
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                            We bridge the gap between talented freelancers and local businesses ready to pay for quality work. No more bidding wars on global platforms.
                        </p>
                        <ul className="space-y-4 mb-10">
                            {[
                                "Zero marketing spend for your first month",
                                "Direct access to WhatsApp/Telegram leads",
                                "Localized landing pages in seconds"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-200">
                                    <ShieldCheck className="w-5 h-5 text-[#FF6600]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="btn-gradient px-10 py-4 font-black">Learn About Local Growth</button>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-6 bg-gray-50 dark:bg-[#0c0c0c] relative transition-all">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/30 text-[#FF6600] text-xs font-bold uppercase tracking-widest mb-6 border border-orange-200 dark:border-orange-900/50">
                            Flexible Plans
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-6">
                            Pick Your <span className="text-gradient">Growth</span> Level.
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Transparent pricing designed for freelance growth across the ASEAN region.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass p-12 rounded-[3.5rem] relative flex flex-col ${plan.is_popular ? 'border-[#FF6600] shadow-2xl shadow-orange-500/10' : 'border-white/10'}`}
                            >
                                {plan.is_popular && (
                                    <div className="absolute top-8 right-8 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
                                        Best Value
                                    </div>
                                )}
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">{plan.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                                    Subscribe to {plan.name} and grow your freelance business annually.
                                </p>

                                <div className="flex items-baseline gap-1 mb-10">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">RM {Math.round(plan.price)}</span>
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">/yr</span>
                                </div>

                                <div className="space-y-6 flex-1 mb-12">
                                    {(plan.features || []).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-[#FF6600] flex-shrink-0" />
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={route('register', { plan: plan.slug })}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-center transition-all ${plan.is_popular ? 'btn-gradient' : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-[#FF6600]/10 hover:text-[#FF6600]'}`}
                                >
                                    {plan.is_popular ? 'Go Premium' : 'Get Started'}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-br from-gray-900 to-black p-12 lg:p-24 text-center relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6600]/20 blur-[100px] rounded-full" />
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                            Ready to join the <span className="text-gradient">Hub</span>?
                        </h2>
                        <p className="text-gray-400 text-xl mb-12">
                            Join thousands of successful freelancers growing their brands across Southeast Asia. Start your 14-day free trial today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={route('register')} className="btn-gradient text-xl px-12 py-5 font-black">
                                Get Started for Free
                            </Link>
                            <button className="px-12 py-5 border-2 border-white/20 rounded-full font-black text-white hover:bg-white/5 transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0c0c0c]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center p-2 shadow-sm">
                            <ApplicationLogo />
                        </div>
                        <span className="text-xl font-black dark:text-white tracking-tighter uppercase">OneClickHub</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm font-bold text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Local Offices</a>
                        <a href="#" className="hover:text-white transition-colors">ASEAN Support</a>
                    </div>
                    <p className="text-gray-500 text-sm">© 2026 OneClickHub Enterprise. Designed for the Future.</p>
                </div>
            </footer>
        </div>
    );
}
