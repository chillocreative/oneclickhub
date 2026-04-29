@php
    use App\Support\SeoSettings;
    $gtm = SeoSettings::get('gtm_container_id');
@endphp

@if ($gtm)
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtm }}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
@endif
