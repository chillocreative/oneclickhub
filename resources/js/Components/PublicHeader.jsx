import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useLanguage, LanguageSwitcher } from '@/Contexts/LanguageContext';

/**
 * Shared public-site navigation header.
 *
 * Mirrors the Welcome (frontpage) nav so every public page —
 * About, Privacy, Terms, Contact, Account Deletion, service
 * browse/show, auth pages — has identical chrome.
 *
 * `active` highlights one of: 'home' | 'pricing' | 'services'.
 */
export default function PublicHeader({ active = null }) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    const linkBase = 'hover:text-[#FF6600] transition-colors';
    const linkActive = 'text-[#FF6600] font-bold';

    return (
        <>
            <nav className="fixed top-0 w-full z-[100] glass border-b border-white/20 dark:border-white/5 h-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group flex-none cursor-pointer border-none shadow-none bg-transparent hover:bg-transparent">
                        <div className="flex-none flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 w-10 h-10 md:w-12 md:h-12">
                            <ApplicationLogo />
                        </div>
                        <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ONE CLICK <span className="text-gradient">HUB</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <Link href="/" className={active === 'home' ? linkActive : linkBase}>{t('nav.home')}</Link>
                        <Link href="/#pricing" className={active === 'pricing' ? linkActive : linkBase}>{t('nav.pricing')}</Link>
                        <Link href={route('services.browse')} className={active === 'services' ? linkActive : linkBase}>{t('nav.services')}</Link>
                        <Link href={route('about')} className={active === 'about' ? linkActive : linkBase}>{t('nav.about')}</Link>
                        <Link href={route('contact')} className={active === 'contact' ? linkActive : linkBase}>{t('nav.contact')}</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher className="hidden lg:flex" />
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="hidden lg:inline-flex btn-gradient px-6 py-2 text-sm">
                                {t('nav.dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="hidden lg:block text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-[#FF6600]">
                                    {t('nav.signIn')}
                                </Link>
                                <Link href={route('register')} className="hidden lg:inline-flex btn-gradient px-6 py-2 text-sm">
                                    {t('nav.getStarted')}
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
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600] via-[#FF8800] to-[#FFB800] z-[-1]" />

                        <div className="flex items-center justify-between px-6 h-20 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-4 flex-none">
                                <div className="flex-none w-10 h-10 flex items-center justify-center overflow-hidden">
                                    <ApplicationLogo />
                                </div>
                                <span className="text-xl font-black tracking-tighter text-white uppercase whitespace-nowrap">
                                    One Click Hub
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
                                    { name: t('nav.about'), href: route('about') },
                                    { name: t('nav.contact'), href: route('contact') },
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
        </>
    );
}
