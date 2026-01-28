import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SuccessNotification({ message, onClear }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClear, 500); // Wait for exit animation
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClear]);

    if (!message) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                >
                    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-2xl shadow-orange-500/20 p-8 flex flex-col items-center gap-4 max-w-sm w-full pointer-events-auto overflow-hidden relative group">
                        {/* Magnificent Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#34C38F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="size-20 rounded-3xl bg-[#34C38F]/10 flex items-center justify-center text-[#34C38F] mb-2">
                            <CheckCircle size={40} strokeWidth={2.5} />
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Success!</h3>
                            <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{message}</p>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: 0 }}
                            transition={{ duration: 3, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-1 bg-[#34C38F]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
