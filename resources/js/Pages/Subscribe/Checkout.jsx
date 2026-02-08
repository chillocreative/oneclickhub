import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

export default function Checkout({ plan, gateways }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing } = useForm({
        gateway: gateways.length === 1 ? gateways[0].slug : '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('subscribe.pay', plan.slug));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <Link
                        href={route('subscribe.plans')}
                        className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-[#FF6600] mb-4 uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Plans
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Complete Your <span className="text-[#FF6600]">Subscription</span>
                    </h1>
                </div>
            }
        >
            <Head title="Checkout" />

            <div className="max-w-2xl">
                {flash?.error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm font-bold text-red-600">
                        {flash.error}
                    </div>
                )}

                {/* Plan Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-[2.5rem] mb-8"
                >
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                        Order Summary
                    </h2>

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                                {plan.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-bold">
                                Billed Yearly
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                RM {parseFloat(plan.price).toFixed(2)}
                            </span>
                            <span className="text-gray-400 font-bold text-xs">
                                /yr
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/5 pt-4 space-y-3">
                        {(plan.features || []).map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <ShieldCheck className="w-4 h-4 text-[#FF6600] flex-shrink-0" />
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Payment Gateway Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-8 rounded-[2.5rem]"
                >
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                        Payment Method
                    </h2>

                    <form onSubmit={submit}>
                        <div className="space-y-4 mb-8">
                            {gateways.map((gw) => (
                                <label
                                    key={gw.slug}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                        data.gateway === gw.slug
                                            ? 'border-[#FF6600] bg-orange-50/50 dark:bg-orange-500/5'
                                            : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gateway"
                                        value={gw.slug}
                                        checked={data.gateway === gw.slug}
                                        onChange={(e) => setData('gateway', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`size-12 rounded-xl flex items-center justify-center ${
                                        data.gateway === gw.slug
                                            ? 'bg-[#FF6600] text-white'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                    }`}>
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-black text-gray-900 dark:text-white text-sm">
                                            {gw.name}
                                        </span>
                                        <p className="text-xs text-gray-500 font-bold">
                                            {gw.slug === 'bayarcash' && 'FPX / DuitNow Online Banking'}
                                            {gw.slug === 'senangpay' && 'FPX / Credit Card / E-Wallet'}
                                        </p>
                                    </div>
                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                                        data.gateway === gw.slug
                                            ? 'border-[#FF6600]'
                                            : 'border-gray-300 dark:border-white/20'
                                    }`}>
                                        {data.gateway === gw.slug && (
                                            <div className="size-3 rounded-full bg-[#FF6600]" />
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {gateways.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p className="font-bold">No payment gateways available</p>
                                <p className="text-sm mt-1">Please contact support.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing || !data.gateway}
                            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 ${
                                processing || !data.gateway
                                    ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                                    : 'btn-gradient'
                            }`}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>Pay RM {parseFloat(plan.price).toFixed(2)} Now</>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
