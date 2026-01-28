import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, ArrowLeft, ArrowRight, FileUp } from 'lucide-react';

export default function Register() {
    const [step, setStep] = useState('select'); // 'select' or 'form'
    const [selectedRole, setSelectedRole] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone_number: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        identity_document: null,
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData('role', role);
        setStep('form');
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout maxWidth={step === 'select' ? 'max-w-4xl' : 'max-w-md'}>
            <Head title={`Register as ${selectedRole || 'User'}`} />

            <AnimatePresence mode="wait">
                {step === 'select' ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                JOIN THE <span className="text-[#FF6600]">HUB</span>
                            </h2>
                            <p className="text-gray-500 text-sm font-bold">Choose your journey with One Click Hub</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRoleSelect('Customer')}
                                className="group cursor-pointer p-6 rounded-[2rem] border-2 border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] hover:border-[#FF6600] transition-all relative overflow-hidden flex flex-col items-center justify-center text-center"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6600]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                                <div className="size-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF6600] mb-4">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Customer</h3>
                                <p className="text-sm text-gray-500 font-bold max-w-[200px]">Find the best local freelancers for your needs</p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleRoleSelect('Freelancer')}
                                className="group cursor-pointer p-6 rounded-[2rem] border-2 border-gray-100 dark:border-white/5 bg-white dark:bg-[#111] hover:border-[#FF6600] transition-all relative overflow-hidden flex flex-col items-center justify-center text-center"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6600]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                                <div className="size-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF6600] mb-4">
                                    <Briefcase size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Freelancer</h3>
                                <p className="text-sm text-gray-500 font-bold max-w-[200px]">Market your services to local & ASEAN customers</p>
                            </motion.div>
                        </div>

                        <div className="text-center pt-4">
                            <Link
                                href={route('login')}
                                className="text-sm font-bold text-gray-500 hover:text-[#FF6600] transition-colors"
                            >
                                Already have an account? Log In
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <button
                            onClick={() => setStep('select')}
                            className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-[#FF6600] mb-6 uppercase tracking-widest transition-colors"
                        >
                            <ArrowLeft size={16} /> Choose Role
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                                REGISTER AS <span className="text-[#FF6600]">{selectedRole}</span>
                            </h2>
                            <p className="text-gray-500 text-sm font-bold">Fast and secure phone-based registration</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Your Full Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="e.g. Ahmad Faiz"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone_number" value="Phone Number" />
                                <TextInput
                                    id="phone_number"
                                    name="phone_number"
                                    value={data.phone_number}
                                    className="mt-1 block w-full"
                                    autoComplete="tel"
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    required
                                    placeholder="e.g. 011..."
                                />
                                <InputError message={errors.phone_number} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email Address (Optional)" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your@email.com"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {selectedRole === 'Freelancer' && (
                                <div className="bg-orange-50/50 dark:bg-orange-500/5 p-5 rounded-2xl border border-orange-100 dark:border-orange-500/10">
                                    <InputLabel htmlFor="identity_document" value="Verification (SSM or MyKad)" />
                                    <div className="mt-2 relative">
                                        <input
                                            id="identity_document"
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setData('identity_document', e.target.files[0])}
                                            accept=".pdf,.jpg,.jpeg,.png"
                                        />
                                        <label
                                            htmlFor="identity_document"
                                            className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-orange-200 dark:border-orange-500/20 rounded-xl cursor-pointer hover:bg-white transition-all text-sm font-bold text-orange-600"
                                        >
                                            <FileUp size={20} />
                                            {data.identity_document ? data.identity_document.name : 'Choose File (PDF/JPG)'}
                                        </label>
                                    </div>
                                    <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Note: Required for freelancer verification</p>
                                    <InputError message={errors.identity_document} className="mt-2" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="password" value="Password" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <PrimaryButton className="w-full py-4 text-sm font-black" disabled={processing}>
                                    COMPLETE REGISTRATION <ArrowRight size={18} className="ml-2" />
                                </PrimaryButton>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
