import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SuccessNotification from '@/Components/SuccessNotification';
import ErrorNotification from '@/Components/ErrorNotification';

/**
 * Global toast surface for Inertia flash messages. Mounted once in
 * resources/js/app.jsx so every page (public, auth, customer, freelancer,
 * admin) shows the same save-feedback UI. Controllers signal success or
 * failure with back()->with('success', ...) / back()->with('error', ...).
 *
 * Field-level validation errors stay where they are (rendered next to
 * inputs via the form's `errors` prop) — toasts here are for the overall
 * save outcome, not per-field problems.
 */
export default function FlashToaster() {
    const page = usePage();
    const flash = page?.props?.flash || {};

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (flash.success) setSuccessMessage(flash.success);
    }, [flash.success]);

    useEffect(() => {
        if (flash.error) setErrorMessage(flash.error);
    }, [flash.error]);

    return (
        <>
            <SuccessNotification
                message={successMessage}
                onClear={() => setSuccessMessage('')}
            />
            <ErrorNotification
                message={errorMessage}
                onClear={() => setErrorMessage('')}
            />
        </>
    );
}
