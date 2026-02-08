import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useLanguage } from '@/Contexts/LanguageContext';

export default function CreateService({ categories, service }) {
    const { t } = useLanguage();
    const isEditing = Boolean(service);

    const { data, setData, post, processing, errors } = useForm({
        title: service?.title || '',
        description: service?.description || '',
        service_category_id: service?.service_category_id || '',
        price_from: service?.price_from || '',
        price_to: service?.price_to || '',
        delivery_days: service?.delivery_days || '',
        tags: service?.tags?.join(', ') || '',
        images: [],
    });

    const [previews, setPreviews] = useState(
        service?.images?.map((img) => `/storage/${img}`) || []
    );

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setData('images', files);
        setPreviews(files.map((file) => URL.createObjectURL(file)));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            router.post(route('my-services.update', service.id), {
                ...data,
                _method: 'PATCH',
            }, { forceFormData: true });
        } else {
            post(route('my-services.store'), { forceFormData: true });
        }
    };

    const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600] outline-none transition-all";

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {isEditing ? t('services.editTitle') : t('services.createTitle')} <span className="text-[#FF6600]">{t('services.serviceHighlight')}</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">
                        {isEditing ? t('services.editSubtitle') : t('services.createSubtitle')}
                    </p>
                </div>
            }
        >
            <Head title={isEditing ? 'Edit Service' : 'Create Service'} />

            <form onSubmit={handleSubmit} className="max-w-3xl">
                <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.serviceTitle')}</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className={inputClass}
                            placeholder={t('services.serviceTitlePlaceholder')}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.category')}</label>
                        <select
                            value={data.service_category_id}
                            onChange={(e) => setData('service_category_id', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">{t('services.selectCategory')}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.service_category_id && <p className="text-red-500 text-xs mt-1">{errors.service_category_id}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.description')}</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={`${inputClass} min-h-[150px] resize-y`}
                            placeholder={t('services.descriptionPlaceholder')}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.priceFrom')}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.price_from}
                                onChange={(e) => setData('price_from', e.target.value)}
                                className={inputClass}
                                placeholder="50.00"
                            />
                            {errors.price_from && <p className="text-red-500 text-xs mt-1">{errors.price_from}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.priceTo')}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.price_to}
                                onChange={(e) => setData('price_to', e.target.value)}
                                className={inputClass}
                                placeholder="200.00"
                            />
                            {errors.price_to && <p className="text-red-500 text-xs mt-1">{errors.price_to}</p>}
                        </div>
                    </div>

                    {/* Delivery & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.deliveryDays')}</label>
                            <input
                                type="number"
                                value={data.delivery_days}
                                onChange={(e) => setData('delivery_days', e.target.value)}
                                className={inputClass}
                                placeholder="7"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.tags')}</label>
                            <input
                                type="text"
                                value={data.tags}
                                onChange={(e) => setData('tags', e.target.value)}
                                className={inputClass}
                                placeholder={t('services.tagsPlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{t('services.images')}</label>
                        <div className="flex flex-wrap gap-4">
                            {previews.map((src, idx) => (
                                <div key={idx} className="relative size-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <label className="size-24 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:border-[#FF6600] transition-colors">
                                <ImagePlus size={24} className="text-gray-400" />
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-gradient px-8 py-3 text-sm font-bold disabled:opacity-50"
                        >
                            {processing ? t('common.saving') : (isEditing ? t('services.updateService') : t('services.createService'))}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-8 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
