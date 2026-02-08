import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Clock, User, Menu, X, Zap } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useLanguage, LanguageSwitcher } from '@/Contexts/LanguageContext';

export default function BrowseServices({ services, categories, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('services.browse'), { search, category: filters.category }, { preserveState: true });
    };

    const handleCategoryFilter = (categoryId) => {
        router.get(route('services.browse'), {
            search: filters.search,
            category: categoryId || undefined,
        }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#0c0c0c]">
            <Head title={t('browse.title')} />

            {/* Nav */}
            <nav className="sticky top-0 z-[100] bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group flex-none">
                        <div className="flex-none w-10 h-10 md:w-12 md:h-12 overflow-hidden transition-all duration-500 group-hover:rotate-3 group-hover:scale-105">
                            <ApplicationLogo />
                        </div>
                        <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ONECLICK<span className="text-[#FF6600]">HUB</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <Link href="/" className="hover:text-[#FF6600] transition-colors">{t('nav.home')}</Link>
                        <Link href="/#pricing" className="hover:text-[#FF6600] transition-colors">{t('nav.pricing')}</Link>
                        <Link href={route('services.browse')} className="text-[#FF6600] font-bold">{t('nav.services')}</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher className="hidden lg:flex" />
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="hidden lg:inline-flex btn-gradient px-6 py-2 text-sm">{t('nav.dashboard')}</Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="hidden lg:block text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-[#FF6600]">{t('nav.signIn')}</Link>
                                <Link href={route('register')} className="hidden lg:inline-flex btn-gradient px-6 py-2 text-sm">{t('nav.getStarted')}</Link>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600] via-[#FF8800] to-[#FFB800] z-[-1]" />

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

                        <div className="flex-1 overflow-y-auto px-8 py-12 flex flex-col justify-center">
                            <div className="space-y-2">
                                {[
                                    { name: t('nav.home'), href: '/' },
                                    { name: t('nav.pricing'), href: '/#pricing' },
                                    { name: t('nav.services'), href: route('services.browse') },
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

                            <div className="mt-8">
                                <LanguageSwitcher className="[&_button]:text-white [&_button]:text-lg [&_span]:text-white/40" />
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-12 pt-12 border-t border-white/10"
                            >
                                {!auth?.user ? (
                                    <div className="grid gap-6">
                                        <Link href={route('login')} className="text-2xl font-bold py-2">{t('nav.signIn')}</Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-white text-[#FF6600] text-center py-6 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-black/20"
                                        >
                                            {t('nav.getStarted')}
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href={route('dashboard')}
                                        className="bg-white text-[#FF6600] text-center py-6 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-black/20 block"
                                    >
                                        {t('nav.goToDashboard')}
                                    </Link>
                                )}
                            </motion.div>
                        </div>

                        <Zap className="absolute bottom-10 right-10 w-32 h-32 text-white opacity-10 pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero / Search */}
            <div className="bg-gradient-to-br from-[#FF6600] to-[#FFB800] py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {t('browse.title')}
                    </h1>
                    <p className="text-white/80 text-lg mb-8">{t('browse.subtitle')}</p>
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('browse.search')}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-white/50 outline-none"
                            />
                        </div>
                        <button type="submit" className="px-8 py-4 bg-[#2B313F] text-white rounded-2xl text-sm font-black hover:bg-[#1a1f2a] transition-colors">
                            {t('browse.searchBtn')}
                        </button>
                    </form>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => handleCategoryFilter(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!filters.category ? 'bg-[#FF6600] text-white' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-[#FF6600]'}`}
                    >
                        {t('browse.all')}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryFilter(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${String(filters.category) === String(cat.id) ? 'bg-[#FF6600] text-white' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-[#FF6600]'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Services Grid */}
                {services.data.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('browse.noResults')}</h3>
                        <p className="text-gray-400 text-sm">{t('browse.noResultsHint')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {services.data.map((service) => (
                            <motion.div key={service.id} whileHover={{ y: -5 }}>
                                <Link
                                    href={route('services.show', service.slug)}
                                    className="block bg-white dark:bg-[#0c0c0c] rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="h-44 bg-gradient-to-br from-[#FF6600]/10 to-[#FFB800]/10 flex items-center justify-center">
                                        {service.images?.[0] ? (
                                            <img src={`/storage/${service.images[0]}`} alt={service.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Briefcase size={48} className="text-[#FF6600]/30" />
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-widest">{service.category?.name}</span>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white mt-1 mb-2 line-clamp-2">{service.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                            <User size={12} />
                                            <span className="font-semibold">{service.user?.name}</span>
                                        </div>
                                        {service.delivery_days && (
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                                                <Clock size={12} />
                                                <span>{service.delivery_days} {t('browse.daysDelivery')}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                                            <span className="text-xs text-gray-400 font-semibold">{t('browse.startingAt')}</span>
                                            <span className="text-lg font-black text-[#FF6600]">RM {service.price_from}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {services.links && services.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                        {services.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${link.active ? 'bg-[#FF6600] text-white' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10'} ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

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
                        <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer.offices')}</a>
                        <a href="#" className="hover:text-white transition-colors">{t('footer.support')}</a>
                    </div>
                    <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
                </div>
            </footer>
        </div>
    );
}
