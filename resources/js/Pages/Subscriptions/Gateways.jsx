import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Wallet, Shield, Globe, ExternalLink, Settings2, Power } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function PaymentGateways({ gateways }) {
    const { t } = useLanguage();

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                        {t('subscriptions.gatewaysTitle')} <span className="text-[#FF6600]">{t('subscriptions.gatewaysHighlight')}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                        <span>{t('subscriptions.breadcrumbRevenueCenter')}</span>
                        <span className="size-1 bg-gray-300 rounded-full" />
                        <span className="text-[#FF6600]">{t('subscriptions.breadcrumbGateways')}</span>
                    </div>
                </div>
            }
        >
            <Head title="Payment Gateways" />

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {gateways.map((gateway, i) => (
                        <GatewayCard key={gateway.id} gateway={gateway} index={i} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function GatewayCard({ gateway, index }) {
    const { t } = useLanguage();
    const [logoError, setLogoError] = useState(false);
    const { data, setData, patch, processing } = useForm({
        is_active: gateway.is_active,
        mode: gateway.mode,
        settings: gateway.settings || {}
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('subscriptions.gateways.update', gateway.id));
    };

    const updateSetting = (key, value) => {
        setData('settings', {
            ...data.settings,
            [key]: value
        });
    };

    const getLogo = (slug) => {
        if (slug === 'bayarcash') return 'https://cdn.bayarcash.com/bayarcash-logo.svg';
        if (slug === 'senangpay') return 'https://app.senangpay.my/images/logo-senangpay.png';
        if (slug === 'paypal') return 'https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png';
        if (slug === 'stripe') return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png';
        return '';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#111] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden group"
        >
            <div className="p-8 pb-0 flex items-center justify-between">
                <div className="h-10 flex items-center bg-gray-50/50 dark:bg-white/5 px-4 rounded-xl">
                    {logoError ? (
                        <span className="text-sm font-black text-gray-700 dark:text-gray-300 tracking-tight">{gateway.name}</span>
                    ) : (
                        <img src={getLogo(gateway.slug)} alt={gateway.name} className="h-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-500" onError={() => setLogoError(true)} />
                    )}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${data.is_active ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
                    <div className={`size-1.5 rounded-full ${data.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    {data.is_active ? 'Active' : 'Disabled'}
                </div>
            </div>

            <form onSubmit={submit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <InputLabel value="Environment" />
                        <select
                            value={data.mode}
                            onChange={e => setData('mode', e.target.value)}
                            className="w-full bg-[#fcfcfc] dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold py-3 px-4 focus:ring-[#FF6600]/20"
                        >
                            <option value="sandbox">Sandbox / Test</option>
                            <option value="live">Live / Production</option>
                        </select>
                    </div>
                    <div className="space-y-2 text-right">
                        <InputLabel value="Status" className="text-right" />
                        <button
                            type="button"
                            onClick={() => setData('is_active', !data.is_active)}
                            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${data.is_active ? 'bg-[#34C38F] text-white shadow-lg shadow-[#34C38F]/20' : 'bg-gray-100 text-gray-400'}`}
                        >
                            <Power size={14} />
                            {data.is_active ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Settings2 size={14} className="text-[#FF6600]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration Keys</span>
                    </div>

                    {gateway.slug === 'bayarcash' && (
                        <>
                            <div className="space-y-2">
                                <InputLabel value="Personal Access Token" />
                                <TextInput
                                    type="password"
                                    className="w-full text-xs"
                                    placeholder="Bearer token from Bayarcash console"
                                    value={data.settings.personal_access_token || ''}
                                    onChange={e => updateSetting('personal_access_token', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <InputLabel value="Portal Key" />
                                <TextInput
                                    className="w-full text-xs"
                                    placeholder="Portal key from Bayarcash console"
                                    value={data.settings.portal_key || ''}
                                    onChange={e => updateSetting('portal_key', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <InputLabel value="API Secret Key" />
                                <TextInput
                                    type="password"
                                    className="w-full text-xs"
                                    placeholder="Secret key for checksum validation"
                                    value={data.settings.api_secret_key || ''}
                                    onChange={e => updateSetting('api_secret_key', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {gateway.slug === 'senangpay' && (
                        <>
                            <div className="space-y-2">
                                <InputLabel value="Merchant ID" />
                                <TextInput
                                    className="w-full text-xs"
                                    value={data.settings.merchant_id || ''}
                                    onChange={e => updateSetting('merchant_id', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <InputLabel value="Secret Key" />
                                <TextInput
                                    type="password"
                                    className="w-full text-xs"
                                    value={data.settings.secret_key || ''}
                                    onChange={e => updateSetting('secret_key', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {(gateway.slug === 'paypal' || gateway.slug === 'stripe') && (
                        <>
                            <div className="space-y-2">
                                <InputLabel value={gateway.slug === 'stripe' ? 'Publishable Key' : 'Client ID'} />
                                <TextInput
                                    className="w-full text-xs"
                                    value={gateway.slug === 'stripe' ? (data.settings.publishable_key || '') : (data.settings.client_id || '')}
                                    onChange={e => updateSetting(gateway.slug === 'stripe' ? 'publishable_key' : 'client_id', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <InputLabel value={gateway.slug === 'stripe' ? 'Secret Key' : 'Client Secret'} />
                                <TextInput
                                    type="password"
                                    className="w-full text-xs"
                                    value={gateway.slug === 'stripe' ? (data.settings.secret_key || '') : (data.settings.client_secret || '')}
                                    onChange={e => updateSetting(gateway.slug === 'stripe' ? 'secret_key' : 'client_secret', e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between pt-6">
                    <a
                        href={gateway.slug === 'bayarcash' ? 'https://docs.bayarcash.com/' : 'https://guide.senangpay.com/'}
                        target="_blank"
                        className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#FF6600] transition-colors"
                    >
                        Docs <ExternalLink size={12} />
                    </a>
                    <button
                        disabled={processing}
                        className="px-6 py-4 bg-[#FF6600] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#FF6600]/30 hover:bg-[#e65c00] transition-all active:scale-95 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : t('common.save')}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
