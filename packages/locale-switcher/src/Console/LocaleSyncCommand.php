<?php

namespace Programmeria\LocaleSwitcher\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Programmeria\LocaleSwitcher\Models\Language;
use Programmeria\LocaleSwitcher\Support\TranslationImporter;

class LocaleSyncCommand extends Command
{
    protected $signature = 'locale:sync
        {code? : Specific locale to sync (default: all active languages)}
        {--force : Overwrite existing lines from files (reset). Without it, only missing keys are filled}';

    protected $description = 'Import lang/ files into language_lines (safe upsert by default)';

    public function handle(): int
    {
        $code = $this->argument('code');
        $force = (bool) $this->option('force');

        $locales = $code !== null
            ? [strtolower(trim((string) $code))]
            : Language::query()->active()->ordered()->pluck('code')->all();

        if ($locales === []) {
            $this->components->error('No languages to sync.');
            return self::FAILURE;
        }

        $importer = new TranslationImporter(fn (string $m) => $this->line($m));

        foreach ($locales as $locale) {
            $count = $importer->importLocale($locale, $force);
            $this->components->info("{$locale}: {$count} lines ".($force ? 'overwritten' : 'filled').'.');
        }

        TranslationImporter::clearTranslationCache();
        Cache::forget(Language::CACHE_KEY);

        $this->components->info("Done! {$importer->importedCount()} lines total.");

        return self::SUCCESS;
    }
}
