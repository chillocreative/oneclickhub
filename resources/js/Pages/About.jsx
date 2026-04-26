import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

/**
 * Public-facing About Us article.
 *
 * The mobile app's About Us screen is a thin WebViewPageScreen pointing
 * at /about, so editing the copy here updates both web and mobile in
 * one go — no Play Store release required.
 */
export default function About() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
            <Head title="About Us" />

            {/* Navigation */}
            <nav className="bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/5 h-20">
                <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <ApplicationLogo />
                        </div>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ONE CLICK <span className="text-[#FF6600]">HUB</span>
                        </span>
                    </Link>
                    <Link href="/" className="text-sm font-bold text-[#FF6600] hover:underline">
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                        <ApplicationLogo />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                        About <span className="text-[#FF6600]">Us</span>
                    </h1>
                </div>

                <div className="bg-white dark:bg-[#111] p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        About One Click Hub
                    </h2>

                    <div className="prose prose-gray dark:prose-invert max-w-none text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 space-y-5">
                        <p>
                            One Click Hub was created with a simple vision to make digital tools accessible,
                            efficient, and powerful for businesses of all sizes. Built as a centralized
                            digital platform, One Click Hub enables entrepreneurs, startups, and organizations
                            to manage their online presence, streamline operations, and connect with their
                            customers through a single, user-friendly system. The platform focuses on
                            simplifying complex digital processes so businesses can focus on growth rather
                            than technical challenges.
                        </p>

                        <p>
                            The idea behind One Click Hub was born from years of experience working with
                            businesses that struggled with fragmented tools and complicated digital systems.
                            Many companies rely on multiple platforms to handle marketing, automation,
                            communication, and analytics. One Click Hub was designed to solve this problem
                            by bringing everything together into one integrated ecosystem — a concept
                            increasingly used in modern digital platforms that combine multiple business
                            tools into one interface to improve efficiency and collaboration.
                        </p>

                        <p>
                            One Click Hub was founded by <strong>Sharil Azman</strong>, a technology
                            entrepreneur with a background in digital infrastructure, web platforms, and
                            online business automation. After working closely with startups and digital
                            agencies across Southeast Asia, he recognized the growing need for a streamlined
                            platform that empowers businesses to launch and manage their digital operations
                            quickly and effectively. His vision was to build a platform that could help
                            businesses move from idea to execution with just a few clicks.
                        </p>

                        <p>
                            The platform was later joined by <strong>Daniel Lokman</strong>, the co-founder
                            of One Click Hub, who brought strong expertise in product development and
                            digital growth strategy. Together, they assembled a small but passionate team
                            focused on building scalable tools that support entrepreneurs, digital marketers,
                            and growing companies. Today, One Click Hub continues to evolve as a modern
                            business platform designed to help organizations operate smarter, faster, and
                            more efficiently in an increasingly digital world.
                        </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-4 justify-center text-sm font-bold">
                        <Link href={route('privacy')} className="text-[#FF6600] hover:underline">Privacy Policy</Link>
                        <span className="text-gray-300">|</span>
                        <Link href={route('terms')} className="text-[#FF6600] hover:underline">Terms &amp; Conditions</Link>
                        <span className="text-gray-300">|</span>
                        <Link href={route('contact')} className="text-[#FF6600] hover:underline">Contact</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
