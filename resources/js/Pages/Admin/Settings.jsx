import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Key, Sparkles, Bot, Check, MessageCircle, Send } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useLanguage } from '@/Contexts/LanguageContext';

const PROVIDERS = [
    {
        id: 'openai',
        icon: Bot,
        nameKey: 'admin.openaiIntegration',
        descKey: 'admin.openaiDesc',
        labelKey: 'admin.openaiApiKey',
        placeholderKey: 'admin.openaiPlaceholder',
        field: 'openai_api_key',
    },
    {
        id: 'claude',
        icon: Sparkles,
        nameKey: 'admin.claudeIntegration',
        descKey: 'admin.claudeDesc',
        labelKey: 'admin.claudeApiKey',
        placeholderKey: 'admin.claudePlaceholder',
        field: 'claude_api_key',
    },
];

export default function AdminSettings({
    openai_api_key,
    claude_api_key,
    active_ai_provider,
    early_adopter_enabled,
    sendora_base_url,
    sendora_api_token,
    sendora_device_id,
    sendora_admin_phone,
    sendora_admin_throttle_minutes,
}) {
    const { t } = useLanguage();
    const { data, setData, patch, processing, errors } = useForm({
        openai_api_key: openai_api_key || '',
        claude_api_key: claude_api_key || '',
        active_ai_provider: active_ai_provider || 'openai',
        early_adopter_enabled: !!early_adopter_enabled,
        sendora_base_url: sendora_base_url || '',
        sendora_api_token: sendora_api_token || '',
        sendora_device_id: sendora_device_id || '',
        sendora_admin_phone: sendora_admin_phone || '',
        sendora_admin_throttle_minutes: sendora_admin_throttle_minutes ?? 30,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.settings.update'));
    };

    const sendTestWhatsapp = () => {
        if (!confirm('Send a test WhatsApp to the configured admin phone now?')) return;
        router.post(route('admin.settings.sendora.test'), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {t('admin.settingsTitle')}{' '}
                        <span className="text-[#FF6600]">{t('admin.settingsHighlight')}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">{t('admin.settingsDesc')}</p>
                </div>
            }
        >
            <Head title="Admin Settings" />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                {/* AI Provider selector header */}
                <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-start gap-4">
                        <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <Key size={18} className="text-[#FF6600]" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-gray-900 dark:text-white">
                                {t('admin.aiProviderLabel')}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">{t('admin.aiProviderDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* Provider cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROVIDERS.map((p) => {
                        const Icon = p.icon;
                        const isActive = data.active_ai_provider === p.id;
                        return (
                            <div
                                key={p.id}
                                className={`relative bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border-2 transition-colors ${
                                    isActive
                                        ? 'border-[#FF6600]'
                                        : 'border-gray-100 dark:border-white/5'
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute -top-3 left-6 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                                        <Check size={12} /> {t('admin.activeBadge')}
                                    </div>
                                )}

                                <div className="flex items-start gap-3 mb-4">
                                    <div
                                        className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            isActive
                                                ? 'bg-orange-50 dark:bg-orange-500/10'
                                                : 'bg-gray-100 dark:bg-white/5'
                                        }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={isActive ? 'text-[#FF6600]' : 'text-gray-400'}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white">
                                            {t(p.nameKey)}
                                        </h4>
                                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                                            {t(p.descKey)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <InputLabel value={t(p.labelKey)} />
                                    <TextInput
                                        type="password"
                                        className="w-full"
                                        value={data[p.field]}
                                        onChange={(e) => setData(p.field, e.target.value)}
                                        placeholder={t(p.placeholderKey)}
                                    />
                                    {errors[p.field] && (
                                        <p className="text-red-500 text-xs">{errors[p.field]}</p>
                                    )}
                                </div>

                                {isActive ? (
                                    <div className="w-full py-2.5 text-center text-xs font-black text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20">
                                        {t('admin.activeBadge')}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setData('active_ai_provider', p.id)}
                                        className="w-full py-2.5 text-xs font-black text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        {t('admin.setAsActive')}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Sendora WhatsApp — credentials editable from the dashboard */}
                <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <MessageCircle size={18} className="text-[#FF6600]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-black text-gray-900 dark:text-white">Sendora WhatsApp</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Used by forgot-password resets and admin alerts. Saved values override .env at runtime.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <InputLabel value="Base URL" />
                            <TextInput
                                className="w-full mt-1"
                                value={data.sendora_base_url}
                                onChange={e => setData('sendora_base_url', e.target.value)}
                                placeholder="https://blaster.example.com"
                            />
                            {errors.sendora_base_url && <p className="text-red-500 text-xs mt-1">{errors.sendora_base_url}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel value="API Token" />
                            <TextInput
                                type="text"
                                className="w-full mt-1 font-mono text-xs"
                                value={data.sendora_api_token}
                                onChange={e => setData('sendora_api_token', e.target.value)}
                                placeholder="Paste a fresh token, or leave as ●●●●●●●● to keep"
                            />
                            {errors.sendora_api_token && <p className="text-red-500 text-xs mt-1">{errors.sendora_api_token}</p>}
                        </div>

                        <div>
                            <InputLabel value="Device ID" />
                            <TextInput
                                className="w-full mt-1"
                                value={data.sendora_device_id}
                                onChange={e => setData('sendora_device_id', e.target.value)}
                                placeholder="e.g. 12"
                            />
                            {errors.sendora_device_id && <p className="text-red-500 text-xs mt-1">{errors.sendora_device_id}</p>}
                        </div>

                        <div>
                            <InputLabel value="Admin Phone" />
                            <TextInput
                                className="w-full mt-1"
                                value={data.sendora_admin_phone}
                                onChange={e => setData('sendora_admin_phone', e.target.value)}
                                placeholder="60123456789"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">International format, e.g. <code>60123456789</code>.</p>
                            {errors.sendora_admin_phone && <p className="text-red-500 text-xs mt-1">{errors.sendora_admin_phone}</p>}
                        </div>

                        <div>
                            <InputLabel value="Admin Alert Throttle (minutes)" />
                            <TextInput
                                type="number"
                                min="1"
                                max="1440"
                                className="w-full mt-1"
                                value={data.sendora_admin_throttle_minutes}
                                onChange={e => setData('sendora_admin_throttle_minutes', e.target.value)}
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Minimum gap between consecutive admin pings.</p>
                            {errors.sendora_admin_throttle_minutes && <p className="text-red-500 text-xs mt-1">{errors.sendora_admin_throttle_minutes}</p>}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={sendTestWhatsapp}
                        className="mt-4 w-full py-3 rounded-2xl text-xs font-black bg-orange-50 text-[#FF6600] hover:bg-orange-100 inline-flex items-center justify-center gap-2"
                    >
                        <Send size={14} /> Send test WhatsApp to admin phone
                    </button>
                </div>

                {/* Early adopter toggle — auto-grants every new signup a 90-day Starter Hub subscription */}
                <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-base font-black text-gray-900 dark:text-white">Early adopter free trial</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                When enabled, every brand-new account is automatically granted 90 days of the Starter Hub plan, free.
                                Switch off once the campaign ends.
                            </p>
                        </div>
                        <label className="inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={data.early_adopter_enabled}
                                onChange={e => setData('early_adopter_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-7 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative peer-checked:bg-[#FF6600]"></div>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 btn-gradient font-black text-sm uppercase tracking-widest disabled:opacity-50"
                >
                    {processing ? 'Saving...' : t('admin.saveSettings')}
                </button>
            </form>
        </AuthenticatedLayout>
    );
}
