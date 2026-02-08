import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedPreloader({ onComplete }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Minimum loading time of 2 seconds for animation to be seen
        const timer = setTimeout(() => {
            setIsLoading(false);
            if (onComplete) onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-black dark:to-orange-950"
        >
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF6600]/10 dark:bg-[#FF6600]/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        x: [0, -40, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFB800]/15 dark:bg-[#FFB800]/25 rounded-full blur-[120px]"
                />
            </div>

            {/* Mascot Container with Floating Animation */}
            <motion.div
                animate={{
                    y: [-10, 10, -10],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-10"
            >
                {/* Mascot SVG with breathing effect */}
                <motion.div
                    animate={{
                        scale: [1, 1.02, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative"
                >
                    <svg
                        width="200"
                        height="200"
                        viewBox="0 0 200 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="drop-shadow-2xl"
                    >
                        {/* Lion body/head - simplified version */}
                        <motion.circle
                            cx="100"
                            cy="100"
                            r="60"
                            fill="#FF6600"
                            className="drop-shadow-lg"
                        />

                        {/* Mane */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                            const x = 100 + Math.cos((angle * Math.PI) / 180) * 65;
                            const y = 100 + Math.sin((angle * Math.PI) / 180) * 65;
                            return (
                                <motion.circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="20"
                                    fill="#FFB800"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.1
                                    }}
                                />
                            );
                        })}

                        {/* Left Antenna */}
                        <motion.g
                            animate={{
                                rotate: [-5, 5, -5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{ transformOrigin: "80px 40px" }}
                        >
                            <line x1="80" y1="40" x2="70" y2="20" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="70" cy="20" r="5" fill="#FF6600" />
                        </motion.g>

                        {/* Right Antenna */}
                        <motion.g
                            animate={{
                                rotate: [5, -5, 5],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{ transformOrigin: "120px 40px" }}
                        >
                            <line x1="120" y1="40" x2="130" y2="20" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="130" cy="20" r="5" fill="#FF6600" />
                        </motion.g>

                        {/* Face */}
                        <circle cx="100" cy="100" r="50" fill="#FFD700" />

                        {/* Left Eye */}
                        <g>
                            <ellipse cx="85" cy="95" rx="8" ry="12" fill="#333" />
                            <motion.ellipse
                                cx="85"
                                cy="95"
                                rx="8"
                                ry="12"
                                fill="#333"
                                animate={{
                                    scaleY: [1, 0.1, 1],
                                }}
                                transition={{
                                    duration: 0.2,
                                    repeat: Infinity,
                                    repeatDelay: 3.8,
                                    ease: "easeInOut"
                                }}
                            />
                            <circle cx="87" cy="93" r="3" fill="white" />
                        </g>

                        {/* Right Eye */}
                        <g>
                            <ellipse cx="115" cy="95" rx="8" ry="12" fill="#333" />
                            <motion.ellipse
                                cx="115"
                                cy="95"
                                rx="8"
                                ry="12"
                                fill="#333"
                                animate={{
                                    scaleY: [1, 0.1, 1],
                                }}
                                transition={{
                                    duration: 0.2,
                                    repeat: Infinity,
                                    repeatDelay: 3.8,
                                    ease: "easeInOut"
                                }}
                            />
                            <circle cx="117" cy="93" r="3" fill="white" />
                        </g>

                        {/* Nose */}
                        <circle cx="100" cy="105" r="6" fill="#FF6600" />

                        {/* Mouth */}
                        <path
                            d="M 100 110 Q 90 120 85 115 M 100 110 Q 110 120 115 115"
                            stroke="#333"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                        />

                        {/* Whiskers */}
                        <line x1="60" y1="100" x2="30" y2="95" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        <line x1="60" y1="105" x2="30" y2="110" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        <line x1="140" y1="100" x2="170" y2="95" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                        <line x1="140" y1="105" x2="170" y2="110" stroke="#333" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </motion.div>

                {/* Loading text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight mb-2">
                        ONECLICK<span className="text-[#FF6600]">HUB</span>
                    </h2>
                    <motion.div
                        animate={{
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="flex gap-2 justify-center"
                    >
                        <div className="w-2 h-2 rounded-full bg-[#FF6600]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#FF6600]" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#FF6600]" style={{ animationDelay: '0.4s' }}></div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
