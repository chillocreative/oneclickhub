import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const STATUS_BADGE = {
    pending: { color: 'bg-yellow-50 text-yellow-700', icon: Clock, label: 'Pending review' },
    approved: { color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'bg-red-50 text-red-700', icon: XCircle, label: 'Rejected' },
};

export default function MadaniApplication({ user, existing, flash }) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: (user?.name ?? '').toUpperCase(),
        ic_number: '',
        phone_number: user?.phone_number ?? '',
        address: user?.address ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('madani.store'));
    };

    const StatusIcon = existing ? STATUS_BADGE[existing.status]?.icon : null;
    const statusBadge = existing ? STATUS_BADGE[existing.status] : null;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Madani <span className="text-[#FF6600]">Application</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">
                        Sponsored access for eligible Malaysian citizens.
                    </p>
                </div>
            }
        >
            <Head title="Madani Application" />

            <div className="max-w-2xl space-y-6">
                <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-5">
                    <div className="font-black text-[#FF6600] mb-1">
                        Madani — fully sponsored
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Your subscription will be borne by the Government of Malaysia.
                        Submit the form below; an admin will review and approve your application.
                    </p>
                </div>

                {existing && statusBadge && (
                    <div className={`rounded-2xl px-5 py-4 flex items-center gap-3 ${statusBadge.color}`}>
                        {StatusIcon && <StatusIcon size={20} />}
                        <div>
                            <div className="font-bold text-sm">{statusBadge.label}</div>
                            <div className="text-xs opacity-80">
                                Submitted {new Date(existing.created_at).toLocaleDateString()}
                                {existing.reviewed_at && ` · Reviewed ${new Date(existing.reviewed_at).toLocaleDateString()}`}
                            </div>
                            {existing.notes && (
                                <div className="text-xs mt-1">Reviewer notes: {existing.notes}</div>
                            )}
                        </div>
                    </div>
                )}

                {flash?.success && (
                    <div className="rounded-2xl px-5 py-4 bg-emerald-50 text-emerald-700 text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-2xl px-5 py-4 bg-red-50 text-red-700 text-sm">
                        {flash.error}
                    </div>
                )}

                {(!existing || existing.status === 'rejected') && (
                    <form onSubmit={submit} className="bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-black text-gray-700 dark:text-gray-200 mb-1">
                                FULL NAME (as per IC, all caps)
                            </label>
                            <input
                                type="text"
                                value={data.full_name}
                                onChange={e => setData('full_name', e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm uppercase tracking-wide"
                                placeholder="AHMAD BIN ABDULLAH"
                            />
                            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-700 dark:text-gray-200 mb-1">IC NUMBER</label>
                            <input
                                type="text"
                                value={data.ic_number}
                                onChange={e => setData('ic_number', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                                placeholder="800101015555"
                            />
                            {errors.ic_number && <p className="text-xs text-red-500 mt-1">{errors.ic_number}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-700 dark:text-gray-200 mb-1">PHONE NUMBER</label>
                            <input
                                type="text"
                                value={data.phone_number}
                                onChange={e => setData('phone_number', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                            />
                            {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-700 dark:text-gray-200 mb-1">ADDRESS</label>
                            <textarea
                                rows={3}
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                            />
                            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full btn-gradient py-3 text-sm font-black disabled:opacity-50"
                        >
                            {processing ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
