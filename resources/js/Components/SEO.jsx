import { Head, usePage } from '@inertiajs/react';

/**
 * Drop-in replacement for Inertia's <Head> on public pages. Reads global
 * defaults shared by HandleInertiaRequests and applies the title template,
 * canonical URL, Open Graph + Twitter Card tags, robots meta, and JSON-LD
 * (Organization + WebSite + optional BreadcrumbList).
 *
 * Props (all optional):
 *   title        — page title (raw, before template applied)
 *   description  — meta description override
 *   ogImage      — absolute URL or storage path
 *   type         — og:type (default "website"; use "article" / "product" where it fits)
 *   noindex      — force noindex,nofollow on this page even if global indexing is on
 *   breadcrumbs  — array of { name, url } for BreadcrumbList JSON-LD
 *   organization — true on the home page to emit Organization + WebSite JSON-LD
 *   keywords     — meta keywords override
 *   children     — extra <Head> children (e.g. preconnects)
 */
export default function SEO({
    title,
    description,
    ogImage,
    type = 'website',
    noindex = false,
    breadcrumbs,
    organization = false,
    keywords,
    children,
}) {
    const seo = usePage().props.seo || {};

    const pageTitle = title || seo.defaultTitle || seo.siteName || '';
    const fullTitle = title && seo.titleTemplate
        ? seo.titleTemplate.replace(':page', title)
        : pageTitle;

    const finalDescription = description || seo.defaultDescription || '';
    const finalKeywords = keywords || seo.defaultKeywords || '';
    const finalOgImage = absoluteUrl(ogImage, seo.canonicalHost) || seo.defaultOgImage || '';
    const canonicalUrl = seo.currentUrl || '';
    const robots = (!seo.allowIndexing || noindex) ? 'noindex,nofollow' : 'index,follow';

    const jsonLdBlocks = [];
    if (organization) {
        jsonLdBlocks.push(buildOrganizationLd(seo));
        jsonLdBlocks.push(buildWebSiteLd(seo));
    }
    if (breadcrumbs && breadcrumbs.length > 0) {
        jsonLdBlocks.push(buildBreadcrumbLd(breadcrumbs, seo));
    }

    return (
        <Head title={fullTitle}>
            {finalDescription && (
                <meta name="description" content={finalDescription} head-key="description" />
            )}
            {finalKeywords && (
                <meta name="keywords" content={finalKeywords} head-key="keywords" />
            )}
            <meta name="robots" content={robots} head-key="robots" />

            {canonicalUrl && (
                <link rel="canonical" href={canonicalUrl} head-key="canonical" />
            )}

            <meta property="og:type" content={type} head-key="og:type" />
            <meta property="og:title" content={fullTitle} head-key="og:title" />
            {finalDescription && (
                <meta property="og:description" content={finalDescription} head-key="og:description" />
            )}
            {finalOgImage && (
                <meta property="og:image" content={finalOgImage} head-key="og:image" />
            )}
            {canonicalUrl && (
                <meta property="og:url" content={canonicalUrl} head-key="og:url" />
            )}
            {seo.siteName && (
                <meta property="og:site_name" content={seo.siteName} head-key="og:site_name" />
            )}
            {seo.locale && (
                <meta property="og:locale" content={(seo.locale || 'en').replace('-', '_')} head-key="og:locale" />
            )}

            <meta name="twitter:card" content={finalOgImage ? 'summary_large_image' : 'summary'} head-key="twitter:card" />
            {seo.twitterHandle && (
                <meta name="twitter:site" content={seo.twitterHandle} head-key="twitter:site" />
            )}
            <meta name="twitter:title" content={fullTitle} head-key="twitter:title" />
            {finalDescription && (
                <meta name="twitter:description" content={finalDescription} head-key="twitter:description" />
            )}
            {finalOgImage && (
                <meta name="twitter:image" content={finalOgImage} head-key="twitter:image" />
            )}

            {jsonLdBlocks.map((block, idx) => (
                <script
                    key={idx}
                    type="application/ld+json"
                    head-key={`ld-${idx}`}
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
                />
            ))}

            {children}
        </Head>
    );
}

function absoluteUrl(maybePath, host) {
    if (!maybePath) return null;
    if (maybePath.startsWith('http://') || maybePath.startsWith('https://')) return maybePath;
    if (maybePath.startsWith('/storage/') || maybePath.startsWith('/')) {
        return host ? host + maybePath : maybePath;
    }
    return host ? `${host}/storage/${maybePath.replace(/^\/+/, '')}` : `/storage/${maybePath.replace(/^\/+/, '')}`;
}

function buildOrganizationLd(seo) {
    const ld = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: seo.organizationName || seo.siteName,
        url: seo.canonicalHost,
    };
    if (seo.organizationLogo) ld.logo = seo.organizationLogo;
    if (seo.socialLinks && seo.socialLinks.length > 0) ld.sameAs = seo.socialLinks;
    if (seo.organizationPhone || seo.organizationEmail) {
        ld.contactPoint = {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            ...(seo.organizationPhone ? { telephone: seo.organizationPhone } : {}),
            ...(seo.organizationEmail ? { email: seo.organizationEmail } : {}),
        };
    }
    return ld;
}

function buildWebSiteLd(seo) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seo.siteName,
        url: seo.canonicalHost,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${seo.canonicalHost}/services?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };
}

function buildBreadcrumbLd(crumbs, seo) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: c.url?.startsWith('http') ? c.url : `${seo.canonicalHost}${c.url}`,
        })),
    };
}
