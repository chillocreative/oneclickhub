import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Layers, Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function Categories({ categories }) {
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const createForm = useForm({ name: '', description: '' });
    const editForm = useForm({ name: '', description: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.categories.store'), {
            onSuccess: () => {
                setCreating(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('admin.categories.update', editing.id), {
            onSuccess: () => {
                setEditing(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.categories.destroy', id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const openEdit = (category) => {
        setEditing(category);
        editForm.setData({ name: category.name, description: category.description || '' });
    };

    const withServices = categories.filter(c => c.services_count > 0).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            Service <span className="text-[#FF6600]">Categories</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">Manage service categories for freelancers.</p>
                    </div>
                    <button
                        onClick={() => setCreating(true)}
                        className="btn-gradient px-6 py-3 text-xs font-black rounded-xl flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            }
        >
            <Head title="Categories" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <Layers size={20} className="text-[#FF6600]" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{categories.length}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Categories</div>
                </div>
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <Briefcase size={20} className="text-green-500" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{withServices}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">With Services</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5">
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Slug</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Services</th>
                            <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {categories.map(category => (
                            <tr key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{category.name}</td>
                                <td className="p-4 text-gray-400 text-xs">{category.slug}</td>
                                <td className="p-4 text-gray-500 text-xs max-w-[200px] truncate">{category.description || '-'}</td>
                                <td className="p-4">
                                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                                        {category.services_count}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => openEdit(category)} className="px-3 py-1 text-xs font-bold text-[#FF6600] bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                                        <Pencil size={12} className="inline mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleting(category)}
                                        disabled={category.services_count > 0}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg ${category.services_count > 0
                                            ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-white/5 cursor-not-allowed'
                                            : 'text-red-500 bg-red-50 dark:bg-red-500/10'
                                        }`}
                                    >
                                        <Trash2 size={12} className="inline mr-1" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">No categories found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">New Category</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Name</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={e => createForm.setData('name', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                                    placeholder="e.g. Catering"
                                />
                                {createForm.errors.name && <p className="text-xs text-red-500 mt-1">{createForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Description</label>
                                <textarea
                                    value={createForm.data.description}
                                    onChange={e => createForm.setData('description', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                    rows={3}
                                    placeholder="Optional description"
                                />
                                {createForm.errors.description && <p className="text-xs text-red-500 mt-1">{createForm.errors.description}</p>}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setCreating(false)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                                <button type="submit" disabled={createForm.processing} className="flex-1 btn-gradient py-3 text-xs font-black">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Edit Category</h3>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Name</label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={e => editForm.setData('name', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                                />
                                {editForm.errors.name && <p className="text-xs text-red-500 mt-1">{editForm.errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Description</label>
                                <textarea
                                    value={editForm.data.description}
                                    onChange={e => editForm.setData('description', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                    rows={3}
                                />
                                {editForm.errors.description && <p className="text-xs text-red-500 mt-1">{editForm.errors.description}</p>}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">Cancel</button>
                                <button type="submit" disabled={editForm.processing} className="flex-1 btn-gradient py-3 text-xs font-black">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleting(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-red-600 mb-3">Delete Category</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Delete <span className="font-black">{deleting.name}</span>? This cannot be undone.
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
