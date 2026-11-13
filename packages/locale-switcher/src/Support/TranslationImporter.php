<?php

namespace Programmeria\LocaleSwitcher\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Spatie\TranslationLoader\LanguageLine;

/**
 * Imports lang/ files into language_lines. Shared by the default
 * translations seeder and the `locale:sync` command so both behave the same.
 *
 * Non-force mode only fills keys missing for the locale (safe for locales
 * with admin-edited content). Force mode overwrites from files (reset).
 */
final class TranslationImporter
{
    private int $imported = 0;

    /** @var callable(string):void|null */
    private $line;

    /** @param callable(string):void|null $line */
    public function __construct(?callable $line = null)
    {
        $this->line = $line;
    }

    public function importLocale(string $locale, bool $force = false): int
    {
        $before = $this->imported;

        $this->importPhpGroups($locale, $force);
        $this->importLaravelRootJson($locale, $force);
        $this->importCustomCommon($locale, $force);
        $this->importVendorFiles($locale, $force);

        return $this->imported - $before;
    }

    public function importedCount(): int
    {
        return $this->imported;
    }

    public static function clearTranslationCache(): void
    {
        Cache::forget(config('translation-loader.cache_key', 'spatie.translation-loader.translations'));
    }

    private function emit(string $message): void
    {
        if ($this->line !== null) {
            ($this->line)($message);
        }
    }

    private function importPhpGroups(string $locale, bool $force): void
    {
        $path = lang_path($locale);
        if (! File::isDirectory($path)) {
            return;
        }

        foreach (File::files($path) as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }
            $group = pathinfo($file->getFilename(), PATHINFO_FILENAME);
            $translations = require $file->getPathname();
            if (is_array($translations)) {
                $this->importArrayRecursive($group, $translations, $locale, $force);
                $this->emit("  Imported PHP group '{$group}' for {$locale}");
            }
        }
    }

    private function importLaravelRootJson(string $locale, bool $force): void
    {
        $file = lang_path("{$locale}.json");
        if (! File::exists($file)) {
            return;
        }

        $translations = json_decode(File::get($file), true);
        if (! is_array($translations)) {
            return;
        }

        foreach ($translations as $key => $value) {
            if (is_string($value)) {
                $this->storeTranslation('system', $key, $value, $locale, $force);
            }
        }
        $this->emit("  Imported Laravel root JSON for {$locale} → group 'system'");
    }

    private function importCustomCommon(string $locale, bool $force): void
    {
        $file = lang_path("custom/common/{$locale}.json");
        if (! File::exists($file)) {
            return;
        }

        $translations = json_decode(File::get($file), true);
        if (! is_array($translations)) {
            return;
        }

        foreach ($this->flattenArray($translations) as $key => $value) {
            if (is_string($value)) {
                $this->storeTranslation('common', $key, $value, $locale, $force);
            }
        }
        $this->emit("  Imported custom common JSON for {$locale} → group 'common'");
    }

    private function importVendorFiles(string $locale, bool $force): void
    {
        $vendorBase = lang_path('vendor');
        if (! File::isDirectory($vendorBase)) {
            return;
        }

        foreach (File::directories($vendorBase) as $vendorDir) {
            $vendorName = basename($vendorDir);
            $vendorLocalePath = "{$vendorDir}/{$locale}";
            if (! File::isDirectory($vendorLocalePath)) {
                continue;
            }

            foreach (File::files($vendorLocalePath) as $file) {
                if ($file->getExtension() !== 'php') {
                    continue;
                }
                $group = "{$vendorName}::".pathinfo($file->getFilename(), PATHINFO_FILENAME);
                $translations = require $file->getPathname();
                if (is_array($translations)) {
                    $this->importArrayRecursive($group, $translations, $locale, $force);
                    $this->emit("  Imported vendor group '{$group}' for {$locale}");
                }
            }
        }
    }

    private function importArrayRecursive(string $group, array $translations, string $locale, bool $force, string $prefix = ''): void
    {
        foreach ($translations as $key => $value) {
            $fullKey = $prefix.$key;
            if (is_array($value)) {
                $this->importArrayRecursive($group, $value, $locale, $force, $fullKey.'.');
            } else {
                $this->storeTranslation($group, $fullKey, (string) $value, $locale, $force);
            }
        }
    }

    /** @return array<string, string> */
    private function flattenArray(array $array, string $prefix = ''): array
    {
        $result = [];
        foreach ($array as $key => $value) {
            $newKey = $prefix ? $prefix.'.'.$key : $key;
            if (is_array($value)) {
                $result = array_merge($result, $this->flattenArray($value, $newKey));
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }

    private function storeTranslation(string $group, string $key, string $value, string $locale, bool $force): void
    {
        $line = LanguageLine::firstOrNew([
            'group' => $group,
            'key' => $key,
        ]);

        $text = $line->text ?? [];

        if (! $force && array_key_exists($locale, $text)) {
            return;
        }

        if (! $force && $line->exists && ($text[$locale] ?? null) === $value) {
            return;
        }

        $text[$locale] = $value;
        $line->text = $text;
        $line->is_system = true;
        $line->save();

        $this->imported++;
    }
}
