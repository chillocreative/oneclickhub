import ApplicationLogo from '@/Components/ApplicationLogo';
import BackToTop from '@/Components/BackToTop';
import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
            <Head title="Privacy Policy" />

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
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
                    Privacy <span className="text-[#FF6600]">Policy</span>
                </h1>
                <p className="text-sm text-gray-400 mb-12">Last updated: March 5, 2026</p>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">1. Introduction</h2>
                        <p>
                            One Click Hub ("we", "our", or "us") operates the One Click Hub platform at
                            oneclickhub.com.my and the One Click Hub mobile application. This Privacy Policy explains
                            how we collect, use, disclose, and safeguard your information when you use our platform.
                        </p>
                        <p>
                            By using One Click Hub, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">2. Information We Collect</h2>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">2.1 Personal Information</h3>
                        <p>When you register or use our platform, we may collect:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Full name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Business name and SSM registration details (for freelancers)</li>
                            <li>Banking and payment information</li>
                            <li>Profile information and photographs</li>
                        </ul>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">2.2 Usage Information</h3>
                        <p>We automatically collect:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Device information (type, operating system, unique identifiers)</li>
                            <li>Log data (IP address, browser type, pages visited)</li>
                            <li>Usage patterns and interaction data</li>
                            <li>Location data (general region based on IP)</li>
                        </ul>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">2.3 Service Data</h3>
                        <p>Information related to services you create, book, or interact with, including:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Service listings and descriptions</li>
                            <li>Order and booking details</li>
                            <li>Chat messages between users</li>
                            <li>Reviews and ratings</li>
                            <li>Uploaded images and documents</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">3. How We Use Your Information</h2>
                        <p>We use the collected information to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide, operate, and maintain our platform</li>
                            <li>Process transactions and manage subscriptions</li>
                            <li>Verify freelancer identity through SSM certificate validation</li>
                            <li>Facilitate communication between customers and freelancers</li>
                            <li>Send notifications about orders, bookings, and account activity</li>
                            <li>Improve and personalize user experience</li>
                            <li>Ensure platform security and prevent fraud</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">4. Information Sharing</h2>
                        <p>We may share your information with:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Other users:</strong> Your public profile, service listings, and reviews are visible to other users on the platform</li>
                            <li><strong>Payment processors:</strong> To process subscription payments and transactions (e.g., Bayarcash, SenangPay)</li>
                            <li><strong>Service providers:</strong> Third-party services that assist in operating our platform (hosting, analytics)</li>
                            <li><strong>Legal requirements:</strong> When required by Malaysian law, regulation, or legal process</li>
                        </ul>
                        <p>We do not sell your personal information to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational security measures to protect your personal data,
                            including encrypted data transmission (HTTPS/TLS), secure password hashing, and access controls.
                            However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">6. Data Retention</h2>
                        <p>
                            We retain your personal information for as long as your account is active or as needed to provide
                            our services. If you delete your account, we will remove your personal data within 30 days,
                            except where retention is required by law or for legitimate business purposes (e.g., transaction records).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">7. Your Rights</h2>
                        <p>Under the Malaysian Personal Data Protection Act 2010 (PDPA), you have the right to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Access your personal data held by us</li>
                            <li>Correct any inaccurate or incomplete personal data</li>
                            <li>Withdraw consent for processing of your personal data</li>
                            <li>Request deletion of your account and associated data</li>
                        </ul>
                        <p>To exercise these rights, please contact us at the details provided below.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">8. Cookies</h2>
                        <p>
                            We use cookies and similar technologies to maintain your session, remember your preferences,
                            and improve platform functionality. You can control cookies through your browser settings,
                            but disabling them may affect your ability to use certain features.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">9. Third-Party Links</h2>
                        <p>
                            Our platform may contain links to third-party websites or advertisements. We are not responsible
                            for the privacy practices of these external sites. We encourage you to review their privacy policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">10. Children's Privacy</h2>
                        <p>
                            Our platform is not intended for individuals under the age of 18. We do not knowingly collect
                            personal information from children. If we discover that a child has provided us with personal data,
                            we will take steps to delete it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">11. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                            the new policy on this page and updating the "Last updated" date. Continued use of the platform
                            after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">12. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Company:</strong> One Click Hub</li>
                            <li><strong>Email:</strong> support@oneclickhub.com.my</li>
                            <li><strong>Location:</strong> Penang, Malaysia</li>
                        </ul>
                    </section>

                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0c0c0c]">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <ApplicationLogo />
                        </div>
                        <span className="text-sm font-black dark:text-white tracking-tighter uppercase">One Click Hub</span>
                    </div>
                    <p className="text-gray-400 text-sm">&copy; 2026 One Click Hub. All rights reserved.</p>
                </div>
            </footer>

            <BackToTop />
        </div>
    );
}
