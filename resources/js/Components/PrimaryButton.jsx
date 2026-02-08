export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        if (props.onClick) {
            props.onClick(e);
        }
    };

    return (
        <button
            {...props}
            onClick={handleClick}
            className={
                `btn-gradient uppercase tracking-widest text-xs inline-flex items-center justify-center ${disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
