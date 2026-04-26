export default function ApplicationLogo({ className, ...props }) {
    return (
        <img
            {...props}
            src="/oneclickhub-logo-transparent.png"
            alt="One Click Hub Logo"
            className={`w-full h-full object-contain ${className || ''}`}
        />
    );
}
