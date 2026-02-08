import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function UserAddModal({ show, onClose, role }) {
    const { t } = useLanguage();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone_number: '',
        email: '',
        password: 'password', // Default password for new users
        position: '',
        role: role,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                        {t('users.addUser')} <span className="text-[#FF6600]">{role}</span>
                    </h2>
                    <div className="size-12 rounded-2xl bg-[#34C38F]/10 flex items-center justify-center font-black text-[#34C38F]">
                        +
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="name" value={t('users.fullName')} />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Enter full name"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone_number" value={t('users.phoneNumber')} />
                        <TextInput
                            id="phone_number"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="e.g. 01112345678"
                            required
                        />
                        <InputError message={errors.phone_number} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value={t('users.email')} />
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Enter email address"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="position" value="Position / Designation" />
                        <TextInput
                            id="position"
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder={role === 'Freelancer' ? 'e.g. Graphic Designer' : 'e.g. Support Admin'}
                        />
                        <InputError message={errors.position} className="mt-2" />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            <span className="text-[#FF6600]">Note:</span> New users will be created with the default password <span className="text-gray-900 dark:text-white font-black">"password"</span>. They can change this upon their first login.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-10">
                        <SecondaryButton onClick={() => { onClose(); reset(); }} type="button">{t('users.cancel')}</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[#34C38F] border-[#34C38F] hover:bg-[#2ca377] text-white">{t('users.createUser')}</PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
