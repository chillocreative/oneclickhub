/**
 * Download badges for Google Play + Huawei AppGallery.
 *
 * Self-contained styled pill buttons (no external image hosts) that
 * mirror the official badge layout: small store icon, two-line label
 * ("GET IT ON" / "Google Play", "EXPLORE IT ON" / "AppGallery").
 *
 * Drop in anywhere with `<AppStoreBadges />`. Pass `align="center"` if
 * the parent isn't already centring children.
 */
export default function AppStoreBadges({ align = 'center', className = '' }) {
    const justify = align === 'start' ? 'justify-start'
        : align === 'end' ? 'justify-end'
        : 'justify-center';

    return (
        <div className={`flex flex-wrap ${justify} gap-3 ${className}`}>
            <a
                href="https://play.google.com/store/apps/details?id=com.oneclickhub.app&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-black text-white border border-white/10 hover:bg-gray-900 transition-colors min-w-[180px]"
            >
                <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
                    <defs>
                        <linearGradient id="gp-a" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#00C2FF" /><stop offset="1" stopColor="#0073FF" />
                        </linearGradient>
                        <linearGradient id="gp-b" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#FFCE00" /><stop offset="1" stopColor="#FFA000" />
                        </linearGradient>
                        <linearGradient id="gp-c" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#FF3A44" /><stop offset="1" stopColor="#C31162" />
                        </linearGradient>
                        <linearGradient id="gp-d" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#00F076" /><stop offset="1" stopColor="#009E5A" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#gp-a)" d="M3.6 1.8a2 2 0 00-.6 1.4v17.6c0 .56.22 1.06.6 1.4l9.5-10.2L3.6 1.8z" />
                    <path fill="url(#gp-b)" d="M16.6 14.6l-3.5-3.6 3.5-3.6 4.4 2.5c1.1.6 1.1 2.2 0 2.8l-4.4 1.9z" />
                    <path fill="url(#gp-c)" d="M16.6 14.6l-3.5-3.6L3.6 22.2c.55.5 1.4.55 2.05.18l10.95-7.78z" />
                    <path fill="url(#gp-d)" d="M16.6 7.4L5.65 1.62A1.55 1.55 0 003.6 1.8L13.1 12l3.5-4.6z" />
                </svg>
                <div className="flex flex-col leading-tight text-left">
                    <span className="text-[9px] uppercase tracking-wide text-gray-300">Get it on</span>
                    <span className="text-base font-black tracking-tight">Google Play</span>
                </div>
            </a>

            <a
                href="https://appgallery.huawei.com/#/app/C117344215"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Explore it on AppGallery"
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-black text-white border border-white/10 hover:bg-gray-900 transition-colors min-w-[180px]"
            >
                <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
                    <defs>
                        <linearGradient id="hw-a" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#FF3D3D" /><stop offset="1" stopColor="#C30000" />
                        </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="11" fill="url(#hw-a)" />
                    <path
                        fill="#fff"
                        d="M12 5.2c.6 1.7 1.7 3 3.6 3.5-1.2.9-1.9 2.1-1.9 3.7 0 1.6.7 2.8 1.9 3.7-1.9.5-3 1.8-3.6 3.5-.6-1.7-1.7-3-3.6-3.5 1.2-.9 1.9-2.1 1.9-3.7 0-1.6-.7-2.8-1.9-3.7 1.9-.5 3-1.8 3.6-3.5z"
                    />
                </svg>
                <div className="flex flex-col leading-tight text-left">
                    <span className="text-[9px] uppercase tracking-wide text-gray-300">Explore it on</span>
                    <span className="text-base font-black tracking-tight">AppGallery</span>
                </div>
            </a>
        </div>
    );
}
