@php
$appName = config('app.name');
$lang = str_replace('_', '-', app()->getLocale());
$defaultLang = config('app.fallback_locale');
$csp = $nonce ?? '';
$noSeo = str_contains($meta['robots'] ?? '', 'noindex');
$flags = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
if(!app()->isProduction()) $flags |= JSON_PRETTY_PRINT;
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}" translate="no" class="notranslate" dir="ltr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="theme-color" content="#1677ff"/>
  {{-- <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)"/> --}}
  <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
  <meta name="mobile-web-app-capable" content="yes"/>
  <meta name="format-detection" content="email=no, telephone=no, date=no, address=no"/>
  <meta name="google" content="notranslate"/>
  <meta name="robots" content="{{ $meta['robots'] }}"/>
  {{-- Primary SEO --}}
  <title>{{ $meta['title'] }}</title>
  <meta name="description" content="{{ $meta['description'] }}"/>
  <link rel="canonical" href="{{ $meta['url'] }}"/>
  <meta name="application-name" content="{{ $appName }}"/>
  <meta name="apple-mobile-web-app-title" content="{{ $appName }}"/>
  {{-- Open Graph --}}
  <meta property="og:type" content="{{ $meta['type'] }}"/>
  <meta property="og:url" content="{{ $meta['url'] }}"/>
  <meta property="og:title" content="{{ $meta['title'] }}"/>
  <meta property="og:description" content="{{ $meta['description'] }}"/>
  <meta property="og:image" content="{{ $meta['image'] }}"/>
  <meta property="og:image:alt" content="{{ $appName }} logo"/>
  <meta property="og:site_name" content="{{ $appName }}"/>
  {{-- Twitter Card --}}
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:url" content="{{ $meta['url'] }}"/>
  <meta name="twitter:title" content="{{ $meta['title'] }}"/>
  <meta name="twitter:description" content="{{ $meta['description'] }}"/>
  <meta name="twitter:image" content="{{ $meta['image'] }}"/>
  <meta name="twitter:image:alt" content="{{ $appName }} logo"/>
  {{-- Favicon --}}
  <link rel="icon" href="/favicon.ico" sizes="any"/>
  <link rel="icon" href="/logo.svg" type="image/svg+xml"/>
  <link rel="apple-touch-icon" href="/logo-180x180.png"/>
{{-- Only render alternate links if the page is indexable --}}
@if(!$noSeo)
  <link rel="alternate" href="{{ Route::localizedUrl($defaultLang) }}" hreflang="x-default"/>
@foreach(config('localizer.supported_locales') as $lng)
  <link rel="alternate" href="{{ Route::localizedSwitcherUrl($lng) }}" hreflang="{{ $lng }}"/>
@endforeach
@endif
{{-- JSON-LD Structured Data — for SEO bots & LLM crawlers --}}
@foreach($jsonLd ?? [] as $schema)
<script type="application/ld+json" nonce="{{ $csp }}">@json($schema,$flags)</script>
@endforeach
<script nonce="{{ $csp }}">
const APP=Object.freeze({
  name:"{{$appName}}",
  api:"/api/v1",
  timeout:{{ config('app.timeout') }},
  defaultLang:"{{$defaultLang}}",
  locales:@json(config('localizer.locales')),
  csp:"{{$csp}}"
});
window.__APP__={
  user:@json($user,$flags),
  page:@json($page,$flags),
  meta:@json($meta,$flags)
};
</script>
@viteReactRefresh
@vite(['resources/css/app.scss','resources/ts/main.tsx'])
</head>
<body class="antialiased min-h-fullscreen bg-main">
  <div id="loaderApp" data-nosnippet>
    <img src="/logo.svg" width="32" alt="" draggable="false"/>
    <b class="spin-border" style="width:4rem;height:4rem" role="status" aria-label="Loading"></b>
  </div>
  <div id="app"></div>
  <noscript>
    <style nonce="{{ $csp }}">#loaderApp{display:none}.nojs{font-family:Arial;font-size:1rem}</style>
    <div class="nojs" data-nosnippet>
      <b style="font-size:3rem">⚠️</b>
      <p>{{__('nojs')}} {{ $appName }}.</p>
      <a rel="noopener noreferrer" target="_blank" href="https://www.enablejavascript.io/{{ $lang }}?utm_source={{ request()->getHost() }}">{{__('guide')}}</a>
    </div>
  </noscript>
</body></html>