export default function ApplicationLogo({ className, ...props }) {
    return (
        <img
            {...props}
            src="/oneclickhub-logo-transparent.png"
            alt="OneClickHub Logo"
            className={`w-full h-full object-contain ${className || ''}`}
        />
    );
}
