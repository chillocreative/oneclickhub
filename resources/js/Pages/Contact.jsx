import ApplicationLogo from '@/Components/ApplicationLogo';
import BackToTop from '@/Components/BackToTop';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_number: '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('contact.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
            <Head title="Contact Us" />

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
                    Contact <span className="text-[#FF6600]">Us</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">
                    Have a question or need help? Send us a message and we'll get back to you as soon as possible.
                </p>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FF6600]/10 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-[#FF6600]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Email</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">support@oneclickhub.com.my</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FF6600]/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-[#FF6600]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Location</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Penang, Malaysia</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        {flash?.success && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">{flash.success}</p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FF6600] focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Ahmad Faiz"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FF6600] focus:border-transparent outline-none transition-all"
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FF6600] focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. 60123456789"
                                />
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FF6600] focus:border-transparent outline-none transition-all"
                                    placeholder="How can we help you?"
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#FF6600] focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[#FF6600] hover:bg-[#e55b00] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {processing ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
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
                    <p className="text-gray-400 text-sm">&copy; 2026 One Click Hub. All rights reserved.</p>
                </div>
            </footer>

            <BackToTop />
        </div>
    );
}
