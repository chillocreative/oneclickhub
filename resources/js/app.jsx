import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from '@/Contexts/LanguageContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// On 419 (CSRF token mismatch) we used to window.location.reload(), which
// wiped any in-progress form data and forced users to re-type everything.
// Instead, swallow the failure and refresh the token in-place so the
// user's next click goes through with their data intact. No popup —
// the form already shows a "submit" affordance, and a second click is
// less jarring than a system alert.
router.on('invalid', async (event) => {
    if (event.detail.response.status !== 419) return;
    event.preventDefault();
    try {
        const res = await fetch(window.location.pathname + window.location.search, {
            headers: { Accept: 'text/html' },
            credentials: 'same-origin',
            cache: 'no-store',
        });
        const html = await res.text();
        const match = html.match(/<meta name="csrf-token" content="([^"]+)"/);
        if (match) {
            const fresh = match[1];
            document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', fresh);
            if (window.axios) window.axios.defaults.headers.common['X-CSRF-TOKEN'] = fresh;
        }
    } catch (e) {
        // fall through — user can refresh manually if this fails
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<LanguageProvider><App {...props} /></LanguageProvider>);
    },
    progress: {
        color: '#4B5563',
    },
});
