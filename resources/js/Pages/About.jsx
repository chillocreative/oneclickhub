import ApplicationLogo from '@/Components/ApplicationLogo';
import BackToTop from '@/Components/BackToTop';
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
                            One Click Hub was established with a clear vision: to make digital tools
                            accessible, efficient, and impactful for businesses of every scale. As a
                            centralized digital platform, One Click Hub empowers entrepreneurs, startups,
                            and established organizations to manage their online presence, streamline
                            daily operations, and engage with customers through a single, intuitive system.
                            Our platform is built to simplify complex digital workflows, allowing businesses
                            to dedicate their energy to growth rather than navigating technical hurdles.
                        </p>

                        <p>
                            The concept behind One Click Hub emerged from years of hands-on experience
                            supporting businesses that grappled with fragmented tools and disjointed digital
                            systems. Many organizations depend on a patchwork of platforms to manage
                            marketing, automation, communication, and analytics, often resulting in
                            inefficiency and lost opportunities. One Click Hub was designed to address
                            this challenge by consolidating these essential functions into one unified
                            ecosystem, reflecting the modern shift toward integrated digital platforms
                            that enhance productivity, collaboration, and operational clarity.
                        </p>

                        <p>
                            One Click Hub was founded by <strong>Helmy Samsudin</strong>, a passionate
                            photographer who successfully transformed his lifelong hobby into a thriving
                            business. Through his journey as a freelance professional, Helmy experienced
                            firsthand the challenges of promoting services, attracting clients, and managing
                            bookings across scattered platforms. This inspired him to envision a dedicated
                            space where freelancers like himself could easily showcase their talents,
                            connect with potential clients, and grow their businesses with confidence. His
                            goal was to create a platform that empowers every freelancer to turn their
                            passion into opportunity, making it simple to promote services and reach the
                            right audience in just a few clicks.
                        </p>

                        <p>
                            He was later joined by <strong>Abdul Rahim Abdul Rani</strong>, Co-Founder of
                            One Click Hub, who brings deep expertise in product development and digital
                            growth strategy. Together, Helmy and Abdul Rahim built a dedicated team
                            committed to developing scalable, forward-thinking tools that serve
                            entrepreneurs, digital marketers, and expanding enterprises. Today, One Click
                            Hub continues to evolve as a modern business platform engineered to help
                            organizations operate smarter, move faster, and thrive in an increasingly
                            competitive digital landscape.
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

            <BackToTop />
        </div>
    );
}
