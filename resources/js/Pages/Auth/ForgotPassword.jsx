import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        phone_number: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Forgot your password? No problem. Just let us know your <b className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">phone number</b> and we will send you a password reset link via <b className="font-black text-[#FF6600]">WhatsApp</b>.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="phone_number"
                    type="text"
                    name="phone_number"
                    value={data.phone_number}
                    className="mt-1 block w-full"
                    isFocused={true}
                    placeholder="Enter your registered phone number"
                    onChange={(e) => setData('phone_number', e.target.value)}
                />

                <InputError message={errors.phone_number} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4 w-full" disabled={processing}>
                        Send WhatsApp Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
