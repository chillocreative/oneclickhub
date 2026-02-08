import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';

export default function ServicesIndex({ services, hasSubscription }) {
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this service?')) {
            router.delete(route('my-services.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            My <span className="text-[#FF6600]">Services</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">Manage your service listings.</p>
                    </div>
                    {hasSubscription ? (
                        <Link href={route('my-services.create')} className="btn-gradient px-6 py-2 text-xs inline-flex items-center gap-2 w-fit">
                            <Plus size={16} /> Add New Service
                        </Link>
                    ) : (
                        <Link href={route('subscribe.plans')} className="px-6 py-2 text-xs inline-flex items-center gap-2 w-fit bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-xl font-bold border border-amber-200 dark:border-amber-800">
                            <AlertTriangle size={16} /> Subscribe to Create Services
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="My Services" />

            {services.data.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-[#0c0c0c] p-12 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 text-center"
                >
                    <div className="size-20 mx-auto mb-6 rounded-3xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                        <Briefcase size={40} className="text-[#FF6600]" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Services Yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Create your first service to start getting customers.</p>
                    <Link href={route('my-services.create')} className="btn-gradient px-8 py-3 text-sm inline-flex items-center gap-2">
                        <Plus size={18} /> Create Service
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.data.map((service) => (
                        <motion.div
                            key={service.id}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#0c0c0c] rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden"
                        >
                            <div className="h-40 bg-gradient-to-br from-[#FF6600]/10 to-[#FFB800]/10 flex items-center justify-center">
                                {service.images?.[0] ? (
                                    <img src={`/storage/${service.images[0]}`} alt={service.title} className="w-full h-full object-cover" />
                                ) : (
                                    <Briefcase size={48} className="text-[#FF6600]/30" />
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white">{service.title}</h3>
                                        <p className="text-[10px] font-semibold text-gray-400">{service.category?.name}</p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${service.is_active ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : 'bg-gray-100 text-gray-400 dark:bg-white/5'}`}>
                                        {service.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="text-lg font-black text-[#FF6600] mb-4">
                                    RM {service.price_from}
                                    {service.price_to && <span className="text-sm font-semibold text-gray-400"> - RM {service.price_to}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('services.show', service.slug)}
                                        className="flex-1 text-center py-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                    >
                                        <Eye size={14} className="inline mr-1" /> View
                                    </Link>
                                    <Link
                                        href={route('my-services.edit', service.id)}
                                        className="flex-1 text-center py-2 text-xs font-bold text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
                                    >
                                        <Edit size={14} className="inline mr-1" /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="py-2 px-3 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
