import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Plus,
    Eye,
    CheckCircle,
    Clock,
    CreditCard,
    ArrowUpRight,
} from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function FreelancerDashboard({ services, totalServices, activeServices, subscription }) {
    const { t } = useLanguage();
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {t('dashboard.freelancer.title')} <span className="text-[#FF6600]">{t('dashboard.freelancer.titleHighlight')}</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">{t('dashboard.freelancer.subtitle')}</p>
                    </div>
                    <Link
                        href={route('my-services.create')}
                        className="btn-gradient px-6 py-2 text-xs inline-flex items-center gap-2 w-fit"
                    >
                        <Plus size={16} /> {t('dashboard.freelancer.newService')}
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Subscription Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-[2rem] border ${subscription
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-2xl flex items-center justify-center ${subscription ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                                <CreditCard size={24} />
                            </div>
                            <div>
                                {subscription ? (
                                    <>
                                        <div className="text-sm font-black text-gray-900 dark:text-white">
                                            {subscription.plan?.name} {t('dashboard.freelancer.plan')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {subscription.status === 'cancelled'
                                                ? `${t('dashboard.freelancer.cancelledUntil')} ${new Date(subscription.ends_at).toLocaleDateString()}`
                                                : `${subscription.remaining_days} ${t('dashboard.freelancer.daysRemaining')} ${new Date(subscription.ends_at).toLocaleDateString()}`
                                            }
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-sm font-black text-gray-900 dark:text-white">{t('dashboard.freelancer.noSubscription')}</div>
                                        <div className="text-xs text-gray-500">{t('dashboard.freelancer.subscribeHint')}</div>
                                    </>
                                )}
                            </div>
                        </div>
                        {subscription ? (
                            subscription.status === 'active' && (
                                <button
                                    onClick={() => {
                                        if (confirm(t('dashboard.freelancer.cancelConfirm'))) {
                                            router.post(route('subscription.cancel'));
                                        }
                                    }}
                                    className="px-5 py-2 text-xs font-bold text-red-600 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    {t('dashboard.freelancer.cancelSubscription')}
                                </button>
                            )
                        ) : (
                            <Link href={route('subscribe.plans')} className="btn-gradient px-5 py-2 text-xs">
                                {t('dashboard.freelancer.subscribeNow')}
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: t('dashboard.freelancer.totalServices'), value: totalServices, icon: Briefcase, color: '#FF6600' },
                        { label: t('dashboard.freelancer.activeServices'), value: activeServices, icon: CheckCircle, color: '#22C55E' },
                        { label: t('dashboard.freelancer.totalViews'), value: '—', icon: Eye, color: '#FFB800' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#0c0c0c] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Services or Empty State */}
                {services.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-[#0c0c0c] p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 text-center"
                    >
                        <div className="size-20 mx-auto mb-6 rounded-3xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <Briefcase size={40} className="text-[#FF6600]" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t('dashboard.freelancer.createFirst')}</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                            {t('dashboard.freelancer.createFirstDesc')}
                        </p>
                        <Link href={route('my-services.create')} className="btn-gradient px-8 py-3 text-sm inline-flex items-center gap-2">
                            <Plus size={18} /> {t('dashboard.freelancer.createService')}
                        </Link>
                    </motion.div>
                ) : (
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('dashboard.freelancer.recentServices')}</h3>
                            <Link href={route('my-services.index')} className="text-[#FF6600] text-xs font-bold flex items-center gap-1 hover:underline">
                                {t('dashboard.freelancer.viewAll')} <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {services.map((service) => (
                                <div key={service.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#FF6600]/10 to-[#FFB800]/10 flex items-center justify-center">
                                            <Briefcase size={20} className="text-[#FF6600]" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{service.title}</div>
                                            <div className="text-[10px] font-semibold text-gray-400">{service.category?.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-[#FF6600]">RM {service.price_from}</div>
                                        <div className={`text-[10px] font-bold ${service.is_active ? 'text-green-500' : 'text-gray-400'}`}>
                                            {service.is_active ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
