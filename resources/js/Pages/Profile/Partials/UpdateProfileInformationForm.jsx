import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import UploadingOverlay from '@/Components/UploadingOverlay';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const { auth, ssm } = usePage().props;
    const user = auth.user;
    const fileInput = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const { data, setData, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            profile_picture: null,
        });

    const selectPhoto = () => {
        fileInput.current.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('profile_picture', file);

        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const submit = (e) => {
        e.preventDefault();

        const payload = {
            _method: 'PATCH',
            name: data.name,
            email: data.email,
        };
        if (data.profile_picture) {
            payload.profile_picture = data.profile_picture;
        }

        router.post(route('profile.update'), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPhotoPreview(null);
                setData('profile_picture', null);
            },
        });
    };

    const avatarSrc = photoPreview || user.profile_picture_url;

    return (
        <section className={className}>
            <UploadingOverlay show={processing} />

            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-3">
                    <input
                        type="file"
                        ref={fileInput}
                        className="hidden"
                        accept="image/jpg,image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                    />
                    <button
                        type="button"
                        onClick={selectPhoto}
                        className="relative group"
                    >
                        <div className="size-24 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-[#FFB800] p-[3px] shadow-lg group-hover:scale-105 transition-all">
                            <div className="size-full bg-white dark:bg-gray-900 rounded-[13px] flex items-center justify-center overflow-hidden">
                                {avatarSrc ? (
                                    <img
                                        src={avatarSrc}
                                        alt={user.name}
                                        className="size-full object-cover rounded-[13px]"
                                    />
                                ) : (
                                    <span className="text-2xl font-black text-[#FF6600]">
                                        {user.name ? user.name.charAt(0) : '?'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#FF6600] text-white rounded-full p-1.5 shadow-lg group-hover:scale-110 transition-all">
                            <Camera size={14} />
                        </div>
                        {ssm?.status === 'verified' && (
                            <div className="absolute -top-1 -left-1 bg-white rounded-full p-[1px] shadow-sm">
                                <svg className="size-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
                                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        )}
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click to change photo
                    </p>
                    <InputError className="mt-1" message={errors.profile_picture} />
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
