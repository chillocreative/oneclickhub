import { motion } from 'framer-motion';
import PublicHeader from '@/Components/PublicHeader';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function GuestLayout({ children, maxWidth = 'max-w-md' }) {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-white dark:bg-[#0c0c0c] font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF6600]/10 dark:bg-[#FF6600]/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        x: [0, -40, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFB800]/15 dark:bg-[#FFB800]/25 rounded-full blur-[100px]"
                />
                <div className="absolute inset-0 hero-pattern opacity-30 pointer-events-none" />
            </div>

            <PublicHeader />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6 pt-24"
            >
                <div className={`w-full ${maxWidth} overflow-hidden glass p-8 shadow-2xl rounded-[2.5rem] border border-white/40 dark:border-white/10 relative transition-all duration-500`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6600] to-[#FFB800]" />
                    {children}
                </div>

                <p className="mt-8 text-sm text-gray-500 font-bold tracking-tight">
                    {t('footer.trusted')}
                </p>
            </motion.div>
        </div>
    );
}
