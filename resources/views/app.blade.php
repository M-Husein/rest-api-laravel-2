@php
$appName = config('app.name');
$lang = str_replace('_', '-', app()->getLocale());
$baseUrl = url('');
# $urlCurrent = url()->current();
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}" translate="no" class="notranslate">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1677ff">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no,address=no,email=no">
<meta name="robots" content="index,follow">{{-- ,max-image-preview:large --}}

{{-- <link rel="canonical" href="{{ $baseUrl->full() }}"> --}}
{{-- <meta property="og:url" content="{{ $baseUrl->full() }}"/> --}}
{{-- <meta property="og:locale" content="{{ $lang }}"/> --}}

<meta property="og:image" content="{{ $baseUrl }}/logo-144x144.png">
<meta name="twitter:image" content="{{ $baseUrl }}/logo-144x144.png">
<title>{{ $appName }}</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo-180x180.png">
<script>
const APP=Object.freeze({
  name:"{{$appName}}",
  api:"{{ $baseUrl }}/api/v1",
  timeout:{{ config('app.timeout') }},
  defaultLang:"{{ config('app.fallback_locale') }}",
  locales:@json(config('localizer.locales'))
});
</script>
@viteReactRefresh
@vite(['resources/css/app.scss','resources/ts/main.tsx'])
</head>
<body class="antialiased min-h-fullscreen bg-main">
<div id="loaderApp" data-nosnippet="true">
	<img src="/logo.svg" alt="" draggable="false"/>
	<b class="spin-border" style="width:4rem;height:4rem" role="status" aria-label="Loading"></b>
</div>
<div id="app"></div>
<noscript>
	<style>#loaderApp{display:none}.nojs{font-family:Arial;font-size:1rem}</style>
	<div class="nojs" data-nosnippet="true">
    <b style="font-size:3rem">⚠️</b>
		<p>{{__('nojs')}}.</p>
		<a rel="noopener noreferrer" target="_blank" href="https://www.enablejavascript.io/{{ $lang }}">{{__('guide')}}</a>
	</div>
</noscript>
</body></html>