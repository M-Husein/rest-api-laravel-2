<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Programmeria\LocaleSwitcher\Support\TranslationImporter;

class ImportDefaultTranslationsSeeder extends Seeder{
  public function run(): void{
    $this->command->info('Importing all translations...');

    // Locales come from config (DB-driven with static fallback).
    $locales = config('localizer.supported_locales', ['en']);
    $importer = new TranslationImporter(fn (string $m) => $this->command->line($m));

    foreach ($locales as $locale) {
      $importer->importLocale($locale, true); // seeder = reset from files
    }

    TranslationImporter::clearTranslationCache();
    $this->command->info('Translation cache cleared.');
    $this->command->info("Done! Imported {$importer->importedCount()} lines.");
  }
}

// php artisan db:seed --class=ImportDefaultTranslationsSeeder
