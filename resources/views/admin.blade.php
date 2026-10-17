@php
$appName = config('app.name');
$lang = str_replace('_', '-', app()->getLocale());
// $baseUrl = url('');
$csp = $nonce ?? '';
$flags = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
if(!app()->isProduction()) $flags |= JSON_PRETTY_PRINT;
$bots = ['robots','googlebot','AdsBot-Google','bing','bingbot','baidu'];
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}" translate="no" class="notranslate" dir="{{ Localizer::currentLocaleDirection() }}">
<head>
  <meta charset="utf-8"/>{{-- <meta http-equiv="X-UA-Compatible" content="IE=edge"/> --}}
  <meta name="viewport" content="width=device-width, initial-scale=1"/>{{-- From Instagram: <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=2, viewport-fit=cover"/> --}}
  <meta name="color-scheme" content="light"/>
  <meta name="theme-color" content="#1677ff"/>
  {{-- <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)"/> --}}
  <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
  <meta name="mobile-web-app-capable" content="yes"/>
  <meta name="format-detection" content="email=no, telephone=no, date=no, address=no"/>
  <meta name="google" content="notranslate"/>
  <title>{{ $meta['title'] }}</title>
  <meta name="description" content="{{ $meta['description'] }}"/>
  <meta name="application-name" content="{{ $appName }}"/>
  <meta name="apple-mobile-web-app-title" content="{{ $appName }}"/>
@foreach($bots as $bot)
  <meta name="{{ $bot }}" content="{{ $meta['robots'] }}"/>
@endforeach
  {{-- Only for share link thumbnail --}}
  <meta property="og:image" content="{{ $meta['image'] }}"/>
  <meta property="og:image:width" content="480"/>
  <meta property="og:image:height" content="360"/>
  <meta name="twitter:image" content="{{ $meta['image'] }}"/>
  {{-- Favicon --}}
  <link rel="icon" href="/favicon.ico" sizes="any"/>
  <link rel="icon" href="/logo.svg" type="image/svg+xml"/>
  <link rel="apple-touch-icon" href="/logo-180x180.png"/>
<script nonce="{{ $csp }}">
const APP=Object.freeze({
  name:"{{$appName}}",
  api:"/api/v1", {{-- "{{ $baseUrl }}/api/v1" --}}
  timeout:{{ config('app.timeout') }},
  defaultLang:"{{ config('app.fallback_locale') }}",
  locales:@json(config('localizer.locales')),
  csp:"{{$csp}}"
});
window.__APP__={
  user:@json($user,$flags),
  page:{{ Js::from($page ?? null) }},
  meta:@json($meta,$flags)
};
</script>
@viteReactRefresh
@vite(['resources/css/app.scss','resources/ts/admin.tsx'])
{{-- @vite(['resources/css/app.scss','resources/ts/main.tsx']) --}}
</head>
<body class="antialiased min-h-fullscreen bg-main admin">
  <div id="loaderApp" data-nosnippet>
    <img src="/logo.svg" width="32" alt="" draggable="false"/>
    <b class="spin-border" style="width:4rem;height:4rem" role="status" aria-label="Loading"></b>
    {{-- To use this loader change 'resources/css/app.css' to 'resources/css/app-2.css' --}}
    {{-- <svg role="status" aria-label="Loading" stroke-width="2" viewBox="0 0 32 32" width="87" height="87" fill="none" stroke="#1677ff">
      <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" opacity="0.125"></circle>
      <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" stroke-dasharray="20 110">
        <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 16 16" to="360 16 16" dur="750ms" repeatCount="indefinite"></animateTransform>
      </circle>
    </svg> --}}
  </div>
  <div id="app" data-nosnippet></div>
  <noscript>
    <style nonce="{{ $csp }}">#loaderApp{display:none}.nojs{font-family:Arial;font-size:1rem}</style>
    <div class="nojs" data-nosnippet>
      <b style="font-size:3rem">⚠️</b>
      <p>{{__('nojs')}} {{ $appName }}.</p>
      <a rel="noopener noreferrer" target="_blank" href="https://www.enablejavascript.io/{{ $lang }}">{{__('guide')}}</a>
    </div>
  </noscript>
</body></html>