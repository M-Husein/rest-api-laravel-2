<?php

namespace Programmeria\LocaleSwitcher\Listeners;

use Illuminate\Auth\Events\Authenticated;

/**
 * Apply the authenticated user's stored language preference.
 *
 * Listening to the Authenticated event guarantees the user has already been
 * resolved (after the auth middleware), unlike route group middleware which
 * may run before authentication.
 *
 * When the user has no language (or an unsupported one), the locale set
 * earlier by SetLang (Accept-Language / ?lang / default) is left intact.
 */
class SetUserLocale
{
    public function handle(Authenticated $event): void
    {
        $lang = $event->user?->lang;
        $locales = config('localizer.supported_locales', []);

        if ($lang && in_array($lang, $locales, true)) {
            app()->setLocale($lang);
        }
    }
}
