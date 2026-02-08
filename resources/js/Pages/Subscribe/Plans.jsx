import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function Plans({ plans }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Choose Your <span className="text-[#FF6600]">Plan</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold mt-1">
                        Select a subscription plan to start listing your services
                    </p>
                </div>
            }
        >
            <Head title="Choose Plan" />

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass p-10 rounded-[3rem] relative flex flex-col ${
                            plan.is_popular
                                ? 'border-[#FF6600] shadow-2xl shadow-orange-500/10'
                                : 'border-white/10'
                        }`}
                    >
                        {plan.is_popular && (
                            <div className="absolute top-6 right-6 bg-[#FF6600] text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
                                Best Value
                            </div>
                        )}

                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">
                            {plan.name}
                        </h3>

                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                                RM {Math.round(plan.price)}
                            </span>
                            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                /yr
                            </span>
                        </div>

                        <div className="space-y-4 flex-1 mb-10">
                            {(plan.features || []).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4 text-[#FF6600] flex-shrink-0" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Link
                            href={route('subscribe.checkout', plan.slug)}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-center transition-all block ${
                                plan.is_popular
                                    ? 'btn-gradient'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-[#FF6600]/10 hover:text-[#FF6600]'
                            }`}
                        >
                            Select Plan <ArrowRight className="inline w-4 h-4 ml-1" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
