import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Search,
    Image as ImageIcon,
    Globe,
    Building2,
    ShieldCheck,
    BarChart3,
    Upload,
} from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

const TEXT_FIELDS = [
    'site_name', 'title_template', 'default_title', 'default_keywords',
    'canonical_host', 'twitter_handle',
    'organization_legal_name', 'organization_phone', 'organization_email',
    'social_facebook', 'social_twitter', 'social_instagram',
    'social_linkedin', 'social_youtube', 'social_tiktok',
    'verification_google', 'verification_bing', 'verification_yandex',
    'verification_facebook', 'ga4_measurement_id', 'gtm_container_id',
    'facebook_pixel_id',
];

function Card({ icon: Icon, title, description, children }) {
    return (
        <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-start gap-4 mb-5">
                <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#FF6600]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-gray-900 dark:text-white">{title}</h3>
                    {description && (
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function Field({ label, hint, error, children }) {
    return (
        <div>
            <InputLabel value={label} />
            <div className="mt-1">{children}</div>
            {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

function ImageUploader({ label, hint, currentUrl, file, onChange, error }) {
    return (
        <Field label={label} hint={hint} error={error}>
            <div className="flex items-center gap-4">
                <div className="size-20 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {file ? (
                        <img src={URL.createObjectURL(file)} alt="" className="size-full object-cover" />
                    ) : currentUrl ? (
                        <img src={currentUrl} alt="" className="size-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-gray-400" />
                    )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-black text-gray-700 dark:text-gray-300 transition-colors">
                    <Upload size={14} />
                    {file ? file.name : currentUrl ? 'Replace image' : 'Upload image'}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onChange(e.target.files?.[0] || null)}
                    />
                </label>
                {(file || currentUrl) && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="text-[11px] text-gray-400 hover:text-red-500"
                    >
                        Clear pending
                    </button>
                )}
            </div>
        </Field>
    );
}

export default function SeoSettings({ settings, previews }) {
    const initial = TEXT_FIELDS.reduce((acc, f) => {
        acc[f] = settings?.[f] ?? '';
        return acc;
    }, {});

    const { data, setData, post, processing, errors } = useForm({
        ...initial,
        default_description: settings?.default_description ?? '',
        allow_indexing: !!settings?.allow_indexing,
        default_og_image: null,
        organization_logo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.seo.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('default_og_image', null);
                setData('organization_logo', null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        SEO <span className="text-[#FF6600]">Settings</span>
                    </h2>
                    <p className="text-gray-400 text-sm font-semibold">
                        Control how OneClickHub appears in search engines and social previews.
                    </p>
                </div>
            }
        >
            <Head title="SEO Settings" />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Card
                    icon={Search}
                    title="Identity & default meta"
                    description="Used as fallbacks when a page doesn't supply its own title or description."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Site name" error={errors.site_name}>
                            <TextInput
                                className="w-full"
                                value={data.site_name}
                                onChange={(e) => setData('site_name', e.target.value)}
                                placeholder="OneClickHub"
                            />
                        </Field>
                        <Field
                            label="Title template"
                            hint="Use :page as the placeholder for the per-page title."
                            error={errors.title_template}
                        >
                            <TextInput
                                className="w-full"
                                value={data.title_template}
                                onChange={(e) => setData('title_template', e.target.value)}
                                placeholder=":page | OneClickHub"
                            />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Default title" error={errors.default_title}>
                                <TextInput
                                    className="w-full"
                                    value={data.default_title}
                                    onChange={(e) => setData('default_title', e.target.value)}
                                />
                            </Field>
                        </div>
                        <div className="md:col-span-2">
                            <Field
                                label="Default meta description"
                                hint="Aim for 150–160 characters."
                                error={errors.default_description}
                            >
                                <textarea
                                    rows={3}
                                    maxLength={320}
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FF6600] focus:ring-[#FF6600] dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300 text-sm"
                                    value={data.default_description}
                                    onChange={(e) => setData('default_description', e.target.value)}
                                />
                            </Field>
                        </div>
                        <div className="md:col-span-2">
                            <Field
                                label="Default keywords"
                                hint="Comma-separated. Optional — most search engines ignore this."
                                error={errors.default_keywords}
                            >
                                <TextInput
                                    className="w-full"
                                    value={data.default_keywords}
                                    onChange={(e) => setData('default_keywords', e.target.value)}
                                    placeholder="freelancers, services, malaysia"
                                />
                            </Field>
                        </div>
                    </div>
                </Card>

                <Card
                    icon={ImageIcon}
                    title="Default Open Graph image"
                    description="Shown when someone shares any page with no page-specific image. Recommended 1200×630."
                >
                    <ImageUploader
                        label="Image"
                        hint="JPEG / PNG / WEBP, max 5 MB."
                        currentUrl={previews?.default_og_image}
                        file={data.default_og_image}
                        onChange={(f) => setData('default_og_image', f)}
                        error={errors.default_og_image}
                    />
                </Card>

                <Card
                    icon={Globe}
                    title="Canonical URL & indexing"
                    description="Tell search engines the preferred host for your site, and gate indexing on/off."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Field
                                label="Canonical host"
                                hint="The URL crawlers should treat as authoritative, e.g. https://oneclickhub.com.my"
                                error={errors.canonical_host}
                            >
                                <TextInput
                                    className="w-full"
                                    value={data.canonical_host}
                                    onChange={(e) => setData('canonical_host', e.target.value)}
                                    placeholder="https://oneclickhub.com.my"
                                />
                            </Field>
                        </div>
                        <Field label="Twitter / X handle" hint="Include the @." error={errors.twitter_handle}>
                            <TextInput
                                className="w-full"
                                value={data.twitter_handle}
                                onChange={(e) => setData('twitter_handle', e.target.value)}
                                placeholder="@oneclickhub"
                            />
                        </Field>
                        <div className="flex items-center gap-3 md:pt-7">
                            <label className="inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={data.allow_indexing}
                                    onChange={(e) => setData('allow_indexing', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-7 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative peer-checked:bg-[#FF6600]"></div>
                            </label>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">Allow search indexing</p>
                                <p className="text-[11px] text-gray-400">Off = robots.txt blocks all + every page emits noindex.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card
                    icon={Building2}
                    title="Organization (for JSON-LD)"
                    description="Powers the structured-data block crawlers read for rich results and the knowledge panel."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <ImageUploader
                                label="Organization logo"
                                hint="Square or near-square. Used in JSON-LD Organization."
                                currentUrl={previews?.organization_logo}
                                file={data.organization_logo}
                                onChange={(f) => setData('organization_logo', f)}
                                error={errors.organization_logo}
                            />
                        </div>
                        <Field label="Legal name" error={errors.organization_legal_name}>
                            <TextInput
                                className="w-full"
                                value={data.organization_legal_name}
                                onChange={(e) => setData('organization_legal_name', e.target.value)}
                                placeholder="Chillo Creative Sdn Bhd"
                            />
                        </Field>
                        <Field label="Contact phone" error={errors.organization_phone}>
                            <TextInput
                                className="w-full"
                                value={data.organization_phone}
                                onChange={(e) => setData('organization_phone', e.target.value)}
                                placeholder="+60 12-345 6789"
                            />
                        </Field>
                        <Field label="Contact email" error={errors.organization_email}>
                            <TextInput
                                type="email"
                                className="w-full"
                                value={data.organization_email}
                                onChange={(e) => setData('organization_email', e.target.value)}
                                placeholder="hello@oneclickhub.com.my"
                            />
                        </Field>
                        <div />
                        {[
                            ['social_facebook',  'Facebook URL'],
                            ['social_twitter',   'Twitter / X URL'],
                            ['social_instagram', 'Instagram URL'],
                            ['social_linkedin',  'LinkedIn URL'],
                            ['social_youtube',   'YouTube URL'],
                            ['social_tiktok',    'TikTok URL'],
                        ].map(([field, label]) => (
                            <Field key={field} label={label} error={errors[field]}>
                                <TextInput
                                    type="url"
                                    className="w-full"
                                    value={data[field]}
                                    onChange={(e) => setData(field, e.target.value)}
                                    placeholder="https://"
                                />
                            </Field>
                        ))}
                    </div>
                </Card>

                <Card
                    icon={ShieldCheck}
                    title="Search engine verification"
                    description="Paste only the verification token (the content value), not the full meta tag."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Google Search Console" error={errors.verification_google}>
                            <TextInput
                                className="w-full"
                                value={data.verification_google}
                                onChange={(e) => setData('verification_google', e.target.value)}
                                placeholder="abc123…"
                            />
                        </Field>
                        <Field label="Bing Webmaster Tools" error={errors.verification_bing}>
                            <TextInput
                                className="w-full"
                                value={data.verification_bing}
                                onChange={(e) => setData('verification_bing', e.target.value)}
                            />
                        </Field>
                        <Field label="Yandex" error={errors.verification_yandex}>
                            <TextInput
                                className="w-full"
                                value={data.verification_yandex}
                                onChange={(e) => setData('verification_yandex', e.target.value)}
                            />
                        </Field>
                        <Field label="Facebook Domain" error={errors.verification_facebook}>
                            <TextInput
                                className="w-full"
                                value={data.verification_facebook}
                                onChange={(e) => setData('verification_facebook', e.target.value)}
                            />
                        </Field>
                    </div>
                </Card>

                <Card
                    icon={BarChart3}
                    title="Analytics & tracking"
                    description="Snippets are injected on every public page only when an ID is set."
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Google Analytics 4" hint="Format: G-XXXXXXXXXX" error={errors.ga4_measurement_id}>
                            <TextInput
                                className="w-full"
                                value={data.ga4_measurement_id}
                                onChange={(e) => setData('ga4_measurement_id', e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                            />
                        </Field>
                        <Field label="Google Tag Manager" hint="Format: GTM-XXXXXXX" error={errors.gtm_container_id}>
                            <TextInput
                                className="w-full"
                                value={data.gtm_container_id}
                                onChange={(e) => setData('gtm_container_id', e.target.value)}
                                placeholder="GTM-XXXXXXX"
                            />
                        </Field>
                        <Field label="Facebook Pixel ID" error={errors.facebook_pixel_id}>
                            <TextInput
                                className="w-full"
                                value={data.facebook_pixel_id}
                                onChange={(e) => setData('facebook_pixel_id', e.target.value)}
                                placeholder="1234567890"
                            />
                        </Field>
                    </div>
                </Card>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 btn-gradient font-black text-sm uppercase tracking-widest disabled:opacity-50"
                >
                    {processing ? 'Saving…' : 'Save SEO settings'}
                </button>
            </form>
        </AuthenticatedLayout>
    );
}
