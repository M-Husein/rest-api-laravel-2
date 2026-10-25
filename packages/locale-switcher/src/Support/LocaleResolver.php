<?php

namespace Programmeria\LocaleSwitcher\Support;

use Illuminate\Http\Request;

final class LocaleResolver
{
    public static function fromQuery(Request $request, array $locales): ?string
    {
        $lang = $request->query('lang');

        return is_string($lang) && in_array($lang, $locales, true) ? $lang : null;
    }

    public static function fromHeader(Request $request, array $locales): ?string
    {
        if (! $request->headers->has('Accept-Language')) {
            return null;
        }

        foreach ($request->getLanguages() as $language) {
            $language = strtolower(str_replace('_', '-', $language));

            foreach ($locales as $locale) {
                $normalized = strtolower(str_replace('_', '-', $locale));

                if ($language === $normalized || str_starts_with($language, $normalized.'-')) {
                    return $locale;
                }
            }
        }

        return null;
    }

    public static function requested(Request $request, array $locales): ?string
    {
        return self::fromQuery($request, $locales)
            ?? self::fromHeader($request, $locales);
    }

    public static function hasExplicit(Request $request, array $locales): bool
    {
        return self::requested($request, $locales) !== null;
    }
}
