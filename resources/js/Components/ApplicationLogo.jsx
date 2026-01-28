export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6600" />
                    <stop offset="100%" stopColor="#FFB800" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Outer Ring */}
            <circle cx="50" cy="50" r="35" stroke="url(#logo-grad)" strokeWidth="4" strokeDasharray="15 5" />

            {/* Inner Hub */}
            <circle cx="50" cy="50" r="12" fill="url(#logo-grad)" filter="url(#glow)" />

            {/* Connection Nodes */}
            <circle cx="50" cy="15" r="5" fill="#FF6600" />
            <circle cx="85" cy="50" r="5" fill="#FFB800" />
            <circle cx="50" cy="85" r="5" fill="#FF6600" />
            <circle cx="15" cy="50" r="5" fill="#FFB800" />

            {/* Connecting Lines */}
            <path d="M50 15 L50 38" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M85 50 L62 50" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 85 L50 62" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 50 L38 50" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
