import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';

const STATUS_COLOR = {
    pending: 'bg-yellow-50 text-yellow-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
};

export default function MadaniApplicationsIndex({ applications, filters, stats }) {
    const [rejecting, setRejecting] = useState(null); // application id
    const [rejectNotes, setRejectNotes] = useState('');

    const approve = (app) => {
        if (!confirm(`Approve Madani application from ${app.full_name}? This grants a 12-month sponsored subscription.`)) return;
        router.post(route('admin.madani.approve', app.id));
    };

    const submitReject = (app) => {
        router.post(route('admin.madani.reject', app.id), { notes: rejectNotes }, {
            onSuccess: () => {
                setRejecting(null);
                setRejectNotes('');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        Madani <span className="text-[#FF6600]">Applications</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Review and approve sponsored subscription applications</p>
                </div>
            }
        >
            <Head title="Madani Applications" />

            <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard label="Pending" value={stats.pending} color="bg-yellow-50 text-yellow-700" />
                <StatCard label="Approved" value={stats.approved} color="bg-emerald-50 text-emerald-700" />
                <StatCard label="Rejected" value={stats.rejected} color="bg-red-50 text-red-700" />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {[null, 'pending', 'approved', 'rejected'].map(status => (
                    <button
                        key={status ?? 'all'}
                        onClick={() => router.get(route('admin.madani.index'), status ? { status } : {}, { preserveState: true })}
                        className={`px-4 py-2 rounded-xl text-xs font-black ${
                            (filters.status || null) === status
                                ? 'bg-[#FF6600] text-white'
                                : 'bg-white dark:bg-white/5 text-gray-500 border border-gray-100 dark:border-white/5'
                        }`}
                    >
                        {status ?? 'All'}
                    </button>
                ))}
            </div>

            {applications.data.length === 0 ? (
                <div className="bg-white dark:bg-[#0c0c0c] p-12 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 text-center">
                    <Clock size={40} className="text-[#FF6600] mx-auto mb-4" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">No applications</h3>
                </div>
            ) : (
                <div className="space-y-3">
                    {applications.data.map(app => (
                        <div key={app.id} className="bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${STATUS_COLOR[app.status]}`}>
                                            {app.status}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Submitted {new Date(app.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-wide">{app.full_name}</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                        <div><span className="text-gray-400">IC:</span> <span className="font-bold">{app.ic_number}</span></div>
                                        <div><span className="text-gray-400">Phone:</span> <span className="font-bold">{app.phone_number}</span></div>
                                        <div className="col-span-2"><span className="text-gray-400">Address:</span> <span className="font-medium">{app.address}</span></div>
                                        <div className="col-span-2"><span className="text-gray-400">User:</span> <span className="font-medium">{app.user?.name} (#{app.user?.id})</span></div>
                                        {app.reviewer && (
                                            <div className="col-span-2 text-xs text-gray-500">
                                                Reviewed by {app.reviewer.name} on {new Date(app.reviewed_at).toLocaleString()}
                                            </div>
                                        )}
                                        {app.notes && (
                                            <div className="col-span-2 text-xs italic text-gray-500">
                                                Notes: {app.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {app.status === 'pending' && (
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button
                                            onClick={() => approve(app)}
                                            className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 flex items-center gap-1"
                                        >
                                            <Check size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => setRejecting(rejecting === app.id ? null : app.id)}
                                            className="px-4 py-2 rounded-xl text-xs font-black bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1"
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>

                            {rejecting === app.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <textarea
                                        value={rejectNotes}
                                        onChange={e => setRejectNotes(e.target.value)}
                                        placeholder="Reason for rejection (optional, sent to applicant via WhatsApp)"
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => submitReject(app)}
                                            className="px-4 py-2 rounded-xl text-xs font-black bg-red-500 text-white hover:bg-red-600"
                                        >
                                            Confirm Reject
                                        </button>
                                        <button
                                            onClick={() => { setRejecting(null); setRejectNotes(''); }}
                                            className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100 text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className={`rounded-2xl p-4 ${color}`}>
            <div className="text-xs font-black uppercase opacity-70">{label}</div>
            <div className="text-2xl font-black mt-1">{value}</div>
        </div>
    );
}
