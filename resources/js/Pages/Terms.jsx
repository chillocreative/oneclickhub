import ApplicationLogo from '@/Components/ApplicationLogo';
import BackToTop from '@/Components/BackToTop';
import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
            <Head title="Terms of Service" />

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
                    Terms of <span className="text-[#FF6600]">Service</span>
                </h1>
                <p className="text-sm text-gray-400 mb-12">Last updated: March 5, 2026</p>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the One Click Hub platform ("Platform"), operated by One Click Hub Enterprise ("we", "our", or "us"),
                            you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the Platform.
                        </p>
                        <p>
                            These Terms apply to all users of the Platform, including customers, freelancers, and administrators.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">2. Platform Description</h2>
                        <p>
                            One Click Hub is a freelance services marketplace that connects customers with freelancers across Malaysia.
                            The Platform allows freelancers to list their services and customers to browse, book, and pay for those services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">3. User Accounts</h2>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">3.1 Registration</h3>
                        <p>To use certain features, you must create an account. You agree to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain and update your account information</li>
                            <li>Keep your password secure and confidential</li>
                            <li>Be responsible for all activity under your account</li>
                        </ul>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">3.2 Account Types</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Customer:</strong> Can browse services, place orders, and leave reviews</li>
                            <li><strong>Freelancer:</strong> Can list services, manage orders, and receive payments (requires active subscription and SSM verification)</li>
                            <li><strong>Admin:</strong> Platform administrators with management capabilities</li>
                        </ul>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">3.3 Account Termination</h3>
                        <p>
                            We reserve the right to suspend or terminate your account at any time for violation of these Terms,
                            fraudulent activity, or any reason we deem necessary to protect the Platform and its users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">4. Freelancer Obligations</h2>
                        <p>As a freelancer on the Platform, you agree to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Maintain a valid SSM (Suruhanjaya Syarikat Malaysia) registration</li>
                            <li>Provide accurate and truthful service listings</li>
                            <li>Deliver services as described and within agreed timelines</li>
                            <li>Maintain an active subscription plan to list services</li>
                            <li>Respond to customer inquiries and orders in a timely manner</li>
                            <li>Comply with all applicable Malaysian laws and regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">5. Customer Obligations</h2>
                        <p>As a customer on the Platform, you agree to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Provide accurate booking and payment information</li>
                            <li>Pay for services as agreed upon booking</li>
                            <li>Communicate respectfully with freelancers</li>
                            <li>Leave honest and fair reviews based on actual experience</li>
                            <li>Not misuse the platform for fraudulent or illegal purposes</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">6. Subscriptions & Payments</h2>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">6.1 Freelancer Subscriptions</h3>
                        <p>
                            Freelancers must subscribe to an active plan to list services on the Platform.
                            Subscription fees are billed annually and are non-refundable unless otherwise stated.
                        </p>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">6.2 Service Payments</h3>
                        <p>
                            Payments for services are processed through our payment partners (Bayarcash, SenangPay).
                            We are not responsible for payment processing errors by third-party providers.
                        </p>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">6.3 Cancellations</h3>
                        <p>
                            Order cancellation policies are determined by individual freelancers. Subscription cancellations
                            take effect at the end of the current billing period. No partial refunds are provided for
                            mid-period cancellations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">7. Content & Intellectual Property</h2>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">7.1 User Content</h3>
                        <p>
                            You retain ownership of content you upload (images, descriptions, reviews). By posting content on the Platform,
                            you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content
                            in connection with operating the Platform.
                        </p>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">7.2 Prohibited Content</h3>
                        <p>You must not upload or share content that:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Is illegal, harmful, threatening, or discriminatory</li>
                            <li>Infringes on intellectual property rights of others</li>
                            <li>Contains malware, spam, or deceptive material</li>
                            <li>Violates Malaysian law or public decency</li>
                        </ul>

                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-4">7.3 Platform IP</h3>
                        <p>
                            The One Click Hub name, logo, and platform design are the intellectual property of One Click Hub Enterprise.
                            You may not use our branding without written permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">8. Limitation of Liability</h2>
                        <p>
                            One Click Hub acts as a marketplace connecting customers and freelancers. We are not a party to
                            agreements between customers and freelancers and do not guarantee the quality, safety, or legality
                            of services offered.
                        </p>
                        <p>To the fullest extent permitted by Malaysian law:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>We provide the Platform "as is" without warranties of any kind</li>
                            <li>We are not liable for disputes between customers and freelancers</li>
                            <li>We are not responsible for any indirect, incidental, or consequential damages</li>
                            <li>Our total liability shall not exceed the fees paid by you in the preceding 12 months</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">9. Dispute Resolution</h2>
                        <p>
                            In the event of a dispute between users, we encourage resolution through our in-app messaging system.
                            If a resolution cannot be reached, we may intervene at our discretion.
                        </p>
                        <p>
                            For disputes with One Click Hub Enterprise, Malaysian law shall apply and disputes shall be
                            resolved in the courts of Penang, Malaysia.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">10. Prohibited Activities</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Use the Platform for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to the Platform or other user accounts</li>
                            <li>Interfere with or disrupt the Platform's infrastructure</li>
                            <li>Scrape, crawl, or collect data from the Platform without permission</li>
                            <li>Circumvent the Platform to transact directly with users met through the Platform</li>
                            <li>Create multiple accounts or impersonate another person</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">11. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold harmless One Click Hub Enterprise, its officers, employees, and agents
                            from any claims, damages, losses, or expenses arising from your use of the Platform, your violation
                            of these Terms, or your violation of any rights of a third party.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">12. Modifications to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Changes will be posted on this page with an
                            updated "Last updated" date. Continued use of the Platform after changes constitutes acceptance
                            of the modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">13. Governing Law</h2>
                        <p>
                            These Terms are governed by and construed in accordance with the laws of Malaysia.
                            Any legal proceedings shall be conducted in the courts of Penang, Malaysia.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">14. Contact Us</h2>
                        <p>If you have any questions about these Terms of Service, please contact us:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Company:</strong> One Click Hub Enterprise</li>
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
                    <p className="text-gray-400 text-sm">&copy; 2026 One Click Hub Enterprise. All rights reserved.</p>
                </div>
            </footer>

            <BackToTop />
        </div>
    );
}
