import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Globe, Bell, ShieldCheck } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function SubscriptionSettings() {
    const { t } = useLanguage();

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                        {t('subscriptions.settingsTitle')} <span className="text-[#FF6600]">{t('subscriptions.settingsHighlight')}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        <span>{t('subscriptions.breadcrumbRevenueCenter')}</span>
                        <span className="size-1 bg-gray-300 rounded-full" />
                        <span>{t('subscriptions.breadcrumbSubscriptions')}</span>
                        <span className="size-1 bg-gray-300 rounded-full" />
                        <span className="text-[#FF6600]">{t('subscriptions.breadcrumbSettings')}</span>
                    </div>
                </div>
            }
        >
            <Head title="Subscription Settings" />

            <div className="max-w-4xl space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#111] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF6600]">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('subscriptions.regionalConfig')}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('subscriptions.regionalConfigDesc')}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <InputLabel htmlFor="currency" value={t('subscriptions.currency')} />
                            <select className="w-full bg-[#fcfcfc] dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                                <option>MYR (Malaysian Ringgit)</option>
                                <option>SGD (Singapore Dollar)</option>
                                <option>IDR (Indonesian Rupiah)</option>
                                <option>THB (Thai Baht)</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <InputLabel htmlFor="tax" value={t('subscriptions.taxRate')} />
                            <TextInput id="tax" defaultValue="6" className="w-full" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-[#111] rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="size-12 rounded-2xl bg-[#34C38F]/10 flex items-center justify-center text-[#34C38F]">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('subscriptions.billingNotifications')}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('subscriptions.billingNotificationsDesc')}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-[#fcfcfc] dark:bg-white/5 rounded-2xl border border-gray-50 dark:border-white/5">
                            <div>
                                <div className="text-sm font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">WhatsApp Invoicing</div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Send automated invoices via WhatsApp API</p>
                            </div>
                            <div className="size-12 rounded-full bg-[#34C38F] flex items-center justify-center text-white shadow-lg shadow-[#34C38F]/20">
                                <CheckCircleIcon />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-[#fcfcfc] dark:bg-white/5 rounded-2xl border border-gray-50 dark:border-white/5 opacity-50">
                            <div>
                                <div className="text-sm font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">Churn Prevention Alerts</div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Notify staff when a subscriber cancels</p>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded-full relative">
                                <div className="absolute left-1 top-1 size-4 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="flex justify-end gap-4">
                    <button className="px-10 py-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all">Reset Defaults</button>
                    <PrimaryButton className="px-10 py-4">Save Hub Settings</PrimaryButton>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function CheckCircleIcon() {
    return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;
}
