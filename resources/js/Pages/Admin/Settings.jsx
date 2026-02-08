import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Settings, Key } from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function AdminSettings({ openai_api_key }) {
    const { flash } = usePage().props;
    const { data, setData, patch, processing, errors } = useForm({
        openai_api_key: openai_api_key || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.settings.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Admin <span className="text-[#FF6600]">Settings</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Configure system integrations.</p>
                </div>
            }
        >
            <Head title="Admin Settings" />

            <div className="max-w-xl">
                <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                            <Key size={24} className="text-[#FF6600]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">OpenAI Integration</h3>
                            <p className="text-xs text-gray-400">Used for SSM certificate verification via GPT-4o Vision.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <InputLabel value="OpenAI API Key" />
                            <TextInput
                                type="password"
                                className="w-full"
                                value={data.openai_api_key}
                                onChange={e => setData('openai_api_key', e.target.value)}
                                placeholder="sk-..."
                            />
                            {errors.openai_api_key && <p className="text-red-500 text-xs">{errors.openai_api_key}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 btn-gradient font-black text-sm uppercase tracking-widest disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
