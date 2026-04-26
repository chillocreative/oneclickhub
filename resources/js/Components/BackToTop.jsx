import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Floating "Back to Top" pill, fixed bottom-right.
 * Appears once the user has scrolled past 320px. Scrolls smoothly back
 * to the top of the page when clicked.
 *
 * Implementation note: uses explicit gradient + text-white classes
 * rather than the shared `btn-gradient` utility because that utility
 * has its own padding rules tuned for text buttons and was eating
 * the icon at this small size.
 */
export default function BackToTop({ threshold = 320 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > threshold);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    const scrollUp = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            type="button"
            onClick={scrollUp}
            aria-label="Back to top"
            className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full
                bg-gradient-to-br from-[#FF6600] to-[#FFB800] text-white
                shadow-lg shadow-orange-500/40
                flex items-center justify-center
                hover:scale-105 active:scale-95
                transition-all duration-200 ${
                visible
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            <ArrowUp size={22} strokeWidth={2.5} />
        </button>
    );
}
