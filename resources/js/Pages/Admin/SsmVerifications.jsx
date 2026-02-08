import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { FileCheck, Check, X, Eye, Trash2, Search, ShieldCheck, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
    pending: 'bg-yellow-50 text-yellow-600',
    verified: 'bg-green-50 text-green-600',
    failed: 'bg-red-50 text-red-600',
    expired: 'bg-gray-100 text-gray-500',
};

export default function SsmVerifications({ verifications, filters = {}, stats = {} }) {
    const [viewing, setViewing] = useState(null);
    const [verifying, setVerifying] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const form = useForm({ status: 'verified', admin_notes: '' });

    const handleVerify = (e) => {
        e.preventDefault();
        form.post(route('admin.ssm.verify', verifying.id), {
            onSuccess: () => {
                setVerifying(null);
                form.reset();
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.ssm.index'), { ...filters, search }, { preserveState: true });
    };

    const filterByStatus = (status) => {
        router.get(route('admin.ssm.index'), { ...filters, status, search: filters.search }, { preserveState: true });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.ssm.destroy', id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const statCards = [
        { label: 'Total', value: stats.total || 0, icon: FileCheck, color: 'text-[#FF6600]', status: null },
        { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'text-yellow-500', status: 'pending' },
        { label: 'Verified', value: stats.verified || 0, icon: ShieldCheck, color: 'text-green-500', status: 'verified' },
        { label: 'Failed', value: stats.failed || 0, icon: XCircle, color: 'text-red-500', status: 'failed' },
        { label: 'Expired', value: stats.expired || 0, icon: AlertTriangle, color: 'text-gray-500', status: 'expired' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        SSM <span className="text-[#FF6600]">Verifications</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">Review freelancer business certificates.</p>
                </div>
            }
        >
            <Head title="SSM Verifications" />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {statCards.map(s => (
                    <div
                        key={s.label}
                        onClick={() => filterByStatus(s.status)}
                        className={`bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:shadow-md transition-all ${filters.status === s.status ? 'ring-2 ring-[#FF6600]' : ''}`}
                    >
                        <s.icon size={20} className={s.color} />
                        <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{s.value}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-6 flex gap-3 items-center">
                <form onSubmit={handleSearch} className="flex gap-3 flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by freelancer name, company, or registration..."
                        className="flex-1 rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                    />
                    <button type="submit" className="btn-gradient px-6 py-3 text-xs font-black">Search</button>
                </form>
                {(filters.status || filters.search) && (
                    <Link href={route('admin.ssm.index')} className="px-4 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200">
                        Clear
                    </Link>
                )}
            </div>

            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5">
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Freelancer</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Company</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Reg. No.</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Grace Period</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {verifications.data.map(v => (
                            <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{v.user?.name}</td>
                                <td className="p-4 text-gray-500">{v.company_name || '-'}</td>
                                <td className="p-4 text-gray-500 text-xs">{v.registration_number || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${statusColors[v.status]}`}>
                                        {v.status}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-gray-400">
                                    {v.grace_period_ends_at ? (
                                        <span className={new Date(v.grace_period_ends_at) < new Date() ? 'text-red-500 font-bold' : 'text-yellow-500 font-bold'}>
                                            {new Date(v.grace_period_ends_at) < new Date() ? 'Expired' : new Date(v.grace_period_ends_at).toLocaleDateString()}
                                        </span>
                                    ) : '-'}
                                    {v.services_hidden_at && <span className="block text-red-400 text-[10px] font-bold">Services Hidden</span>}
                                </td>
                                <td className="p-4 text-gray-400 text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => setViewing(v)} className="px-3 py-1 text-xs font-bold text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                                        <Eye size={12} className="inline mr-1" /> View
                                    </button>
                                    {v.status !== 'verified' && (
                                        <button onClick={() => { setVerifying(v); form.setData({ status: 'verified', admin_notes: '' }); }} className="px-3 py-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg">
                                            <Check size={12} className="inline mr-1" /> Verify
                                        </button>
                                    )}
                                    <button onClick={() => setDeleting(v)} className="px-3 py-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg">
                                        <Trash2 size={12} className="inline mr-1" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {verifications.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-400 text-sm">No verifications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {verifications.links && verifications.links.length > 3 && (
                    <div className="p-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-400">
                            Showing {verifications.from}-{verifications.to} of {verifications.total}
                        </p>
                        <div className="flex gap-1">
                            {verifications.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1 rounded-lg text-xs font-black ${link.active ? 'bg-[#FF6600] text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="px-3 py-1 text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">SSM Document</h3>

                        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 space-y-2 mb-4">
                            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2 text-sm">
                                <span className="text-gray-400 font-bold">Company Name:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{viewing.company_name || '-'}</span>

                                <span className="text-gray-400 font-bold">Registration Number:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{viewing.registration_number || '-'}</span>

                                <span className="text-gray-400 font-bold">Expiry Date:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{viewing.expiry_date || '-'}</span>

                                <span className="text-gray-400 font-bold">Status:</span>
                                <span>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${statusColors[viewing.status]}`}>
                                        {viewing.status}
                                    </span>
                                </span>

                                {viewing.grace_period_ends_at && (
                                    <>
                                        <span className="text-gray-400 font-bold">Grace Period Ends:</span>
                                        <span className="font-bold text-yellow-600">{new Date(viewing.grace_period_ends_at).toLocaleDateString()}</span>
                                    </>
                                )}

                                {viewing.services_hidden_at && (
                                    <>
                                        <span className="text-gray-400 font-bold">Services Hidden:</span>
                                        <span className="font-bold text-red-500">{new Date(viewing.services_hidden_at).toLocaleDateString()}</span>
                                    </>
                                )}

                                {viewing.admin_notes && (
                                    <>
                                        <span className="text-gray-400 font-bold">Admin Notes:</span>
                                        <span className="text-gray-600 dark:text-gray-300">{viewing.admin_notes}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {viewing.document_path && (
                            <a
                                href={`/storage/${viewing.document_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all mb-4"
                            >
                                <Eye size={14} /> View SSM
                            </a>
                        )}

                        {viewing.ai_response && (
                            <details className="mt-2">
                                <summary className="text-xs font-bold text-gray-400 cursor-pointer hover:text-gray-600">AI Raw Response</summary>
                                <pre className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 whitespace-pre-wrap">{viewing.ai_response}</pre>
                            </details>
                        )}

                        <button onClick={() => setViewing(null)} className="mt-4 w-full py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Close</button>
                    </div>
                </div>
            )}

            {/* Verify Modal */}
            {verifying && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setVerifying(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Manual Verification</h3>
                        <p className="text-xs text-gray-400 mb-4">Freelancer: <span className="font-bold text-gray-600">{verifying.user?.name}</span></p>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Status</label>
                                <select
                                    value={form.data.status}
                                    onChange={e => form.setData('status', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm"
                                >
                                    <option value="verified">Verified</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <textarea
                                value={form.data.admin_notes}
                                onChange={e => form.setData('admin_notes', e.target.value)}
                                placeholder="Admin notes (optional)"
                                className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                rows={3}
                            />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setVerifying(null)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                                <button type="submit" disabled={form.processing} className="flex-1 btn-gradient py-3 text-xs font-black">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleting(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-red-600 mb-3">Delete Verification</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Delete SSM verification for <span className="font-black">{deleting.user?.name}</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleting(null)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                            <button onClick={() => handleDelete(deleting.id)} className="flex-1 py-3 text-xs font-black text-white bg-red-500 rounded-xl hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
