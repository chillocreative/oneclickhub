import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function UploadingOverlay({ show, message = 'Uploading...' }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white dark:bg-[#111] rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl"
                    >
                        <div className="relative">
                            <div className="size-16 rounded-full border-4 border-gray-100 dark:border-white/10" />
                            <Loader2
                                size={64}
                                className="absolute inset-0 text-[#FF6600] animate-spin"
                                strokeWidth={2.5}
                            />
                        </div>
                        <p className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">
                            {message}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
