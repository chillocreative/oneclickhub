import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Floating "Back to Top" pill, fixed bottom-right.
 * Appears once the user has scrolled past 320px. Scrolls smoothly back
 * to the top of the page when clicked. Drop into any page that has
 * meaningful scroll length.
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
            className={`fixed bottom-6 right-6 z-50 size-12 rounded-full btn-gradient shadow-lg shadow-orange-500/30 inline-flex items-center justify-center transition-all duration-200 ${
                visible
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            <ArrowUp size={20} className="text-white" />
        </button>
    );
}
