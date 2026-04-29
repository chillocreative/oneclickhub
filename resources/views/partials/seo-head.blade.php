@php
    use App\Support\SeoSettings;
    $seo = SeoSettings::all();
@endphp

{{-- Search engine verification metas --}}
@if (!empty($seo['verification_google']))
    <meta name="google-site-verification" content="{{ $seo['verification_google'] }}">
@endif
@if (!empty($seo['verification_bing']))
    <meta name="msvalidate.01" content="{{ $seo['verification_bing'] }}">
@endif
@if (!empty($seo['verification_yandex']))
    <meta name="yandex-verification" content="{{ $seo['verification_yandex'] }}">
@endif
@if (!empty($seo['verification_facebook']))
    <meta name="facebook-domain-verification" content="{{ $seo['verification_facebook'] }}">
@endif

{{-- Google Tag Manager --}}
@if (!empty($seo['gtm_container_id']))
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','{{ $seo['gtm_container_id'] }}');</script>
@endif

{{-- Google Analytics 4 (gtag.js) --}}
@if (!empty($seo['ga4_measurement_id']))
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ $seo['ga4_measurement_id'] }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '{{ $seo['ga4_measurement_id'] }}');
    </script>
@endif

{{-- Meta Pixel (Facebook) --}}
@if (!empty($seo['facebook_pixel_id']))
    <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '{{ $seo['facebook_pixel_id'] }}');
        fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id={{ $seo['facebook_pixel_id'] }}&ev=PageView&noscript=1"/></noscript>
@endif
