import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Megaphone, Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff, Image } from 'lucide-react';
import UploadingOverlay from '@/Components/UploadingOverlay';
import { useState, useRef } from 'react';

export default function Advertisements({ advertisements }) {
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [createData, setCreateData] = useState({ title: '', description: '', link: '', is_active: true, sort_order: 0, image: null });
    const [editData, setEditData] = useState({ title: '', description: '', link: '', is_active: true, sort_order: 0, image: null });
    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [createPreview, setCreatePreview] = useState(null);
    const [editPreview, setEditPreview] = useState(null);

    const createFileRef = useRef(null);
    const editFileRef = useRef(null);

    const handleCreate = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', createData.title);
        formData.append('description', createData.description || '');
        formData.append('link', createData.link || '');
        formData.append('is_active', createData.is_active ? '1' : '0');
        formData.append('sort_order', createData.sort_order);
        if (createData.image) formData.append('image', createData.image);

        setProcessing(true);
        router.post(route('admin.advertisements.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setCreating(false);
                setCreateData({ title: '', description: '', link: '', is_active: true, sort_order: 0, image: null });
                setCreatePreview(null);
                setCreateErrors({});
            },
            onError: (errors) => setCreateErrors(errors),
            onFinish: () => setProcessing(false),
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', editData.title);
        formData.append('description', editData.description || '');
        formData.append('link', editData.link || '');
        formData.append('is_active', editData.is_active ? '1' : '0');
        formData.append('sort_order', editData.sort_order);
        if (editData.image) formData.append('image', editData.image);

        setProcessing(true);
        router.post(route('admin.advertisements.update', editing.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setEditing(null);
                setEditData({ title: '', description: '', link: '', is_active: true, sort_order: 0, image: null });
                setEditPreview(null);
                setEditErrors({});
            },
            onError: (errors) => setEditErrors(errors),
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.advertisements.destroy', id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const openEdit = (ad) => {
        setEditing(ad);
        setEditData({ title: ad.title, description: ad.description || '', link: ad.link || '', is_active: ad.is_active, sort_order: ad.sort_order, image: null });
        setEditPreview(ad.image_url);
        setEditErrors({});
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        if (type === 'create') {
            setCreateData({ ...createData, image: file });
            setCreatePreview(URL.createObjectURL(file));
        } else {
            setEditData({ ...editData, image: file });
            setEditPreview(URL.createObjectURL(file));
        }
    };

    const activeCount = advertisements.filter(a => a.is_active).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Advertisement <span className="text-[#FF6600]">Manager</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">Manage promotional banners for the mobile app.</p>
                    </div>
                    <button
                        onClick={() => { setCreating(true); setCreateErrors({}); setCreatePreview(null); setCreateData({ title: '', description: '', link: '', is_active: true, sort_order: 0, image: null }); }}
                        className="btn-gradient px-6 py-3 text-xs font-black rounded-xl flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Advertisement
                    </button>
                </div>
            }
        >
            <Head title="Advertisements" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <Megaphone size={20} className="text-[#FF6600]" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{advertisements.length}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Ads</div>
                </div>
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <Eye size={20} className="text-green-500" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{activeCount}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Ads</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5">
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Image</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Link</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Order</th>
                            <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {advertisements.map(ad => (
                            <tr key={ad.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                <td className="p-4">
                                    {ad.image_url ? (
                                        <img src={ad.image_url} alt={ad.title} className="w-20 h-12 object-cover rounded-lg" />
                                    ) : (
                                        <div className="w-20 h-12 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center">
                                            <Image size={16} className="text-gray-300" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{ad.title}</td>
                                <td className="p-4 text-gray-400 text-xs max-w-[200px] truncate">
                                    {ad.link ? (
                                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#FF6600] hover:underline">
                                            <ExternalLink size={10} /> {ad.link}
                                        </a>
                                    ) : '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${ad.is_active
                                        ? 'bg-green-50 dark:bg-green-500/10 text-green-600'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                    }`}>
                                        {ad.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                                        {ad.sort_order}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => openEdit(ad)} className="px-3 py-1 text-xs font-bold text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                                        <Pencil size={12} className="inline mr-1" /> Edit
                                    </button>
                                    <button onClick={() => setDeleting(ad)} className="px-3 py-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg">
                                        <Trash2 size={12} className="inline mr-1" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {advertisements.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">No advertisements yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">New Advertisement</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Image *</label>
                                <input type="file" ref={createFileRef} accept="image/*" onChange={e => handleFileChange(e, 'create')} className="hidden" />
                                <button type="button" onClick={() => createFileRef.current.click()}
                                    className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center hover:border-[#FF6600] transition-colors overflow-hidden">
                                    {createPreview ? (
                                        <img src={createPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Image size={24} className="mx-auto mb-1" />
                                            <span className="text-xs">Click to upload</span>
                                        </div>
                                    )}
                                </button>
                                {createErrors.image && <p className="text-xs text-red-500 mt-1">{createErrors.image}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Title *</label>
                                <input type="text" value={createData.title} onChange={e => setCreateData({ ...createData, title: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" placeholder="Ad title" />
                                {createErrors.title && <p className="text-xs text-red-500 mt-1">{createErrors.title}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Description</label>
                                <textarea value={createData.description} onChange={e => setCreateData({ ...createData, description: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3" rows={2} placeholder="Optional description" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Link</label>
                                <input type="text" value={createData.link} onChange={e => setCreateData({ ...createData, link: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" placeholder="https://..." />
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
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Edit Advertisement</h3>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Image</label>
                                <input type="file" ref={editFileRef} accept="image/*" onChange={e => handleFileChange(e, 'edit')} className="hidden" />
                                <button type="button" onClick={() => editFileRef.current.click()}
                                    className="w-full h-32 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center hover:border-[#FF6600] transition-colors overflow-hidden">
                                    {editPreview ? (
                                        <img src={editPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Image size={24} className="mx-auto mb-1" />
                                            <span className="text-xs">Click to upload</span>
                                        </div>
                                    )}
                                </button>
                                {editErrors.image && <p className="text-xs text-red-500 mt-1">{editErrors.image}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Title *</label>
                                <input type="text" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" />
                                {editErrors.title && <p className="text-xs text-red-500 mt-1">{editErrors.title}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Description</label>
                                <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3" rows={2} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Link</label>
                                <input type="text" value={editData.link} onChange={e => setEditData({ ...editData, link: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3" placeholder="https://..." />
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
                        <h3 className="text-lg font-black text-red-600 mb-3">Delete Advertisement</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to delete "{deleting.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleting(null)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                            <button onClick={() => handleDelete(deleting.id)} className="flex-1 py-3 text-xs font-black text-white bg-red-500 rounded-xl hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <UploadingOverlay show={processing} />
        </AuthenticatedLayout>
    );
}
