import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Landmark } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function BankingDetails({ bankingDetail }) {
    const { t } = useLanguage();

    const { data, setData, patch, processing, errors } = useForm({
        bank_name: bankingDetail?.bank_name || '',
        account_number: bankingDetail?.account_number || '',
        account_holder_name: bankingDetail?.account_holder_name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('settings.banking.update'));
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

            <div className="max-w-xl">
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
            </div>
        </AuthenticatedLayout>
    );
}
