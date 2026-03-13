import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Layers, Plus, Pencil, Trash2, Briefcase, Image } from 'lucide-react';
import { useState, useRef } from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';
import UploadingOverlay from '@/Components/UploadingOverlay';

export default function Categories({ categories }) {
    const { t } = useLanguage();
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [createData, setCreateData] = useState({ name: '', description: '', image: null });
    const [editData, setEditData] = useState({ name: '', description: '', image: null });
    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [createPreview, setCreatePreview] = useState(null);
    const [editPreview, setEditPreview] = useState(null);

    const createFileRef = useRef(null);
    const editFileRef = useRef(null);

    const handleCreate = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', createData.name);
        formData.append('description', createData.description || '');
        if (createData.image) formData.append('image', createData.image);

        setProcessing(true);
        router.post(route('admin.categories.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setCreating(false);
                setCreateData({ name: '', description: '', image: null });
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
        formData.append('name', editData.name);
        formData.append('description', editData.description || '');
        if (editData.image) formData.append('image', editData.image);

        setProcessing(true);
        router.post(route('admin.categories.update', editing.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setEditing(null);
                setEditData({ name: '', description: '', image: null });
                setEditPreview(null);
                setEditErrors({});
            },
            onError: (errors) => setEditErrors(errors),
            onFinish: () => setProcessing(false),
        });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.categories.destroy', id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const openEdit = (category) => {
        setEditing(category);
        setEditData({ name: category.name, description: category.description || '', image: null });
        setEditPreview(category.image_url);
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

    const withServices = categories.filter(c => c.services_count > 0).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                            {t('admin.categoriesTitle')} <span className="text-[#FF6600]">{t('admin.categoriesHighlight')}</span>
                        </h2>
                        <p className="text-gray-400 text-sm font-semibold">Manage service categories for freelancers.</p>
                    </div>
                    <button
                        onClick={() => { setCreating(true); setCreateErrors({}); setCreatePreview(null); setCreateData({ name: '', description: '', image: null }); }}
                        className="btn-gradient px-6 py-3 text-xs font-black rounded-xl flex items-center gap-2"
                    >
                        <Plus size={16} /> {t('admin.addCategory')}
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
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('admin.totalCategories')}</div>
                </div>
                <div className="bg-white dark:bg-[#0c0c0c] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                    <Briefcase size={20} className="text-green-500" />
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">{withServices}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('admin.activeCategories')}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5">
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Image</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">{t('admin.name')}</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">{t('admin.slug')}</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="text-left p-4 text-xs font-black text-gray-400 uppercase tracking-wider">{t('admin.servicesCount')}</th>
                            <th className="text-right p-4 text-xs font-black text-gray-400 uppercase tracking-wider">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {categories.map(category => (
                            <tr key={category.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                <td className="p-4">
                                    {category.image_url ? (
                                        <img src={category.image_url} alt={category.name} className="w-12 h-12 object-cover rounded-xl" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center">
                                            <Layers size={16} className="text-gray-300" />
                                        </div>
                                    )}
                                </td>
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
                                        <Pencil size={12} className="inline mr-1" /> {t('common.edit')}
                                    </button>
                                    <button
                                        onClick={() => setDeleting(category)}
                                        disabled={category.services_count > 0}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg ${category.services_count > 0
                                            ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-white/5 cursor-not-allowed'
                                            : 'text-red-500 bg-red-50 dark:bg-red-500/10'
                                        }`}
                                    >
                                        <Trash2 size={12} className="inline mr-1" /> {t('common.delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">{t('admin.noCategories')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">{t('admin.newCategory')}</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Image</label>
                                <input type="file" ref={createFileRef} accept="image/*" onChange={e => handleFileChange(e, 'create')} className="hidden" />
                                <button type="button" onClick={() => createFileRef.current.click()}
                                    className="w-full h-24 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center hover:border-[#FF6600] transition-colors overflow-hidden">
                                    {createPreview ? (
                                        <img src={createPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Image size={20} className="mx-auto mb-1" />
                                            <span className="text-xs">Click to upload</span>
                                        </div>
                                    )}
                                </button>
                                {createErrors.image && <p className="text-xs text-red-500 mt-1">{createErrors.image}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">{t('admin.name')}</label>
                                <input
                                    type="text"
                                    value={createData.name}
                                    onChange={e => setCreateData({ ...createData, name: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                                    placeholder={t('admin.namePlaceholder')}
                                />
                                {createErrors.name && <p className="text-xs text-red-500 mt-1">{createErrors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Description</label>
                                <textarea
                                    value={createData.description}
                                    onChange={e => setCreateData({ ...createData, description: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                    rows={3}
                                    placeholder="Optional description"
                                />
                                {createErrors.description && <p className="text-xs text-red-500 mt-1">{createErrors.description}</p>}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setCreating(false)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">{t('common.cancel')}</button>
                                <button type="submit" disabled={processing} className="flex-1 btn-gradient py-3 text-xs font-black">{t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">{t('admin.editCategory')}</h3>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Image</label>
                                <input type="file" ref={editFileRef} accept="image/*" onChange={e => handleFileChange(e, 'edit')} className="hidden" />
                                <button type="button" onClick={() => editFileRef.current.click()}
                                    className="w-full h-24 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center hover:border-[#FF6600] transition-colors overflow-hidden">
                                    {editPreview ? (
                                        <img src={editPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <Image size={20} className="mx-auto mb-1" />
                                            <span className="text-xs">Click to upload</span>
                                        </div>
                                    )}
                                </button>
                                {editErrors.image && <p className="text-xs text-red-500 mt-1">{editErrors.image}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">{t('admin.name')}</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm px-4 py-3"
                                />
                                {editErrors.name && <p className="text-xs text-red-500 mt-1">{editErrors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-2 block">Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full rounded-xl border-gray-200 dark:border-white/10 dark:bg-white/5 text-sm p-3"
                                    rows={3}
                                />
                                {editErrors.description && <p className="text-xs text-red-500 mt-1">{editErrors.description}</p>}
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">{t('common.cancel')}</button>
                                <button type="submit" disabled={processing} className="flex-1 btn-gradient py-3 text-xs font-black">{t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleting(null)}>
                    <div className="bg-white dark:bg-[#111] rounded-[2rem] p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-red-600 mb-3">{t('admin.deleteCategory')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {t('admin.deleteConfirm')}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleting(null)} className="flex-1 py-3 text-xs font-black text-gray-500 bg-gray-100 dark:bg-white/5 rounded-xl">{t('common.cancel')}</button>
                            <button onClick={() => handleDelete(deleting.id)} className="flex-1 py-3 text-xs font-black text-white bg-red-500 rounded-xl hover:bg-red-600">{t('common.delete')}</button>
                        </div>
                    </div>
                </div>
            )}

            <UploadingOverlay show={processing} />
        </AuthenticatedLayout>
    );
}
