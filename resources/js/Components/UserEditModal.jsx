import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function UserEditModal({ show, onClose, user, role }) {
    const { t } = useLanguage();
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: '',
        phone_number: '',
        email: '',
        position: '',
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name || '',
                phone_number: user.phone_number || '',
                email: user.email || '',
                position: user.position || role || '',
            });
        }
    }, [user]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('users.update', user.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                        {t('users.editUser')} <span className="text-[#FF6600]">{role}</span>
                    </h2>
                    <div className="size-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center font-black text-[#FF6600]">
                        {user?.name?.charAt(0)}
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
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="position" value={t('users.positionRole')} />
                        <TextInput
                            id="position"
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.position} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-10">
                        <SecondaryButton onClick={onClose} type="button">{t('users.cancel')}</SecondaryButton>
                        <PrimaryButton disabled={processing}>{t('users.saveChanges')}</PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
