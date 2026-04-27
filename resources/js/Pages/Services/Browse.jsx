import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Clock, User, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PublicHeader from '@/Components/PublicHeader';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function BrowseServices({ services, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
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

            <PublicHeader active="services" />

            {/* Hero / Search */}
            <div className="bg-gradient-to-br from-[#FF6600] to-[#FFB800] pt-32 pb-10 md:pt-40 md:pb-16">
                <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-3 md:mb-4">
                        {t('browse.title')}
                    </h1>
                    <p className="text-white/80 text-sm md:text-lg mb-6 md:mb-8">{t('browse.subtitle')}</p>
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('browse.search')}
                                className="w-full pl-12 pr-4 py-3.5 md:py-4 rounded-2xl border-none text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-white/50 outline-none"
                            />
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <button type="submit" className="flex-1 sm:flex-none px-6 md:px-8 py-3.5 md:py-4 bg-[#2B313F] text-white rounded-2xl text-sm font-black hover:bg-[#1a1f2a] transition-colors">
                                {t('browse.searchBtn')}
                            </button>
                            {(filters.search || filters.category) && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); router.get(route('services.browse')); }}
                                    className="flex-1 sm:flex-none px-6 md:px-8 py-3.5 md:py-4 bg-white/20 text-white border-2 border-white/30 rounded-2xl text-sm font-black hover:bg-white/30 transition-colors"
                                >
                                    {t('browse.resetBtn')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                {/* Category Filters - Mobile Dropdown */}
                <div className="md:hidden mb-6">
                    <div className="relative">
                        <SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                            value={filters.category || ''}
                            onChange={(e) => handleCategoryFilter(e.target.value || null)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600] transition-all"
                        >
                            <option value="">{t('browse.allCategories')}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Category Filters - Desktop Tag Cloud */}
                <div className="hidden md:flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => handleCategoryFilter(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${!filters.category ? 'bg-[#FF6600] text-white shadow-md shadow-[#FF6600]/20' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-[#FF6600]'}`}
                    >
                        {t('browse.all')}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryFilter(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${String(filters.category) === String(cat.id) ? 'bg-[#FF6600] text-white shadow-md shadow-[#FF6600]/20' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-[#FF6600]'}`}
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
                                        {service.image_urls?.[0] ? (
                                            <img src={service.image_urls[0]} alt={service.title} className="w-full h-full object-cover" />
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
                        <span className="text-xl font-black dark:text-white tracking-tighter uppercase">One Click Hub</span>
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
