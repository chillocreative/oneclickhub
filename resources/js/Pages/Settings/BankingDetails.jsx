import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Landmark, FileCheck, Upload } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useLanguage } from '@/Contexts/LanguageContext';

const ssmStatusColors = {
    pending: 'bg-yellow-50 text-yellow-600',
    verified: 'bg-green-50 text-green-600',
    failed: 'bg-red-50 text-red-600',
    expired: 'bg-gray-100 text-gray-500',
};

export default function BankingDetails({ bankingDetail, ssmVerification }) {
    const { t } = useLanguage();
    const { flash } = usePage().props;

    const { data, setData, patch, processing, errors } = useForm({
        bank_name: bankingDetail?.bank_name || '',
        account_number: bankingDetail?.account_number || '',
        account_holder_name: bankingDetail?.account_holder_name || '',
    });

    const ssmForm = useForm({ document: null });

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.banking.update'));
    };

    const handleSsmUpload = (e) => {
        e.preventDefault();
        ssmForm.post(route('settings.ssm.upload'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {t('settings.bankingTitle')} <span className="text-[#FF6600]">{t('settings.bankingHighlight')}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">{t('settings.subtitle')}</p>
                </div>
            }
        >
            <Head title="Banking Details" />

            <div className="max-w-xl space-y-8">
                {/* Banking Form */}
                <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <Landmark size={24} className="text-[#FF6600]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Bank Account</h3>
                            <p className="text-xs text-gray-400">Customers will transfer payment to this account.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <InputLabel value={t('settings.bankName')} />
                            <TextInput
                                className="w-full"
                                value={data.bank_name}
                                onChange={e => setData('bank_name', e.target.value)}
                                placeholder={t('settings.bankNamePlaceholder')}
                            />
                            {errors.bank_name && <p className="text-red-500 text-xs">{errors.bank_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <InputLabel value={t('settings.accountNumber')} />
                            <TextInput
                                className="w-full"
                                value={data.account_number}
                                onChange={e => setData('account_number', e.target.value)}
                                placeholder={t('settings.accountNumberPlaceholder')}
                            />
                            {errors.account_number && <p className="text-red-500 text-xs">{errors.account_number}</p>}
                        </div>

                        <div className="space-y-2">
                            <InputLabel value={t('settings.accountHolder')} />
                            <TextInput
                                className="w-full"
                                value={data.account_holder_name}
                                onChange={e => setData('account_holder_name', e.target.value)}
                                placeholder={t('settings.accountHolderPlaceholder')}
                            />
                            {errors.account_holder_name && <p className="text-red-500 text-xs">{errors.account_holder_name}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 btn-gradient font-black text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : t('common.save')}
                        </button>
                    </form>
                </div>

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

                    {ssmVerification?.grace_period_ends_at && ssmVerification.status !== 'verified' && (
                        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${ssmVerification.services_hidden_at ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                            <FileCheck size={18} className={ssmVerification.services_hidden_at ? 'text-red-600' : 'text-yellow-600'} />
                            <p className={`text-sm font-bold ${ssmVerification.services_hidden_at ? 'text-red-800' : 'text-yellow-800'}`}>
                                {ssmVerification.services_hidden_at
                                    ? 'Your services are hidden. Upload a valid SSM certificate to reactivate.'
                                    : `Grace period: ${ssmVerification.grace_days_remaining} day(s) remaining to upload SSM.`
                                }
                            </p>
                        </div>
                    )}

                    {ssmVerification && (
                        <div className="mb-6 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 space-y-3">
                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                                <span className="text-gray-400 font-bold">Company Name:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{ssmVerification.company_name || '-'}</span>

                                <span className="text-gray-400 font-bold">Registration Number:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{ssmVerification.registration_number || '-'}</span>

                                <span className="text-gray-400 font-bold">Expiry Date:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{ssmVerification.expiry_date || '-'}</span>

                                <span className="text-gray-400 font-bold">Status:</span>
                                <span>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${ssmStatusColors[ssmVerification.status]}`}>
                                        {ssmVerification.status}
                                    </span>
                                </span>
                            </div>

                            {ssmVerification.document_path && (
                                <a
                                    href={`/storage/${ssmVerification.document_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 text-xs font-black text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
                                >
                                    <FileCheck size={14} /> View SSM
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
                            {ssmForm.processing ? 'Uploading...' : 'Upload SSM Certificate'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
