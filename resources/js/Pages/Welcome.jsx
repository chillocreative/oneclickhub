import ApplicationLogo from '@/Components/ApplicationLogo';
import AnimatedPreloader from '@/Components/AnimatedPreloader';
import AppStoreBadges from '@/Components/AppStoreBadges';
import BackToTop from '@/Components/BackToTop';
import PublicHeader from '@/Components/PublicHeader';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import {
    Users,
    Globe,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Camera,
    Utensils,
    Code,
    Search,
    PenTool,
} from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function Welcome({ auth, plans }) {
    const [showPreloader, setShowPreloader] = useState(true);
    const { t } = useLanguage();

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
        <>
            {showPreloader && <AnimatedPreloader onComplete={() => setShowPreloader(false)} />}

            <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c] selection:bg-[#FF6600] selection:text-white overflow-x-hidden font-sans">
                <Head title={t('meta.title')} />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6600]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB800]/10 rounded-full blur-[120px] animate-pulse" />
            </div>

            <PublicHeader active="home" />

            {/* Hero Section */}
            <header className="relative pt-40 pb-20 px-6 hero-pattern">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter mb-8 max-w-2xl">
                            {t('hero.title1')} <span className="text-gradient">{t('hero.title2')}</span> {t('hero.title3')}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-lg leading-relaxed">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href={route('register')} className="btn-gradient text-lg px-10 py-4 flex items-center justify-center gap-2">
                                {t('hero.cta')} <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href="#pricing" className="px-10 py-4 border-2 border-gray-200 dark:border-gray-800 rounded-full font-bold text-center text-gray-900 dark:text-gray-100 hover:border-[#FF6600] transition-colors">
                                {t('hero.viewPricing')}
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
                    <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-12">{t('social.title')}</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-2xl font-bold dark:text-white italic">{t('social.kl')}</span>
                        <span className="text-2xl font-bold dark:text-white italic">{t('social.penang')}</span>
                        <span className="text-2xl font-bold dark:text-white italic">{t('social.johor')}</span>
                        <span className="text-2xl font-bold dark:text-white italic">{t('social.sabah')}</span>
                        <span className="text-2xl font-bold dark:text-white italic">{t('social.sarawak')}</span>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-32 px-6 bg-white dark:bg-[#080808]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">
                                {t('categories.title')} <span className="text-gradient">{t('categories.titleHighlight')}</span>.
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                {t('categories.subtitle')}
                            </p>
                        </div>
                        <Link href={route('register')} className="mt-8 md:mt-0 text-[#FF6600] font-bold flex items-center gap-2 hover:underline">
                            {t('categories.exploreAll')} <ArrowRight className="w-4 h-4" />
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
                                <h4 className="font-bold text-xl mb-2 dark:text-white">{t('market.seo.title')}</h4>
                                <p className="text-sm text-gray-500">{t('market.seo.desc')}</p>
                            </div>
                            <div className="glass p-8 rounded-[2rem] shadow-xl">
                                <Globe className="w-8 h-8 text-[#FFB800] mb-4" />
                                <h4 className="font-bold text-xl mb-2 dark:text-white">{t('market.region.title')}</h4>
                                <p className="text-sm text-gray-500">{t('market.region.desc')}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="glass p-8 rounded-[2rem] shadow-xl">
                                <Users className="w-8 h-8 text-[#FFB800] mb-4" />
                                <h4 className="font-bold text-xl mb-2 dark:text-white">{t('market.community.title')}</h4>
                                <p className="text-sm text-gray-500">{t('market.community.desc')}</p>
                            </div>
                            <div className="glass p-8 rounded-[2rem] shadow-xl">
                                <ShieldCheck className="w-8 h-8 text-[#FF6600] mb-4" />
                                <h4 className="font-bold text-xl mb-2 dark:text-white">{t('market.trust.title')}</h4>
                                <p className="text-sm text-gray-500">{t('market.trust.desc')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.9] mb-8">
                            {t('market.heading1')} <span className="text-gradient">{t('market.heading2')}</span> {t('market.heading3')}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                            {t('market.subtitle')}
                        </p>
                        <ul className="space-y-4 mb-10">
                            {[
                                t('market.bullet1'),
                                t('market.bullet2'),
                                t('market.bullet3')
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-200">
                                    <ShieldCheck className="w-5 h-5 text-[#FF6600]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button className="btn-gradient px-10 py-4 font-black">{t('market.cta')}</button>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-6 bg-gray-50 dark:bg-[#0c0c0c] relative transition-all">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-6">
                            {t('pricing.title1')} <span className="text-gradient">{t('pricing.title2')}</span> {t('pricing.title3')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {t('pricing.subtitle')}
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
                                        {t('pricing.bestValue')}
                                    </div>
                                )}
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">{plan.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                                    {t('pricing.subscribeTo')} {plan.name} {t('pricing.planSuffix')}
                                </p>

                                <div className="flex items-baseline gap-1 mb-10">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">RM {Math.round(plan.price)}</span>
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{t('pricing.yr')}</span>
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
                                    {plan.is_popular ? t('pricing.goPremium') : t('pricing.getStarted')}
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
                            {t('cta.title1')} <span className="text-gradient">{t('cta.title2')}</span>?
                        </h2>
                        <p className="text-gray-400 text-xl mb-12">
                            {t('cta.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={route('register')} className="btn-gradient text-xl px-12 py-5 font-black">
                                {t('cta.getStarted')}
                            </Link>
                            <button className="px-12 py-5 border-2 border-white/20 rounded-full font-black text-white hover:bg-white/5 transition-colors">
                                {t('cta.contactSales')}
                            </button>
                        </div>

                        {/* Mobile app download badges */}
                        <div className="mt-10 flex flex-col items-center gap-4">
                            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Download the mobile app</p>
                            <AppStoreBadges />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0c0c0c]">
                <div className="max-w-7xl mx-auto flex flex-col gap-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center p-2 shadow-sm">
                                <ApplicationLogo />
                            </div>
                            <span className="text-xl font-black dark:text-white tracking-tighter uppercase">One Click Hub</span>
                        </div>
                        <div className="flex items-center gap-8 text-sm font-bold text-gray-400">
                            <Link href={route('about')} className="hover:text-white transition-colors">{t('footer.about')}</Link>
                            <Link href={route('privacy')} className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
                            <Link href={route('terms')} className="hover:text-white transition-colors">{t('footer.terms')}</Link>
                            <Link href={route('account-deletion')} className="hover:text-white transition-colors">{t('footer.accountDeletion')}</Link>
                        </div>
                        <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Available on</p>
                        <AppStoreBadges align="end" />
                    </div>
                </div>
            </footer>

            <BackToTop />
        </div>
        </>
    );
}
