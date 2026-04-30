import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SuccessNotification from '@/Components/SuccessNotification';
import ErrorNotification from '@/Components/ErrorNotification';

/**
 * Global toast surface for Inertia flash messages. Mounted once in
 * resources/js/app.jsx so every page (public, auth, customer, freelancer,
 * admin) shows the same save-feedback UI.
 *
 * We listen on Inertia's `router.on('success')` event rather than diffing
 * usePage().props.flash. Prop diffing misses two real cases:
 *   1. Saving twice in a row with the same flash text — useEffect dep
 *      compares 'Saved.' to 'Saved.' and bails out, so the second toast
 *      never appears.
 *   2. Some page renders re-evaluate shared closures unevenly, so the
 *      flash value can be stale by the time React reconciles.
 *
 * The router 'success' event fires once per successful request with the
 * fresh page in event.detail.page, which is the canonical signal.
 */
export default function FlashToaster() {
    const initialFlash = usePage()?.props?.flash || {};

    const [successMessage, setSuccessMessage] = useState(initialFlash.success || '');
    const [errorMessage, setErrorMessage] = useState(initialFlash.error || '');

    useEffect(() => {
        const remove = router.on('success', (event) => {
            const fresh = event.detail?.page?.props?.flash || {};
            if (fresh.success) setSuccessMessage(fresh.success);
            if (fresh.error) setErrorMessage(fresh.error);
        });
        return () => remove();
    }, []);

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
