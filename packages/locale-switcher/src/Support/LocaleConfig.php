<?php

namespace Programmeria\LocaleSwitcher\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Programmeria\LocaleSwitcher\Models\Language;

/**
 * Resolves the active languages from the DB into runtime config.
 *
 * Called on every boot by the service provider (production boots fresh per
 * request) and explicitly in tests/console to simulate a new request after
 * mutating languages. Falls back to the static config when the DB table is
 * missing or an error occurs.
 */
final class LocaleConfig
{
    public static function refresh(): void
    {
        try {
            $resolved = Cache::remember(Language::CACHE_KEY, 3600, function () {
                if (! Schema::hasTable('languages')) {
                    return null;
                }

                $rows = Language::query()->active()->ordered()->get(['code', 'name', 'direction']);

                if ($rows->isEmpty()) {
                    return null;
                }

                return [
                    'locales' => $rows->pluck('name', 'code')->all(),
                    'directions' => $rows->where('direction', '!=', 'ltr')
                        ->mapWithKeys(fn ($row) => [$row->code => $row->direction])
                        ->all(),
                ];
            });
        } catch (\Throwable $e) {
            return;
        }

        if (! is_array($resolved)) {
            return;
        }

        config()->set('localizer.locales', $resolved['locales']);
        config()->set('localizer.supported_locales', array_keys($resolved['locales']));
        config()->set('localizer.locale_directions', $resolved['directions']);
    }
}
