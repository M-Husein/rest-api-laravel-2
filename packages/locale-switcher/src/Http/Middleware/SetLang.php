<?php

namespace Programmeria\LocaleSwitcher\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Programmeria\LocaleSwitcher\Support\LocaleResolver;

class SetLang
{
    public function handle(Request $request, Closure $next)
    {
        /**
         * Priority
         * 1. Query param ?lang=
         * 2. Accept-Language header
         * 3. Default locale
         *
         * The authenticated user's stored preference is applied later by
         * SetUserLocale, only when neither explicit signal is present.
         */
        $defaultLang = config('app.fallback_locale', 'en');
        $locales = config('localizer.supported_locales', [$defaultLang]);

        $lang = LocaleResolver::fromQuery($request, $locales)
            ?? LocaleResolver::fromHeader($request, $locales)
            ?? $defaultLang;

        app()->setLocale($lang);

        return $next($request);
    }
}
