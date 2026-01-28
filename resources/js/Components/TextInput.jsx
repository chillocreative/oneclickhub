import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-xl border-gray-300 shadow-sm focus:border-[#FF6600] focus:ring-[#FF6600] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300 dark:focus:border-[#FF6600] dark:focus:ring-[#FF6600] ' +
                className
            }
            ref={localRef}
        />
    );
});
