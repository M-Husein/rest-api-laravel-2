<?php

namespace Programmeria\LocaleSwitcher\Console;

use Illuminate\Console\Command;
use Programmeria\LocaleSwitcher\Models\Language;
use Programmeria\LocaleSwitcher\Support\LocalePresets;
use Programmeria\LocaleSwitcher\Support\TranslationImporter;

class LocaleAddCommand extends Command
{
    protected $signature = 'locale:add
        {code : Language code, e.g. ms. Use a preset code or pass --name for a custom one}
        {--name= : Display name (required when the code is not in the preset catalog)}
        {--native= : Native name (defaults to --name)}
        {--direction= : ltr or rtl (defaults to the preset value, or ltr)}
        {--default : Set as the default language}
        {--inactive : Add as inactive (hidden from switchers)}
        {--no-import : Skip importing lang/ files for the new locale}';

    protected $description = 'Add a new active language from the preset catalog';

    public function handle(): int
    {
        $code = strtolower(trim((string) $this->argument('code')));

        if (! preg_match('/^[a-z]{2,3}(-[a-z]{2,4})?$/', $code)) {
            $this->components->error("Invalid language code [{$code}]. Use e.g. ms, pt-br, zh-tw.");
            return self::FAILURE;
        }

        if (Language::where('code', $code)->exists()) {
            $this->components->error("Language [{$code}] already exists. Use locale:sync to import its files.");
            return self::FAILURE;
        }

        $preset = LocalePresets::find($code);
        $name = trim((string) ($this->option('name') ?? $preset['name'] ?? ''));

        if ($name === '') {
            $this->components->error(
                "Unknown code [{$code}]. Pass --name for custom codes. Available: "
                .implode(', ', LocalePresets::codes()).'.'
            );
            return self::FAILURE;
        }

        $direction = strtolower(trim((string) ($this->option('direction') ?? $preset['direction'] ?? 'ltr')));
        if (! in_array($direction, ['ltr', 'rtl'], true)) {
            $this->components->error("Invalid --direction [{$direction}]. Use ltr or rtl.");
            return self::FAILURE;
        }

        $maxSort = (int) Language::query()->max('sort_order');

        $language = Language::create([
            'code' => $code,
            'name' => $name,
            'native_name' => trim((string) ($this->option('native') ?? $preset['native_name'] ?? $name)),
            'direction' => $direction,
            'is_active' => ! (bool) $this->option('inactive'),
            'is_default' => false,
            'sort_order' => $maxSort + 1,
        ]);

        if ((bool) $this->option('default')) {
            $language->makeDefault();
            $this->components->warn('Marked as default in DB. Also update APP_FALLBACK_LOCALE in .env to match.');
        }

        if (! (bool) $this->option('no-import')) {
            $importer = new TranslationImporter(fn (string $m) => $this->line($m));
            $count = $importer->importLocale($code);
            TranslationImporter::clearTranslationCache();
            $this->components->info("Imported {$count} lines for [{$code}]. Missing files fall back to English at runtime.");
        } else {
            $this->components->info("Language [{$code}] added without import. Missing strings fall back to English at runtime.");
        }

        return self::SUCCESS;
    }
}
