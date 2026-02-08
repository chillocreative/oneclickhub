import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone_number: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="phone_number" value="Phone Number" />

                    <TextInput
                        id="phone_number"
                        type="text"
                        name="phone_number"
                        value={data.phone_number}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        isFocused={true}
                        onChange={(e) => setData('phone_number', e.target.value)}
                    />

                    <InputError message={errors.phone_number} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-gray-600 underline hover:text-[#FF6600] focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="w-full sm:w-auto whitespace-nowrap px-10 py-3" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Demo Credentials
                </h3>
                <div className="space-y-3">
                    {[
                        { role: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', phone: '0123456789', password: 'admin123' },
                        { role: 'Freelancer', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', phone: '0187654321', password: 'freelancer123' },
                        { role: 'Customer', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', phone: '0198765432', password: 'customer123' },
                    ].map((cred) => (
                        <button
                            key={cred.role}
                            type="button"
                            onClick={() => { setData({ ...data, phone_number: cred.phone, password: cred.password }); }}
                            className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 hover:border-[#FF6600]/40 hover:bg-orange-50/50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${cred.color}`}>
                                    {cred.role}
                                </span>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{cred.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Password:</span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{cred.password}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </GuestLayout>
    );
}
