import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FileCheck } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

const ssmStatusColors = {
    pending: 'bg-yellow-50 text-yellow-600',
    verified: 'bg-green-50 text-green-600',
    failed: 'bg-red-50 text-red-600',
    expired: 'bg-gray-100 text-gray-500',
};

export default function SsmCertificate({ ssmVerification }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;

    const ssmForm = useForm({ document: null });

    const handleSsmUpload = (e) => {
        e.preventDefault();
        ssmForm.post(route('settings.ssm.upload'), { forceFormData: true });
    };

    // Check if SSM certificate is expired
    const isExpired = ssmVerification?.expiry_date && new Date(ssmVerification.expiry_date) < new Date();
    const displayStatus = isExpired ? 'non-verified' : ssmVerification?.status;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {t('settings.ssmVerification')}
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">{t('settings.ssmUpload')}</p>
                </div>
            }
        >
            <Head title={t('settings.ssmVerification')} />

            <div className="max-w-xl">
                {/* SSM Verification */}
                <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <FileCheck size={24} className="text-[#FF6600]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">{t('settings.ssmVerification')}</h3>
                            <p className="text-xs text-gray-400">{t('settings.ssmUpload')}</p>
                        </div>
                    </div>

                    {/* Expired Certificate Warning */}
                    {isExpired && (
                        <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
                            <FileCheck size={18} className="text-red-600 dark:text-red-400" />
                            <p className="text-sm font-bold text-red-800 dark:text-red-300">
                                {t('settings.ssmExpiredWarning')}
                            </p>
                        </div>
                    )}

                    {/* Grace Period & Services Hidden Warning */}
                    {!isExpired && ssmVerification?.grace_period_ends_at && ssmVerification.status !== 'verified' && (
                        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${ssmVerification.services_hidden_at ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50' : 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50'}`}>
                            <FileCheck size={18} className={ssmVerification.services_hidden_at ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'} />
                            <p className={`text-sm font-bold ${ssmVerification.services_hidden_at ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                                {ssmVerification.services_hidden_at
                                    ? t('settings.servicesHidden')
                                    : `${t('settings.gracePeriodPrefix')} ${ssmVerification.grace_days_remaining} ${t('settings.gracePeriodSuffix')}`
                                }
                            </p>
                        </div>
                    )}

                    {ssmVerification && (
                        <div className="mb-6 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 space-y-3">
                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                                <span className="text-gray-400 font-bold">{t('settings.companyName')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{ssmVerification.company_name || '-'}</span>

                                <span className="text-gray-400 font-bold">{t('settings.registrationNumber')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{ssmVerification.registration_number || '-'}</span>

                                <span className="text-gray-400 font-bold">{t('settings.expiryDate')}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{ssmVerification.expiry_date || '-'}</span>

                                <span className="text-gray-400 font-bold">{t('settings.statusLabel')}</span>
                                <span>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${isExpired ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ssmStatusColors[ssmVerification.status]}`}>
                                        {displayStatus}
                                    </span>
                                </span>
                            </div>

                            {ssmVerification.document_path && (
                                <a
                                    href={route('settings.ssm.view')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-xs font-black text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
                                >
                                    <FileCheck size={14} /> {t('settings.viewSsm')}
                                </a>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSsmUpload}>
                        <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={e => ssmForm.setData('document', e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-orange-50 file:text-[#FF6600] hover:file:bg-orange-100"
                        />
                        {ssmForm.errors.document && <p className="text-red-500 text-xs mt-1">{ssmForm.errors.document}</p>}
                        <button
                            type="submit"
                            disabled={ssmForm.processing || !ssmForm.data.document}
                            className="mt-4 w-full py-4 btn-gradient font-black text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                            {ssmForm.processing ? t('settings.uploadingSsm') : t('settings.uploadSsm')}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
