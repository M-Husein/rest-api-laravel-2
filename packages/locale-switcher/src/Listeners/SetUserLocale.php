<?php

namespace Programmeria\LocaleSwitcher\Listeners;

use Illuminate\Auth\Events\Authenticated;
use Illuminate\Http\Request;
use Programmeria\LocaleSwitcher\Support\LocaleResolver;

/**
 * Apply the authenticated user's stored language preference.
 *
 * Listening to the Authenticated event guarantees the user has already been
 * resolved (after the auth middleware), unlike route group middleware which
 * may run before authentication.
 *
 * Public URL locales win over the stored preference. Explicit API signals
 * (?lang or Accept-Language) also win. The stored preference is only a
 * fallback for admin requests and API requests without an explicit signal.
 */
class SetUserLocale
{
    public function handle(Authenticated $event): void
    {
        $request = request();

        if (! $request instanceof Request) {
            return;
        }

        if ($request->route()?->getAction('locale_type') !== null) {
            return;
        }

        $locales = config('localizer.supported_locales', []);

        if ($request->is('api/*') && LocaleResolver::hasExplicit($request, $locales)) {
            return;
        }

        $lang = $event->user?->lang;

        if (is_string($lang) && in_array($lang, $locales, true)) {
            app()->setLocale($lang);
        }
    }
}
