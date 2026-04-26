import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

export default function AccountDeletion() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
            <Head title="Request Account Deletion" />

            {/* Navigation */}
            <nav className="bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/5 h-20">
                <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <ApplicationLogo />
                        </div>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                            ONECLICK<span className="text-[#FF6600]">HUB</span>
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
                    Request Account <span className="text-[#FF6600]">Deletion</span>
                </h1>
                <p className="text-sm text-gray-400 mb-12">Last updated: March 5, 2026</p>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">How to Request Account Deletion</h2>
                        <p>
                            If you wish to delete your One Click Hub account, whether you are a <strong>Customer</strong> or a <strong>Freelancer</strong>,
                            you can request account deletion by contacting our admin team through our Contact page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Steps to Delete Your Account</h2>
                        <ol className="list-decimal pl-6 space-y-3">
                            <li>
                                Visit our <Link href={route('contact')} className="text-[#FF6600] font-bold hover:underline">Contact Page</Link>.
                            </li>
                            <li>
                                Fill in the contact form with:
                                <ul className="list-disc pl-6 mt-2 space-y-1">
                                    <li><strong>Your Name</strong> — the name registered on your account</li>
                                    <li><strong>Email Address</strong> — the email associated with your account</li>
                                    <li><strong>Subject</strong> — enter "Account Deletion Request"</li>
                                    <li><strong>Message</strong> — provide your phone number and reason for deletion (optional)</li>
                                </ul>
                            </li>
                            <li>Submit the form and our admin team will process your request.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">What Happens When Your Account is Deleted</h2>
                        <p>Once your account deletion request is processed:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Your personal information (name, email, phone number) will be permanently removed.</li>
                            <li>Your profile and any service listings will be removed from the platform.</li>
                            <li>Any active orders must be completed or cancelled before deletion can proceed.</li>
                            <li>Chat messages and reviews associated with your account will be anonymized.</li>
                            <li>Transaction records may be retained as required by Malaysian law for auditing purposes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">For Freelancers</h2>
                        <p>If you are a Freelancer with an active subscription, please note:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Your subscription will be cancelled and no refund will be issued for the remaining period.</li>
                            <li>All your service listings will be permanently removed.</li>
                            <li>Pending orders must be fulfilled or cancelled before account deletion.</li>
                            <li>Your SSM verification documents will be securely deleted.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Processing Time</h2>
                        <p>
                            Account deletion requests are typically processed within <strong>7 business days</strong>.
                            You will receive a confirmation email once your account has been successfully deleted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Contact Us</h2>
                        <p>If you have any questions about account deletion, please reach out to us:</p>
                        <ul className="list-disc pl-6 space-y-1">
                            <li><strong>Email:</strong> support@oneclickhub.com.my</li>
                            <li><strong>Contact Page:</strong> <Link href={route('contact')} className="text-[#FF6600] font-bold hover:underline">Contact Us</Link></li>
                        </ul>
                    </section>

                    {/* CTA */}
                    <div className="mt-12 p-8 rounded-2xl bg-[#FF6600]/5 border border-[#FF6600]/20 text-center">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight mb-2">Ready to submit your request?</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Visit our Contact page and fill in the form to get started.</p>
                        <Link
                            href={route('contact')}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[#FF6600] hover:bg-[#e55b00] text-white font-bold text-sm rounded-xl transition-colors"
                        >
                            Go to Contact Page
                        </Link>
                    </div>

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
        </div>
    );
}
