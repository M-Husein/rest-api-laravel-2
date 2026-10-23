<?php

namespace Programmeria\LocaleSwitcher\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Programmeria\LocaleSwitcher\Support\LocaleResolver;

/**
 * Apply the authenticated user's stored locale on API requests.
 *
 * API token guards do not dispatch the Authenticated event, so the user
 * fallback runs as middleware after the auth middleware instead.
 */
class SetUserLocale
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->route()?->getAction('locale_type') !== null) {
            return $next($request);
        }

        $locales = config('localizer.supported_locales', []);

        if (LocaleResolver::hasExplicit($request, $locales)) {
            return $next($request);
        }

        $lang = $request->user()?->lang;

        if (is_string($lang) && in_array($lang, $locales, true)) {
            app()->setLocale($lang);
        }

        return $next($request);
    }
}
