import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { UtensilsCrossed, Plus, Pencil, Trash2, Eye, EyeOff, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';

export default function HalalRestaurants({ restaurants }) {
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [createData, setCreateData] = useState({ name: '', address: '', phone_number: '', is_active: true, sort_order: 0 });
    const [editData, setEditData] = useState({ name: '', address: '', phone_number: '', is_active: true, sort_order: 0 });
    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    const handleCreate = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.halal-restaurants.store'), createData, {
            onSuccess: () => {
                setCreating(false);
                setCreateData({ name: '', address: '', phone_number: '', is_active: true, sort_order: 0 });
                setCreateErrors({});
            },
            onError: (errors) => setCreateErrors(errors),
            onFinish: () => setProcessing(false),
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('admin.halal-restaurants.update', editing.id), editData, {
            onSuccess: () => {
                setEditing(null);
                setEditData({ name: '', address: '', phone_number: '', is_active: true, sort_order: 0 });
                setEditErrors({});
            },
            onError: (errors) => setEditErrors(errors),
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.halal-restaurants.destroy', id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const openEdit = (r) => {
        setEditing(r);
        setEditData({ name: r.name, address: r.address, phone_number: r.phone_number, is_active: r.is_active, sort_order: r.sort_order });
        setEditErrors({});
    };

    const activeCount = restaurants.filter(r => r.is_active).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Halal <span className="text-[#FF6600]">Restaurants</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">Manage halal restaurant listings in Penang.</p>
                    </div>
                    <button
                        onClick={() => { setCreating(true); setCreateErrors({}); setCreateData({ name: '', address: '', phone_number: '', is_active: true, sort_order: 0 }); }}
                        className="btn-gradient px-6 py-3 text-xs font-black rounded-xl flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Restaurant
                    </button>
                </div>
            }
        >
            <Head title="Halal Restaurants" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <UtensilsCrossed size={20} className="text-[#FF6600]" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{restaurants.length}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Restaurants</div>
                </div>
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <Eye size={20} className="text-green-500" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{activeCount}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Listings</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5">
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Address</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Phone</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Order</th>
                            <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {restaurants.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{r.name}</td>
                                <td className="p-4 text-gray-500 text-xs max-w-[250px]">
                                    <div className="flex items-start gap-1">
                                        <MapPin size={12} className="text-gray-300 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{r.address}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500 text-xs">
                                    <div className="flex items-center gap-1">
                                        <Phone size={12} className="text-gray-300" />
                                        {r.phone_number}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${r.is_active
                                        ? 'bg-green-50 dark:bg-green-500/10 text-green-600'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                    }`}>
                                        {r.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                                        {r.sort_order}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => openEdit(r)} className="px-3 py-1 text-xs font-bold text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                                        <Pencil size={12} className="inline mr-1" /> Edit
                                    </button>
                                    <button onClick={() => setDeleting(r)} className="px-3 py-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg">
                                        <Trash2 size={12} className="inline mr-1" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {restaurants.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">No restaurants yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">New Restaurant</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Restaurant Name *</label>
                                <input type="text" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" placeholder="Restaurant name" />
                                {createErrors.name && <p className="text-xs text-red-500 mt-1">{createErrors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Address *</label>
                                <textarea value={createData.address} onChange={e => setCreateData({ ...createData, address: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3" rows={2} placeholder="Full address" />
                                {createErrors.address && <p className="text-xs text-red-500 mt-1">{createErrors.address}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Phone Number *</label>
                                <input type="text" value={createData.phone_number} onChange={e => setCreateData({ ...createData, phone_number: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" placeholder="012-3456789" />
                                {createErrors.phone_number && <p className="text-xs text-red-500 mt-1">{createErrors.phone_number}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Sort Order</label>
                                    <input type="number" value={createData.sort_order} onChange={e => setCreateData({ ...createData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" min="0" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Status</label>
                                    <button type="button" onClick={() => setCreateData({ ...createData, is_active: !createData.is_active })}
                                        className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors ${createData.is_active
                                            ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-200 dark:border-green-500/20'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/10'
                                        }`}>
                                        {createData.is_active ? <><Eye size={14} /> Active</> : <><EyeOff size={14} /> Inactive</>}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setCreating(false)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-1 btn-gradient py-3 text-xs font-black rounded-xl">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Edit Restaurant</h3>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Restaurant Name *</label>
                                <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" />
                                {editErrors.name && <p className="text-xs text-red-500 mt-1">{editErrors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Address *</label>
                                <textarea value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3" rows={2} />
                                {editErrors.address && <p className="text-xs text-red-500 mt-1">{editErrors.address}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Phone Number *</label>
                                <input type="text" value={editData.phone_number} onChange={e => setEditData({ ...editData, phone_number: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" />
                                {editErrors.phone_number && <p className="text-xs text-red-500 mt-1">{editErrors.phone_number}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Sort Order</label>
                                    <input type="number" value={editData.sort_order} onChange={e => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" min="0" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Status</label>
                                    <button type="button" onClick={() => setEditData({ ...editData, is_active: !editData.is_active })}
                                        className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors ${editData.is_active
                                            ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-200 dark:border-green-500/20'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/10'
                                        }`}>
                                        {editData.is_active ? <><Eye size={14} /> Active</> : <><EyeOff size={14} /> Inactive</>}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                                <button type="submit" disabled={processing} className="flex-1 btn-gradient py-3 text-xs font-black rounded-xl">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleting(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-red-600 mb-3">Delete Restaurant</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to delete "{deleting.name}"? This action cannot be undone.
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
