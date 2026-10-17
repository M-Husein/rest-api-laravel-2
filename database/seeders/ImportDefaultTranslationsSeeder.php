<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Spatie\TranslationLoader\LanguageLine;
use Illuminate\Support\Facades\Cache;

class ImportDefaultTranslationsSeeder extends Seeder{
  protected $importedCount = 0;
  protected $locales = ['en', 'id']; // Add more if needed

  public function run(): void{
    $this->command->info('Importing all translations...');

    foreach ($this->locales as $locale) {
      $this->importPhpGroups($locale);        // → auth, validation, etc.
      $this->importLaravelRootJson($locale);  // → group 'system'
      $this->importCustomCommon($locale);     // → group 'common'
      $this->importVendorFiles($locale);      // → vendor::package
    }

    $this->clearCache();
    $this->command->info("Done! Imported {$this->importedCount} lines.");
  }

  /**
   * 1. PHP group files (lang/{locale}/auth.php, validation.php, etc.)
   */
  protected function importPhpGroups(string $locale): void{
    $path = lang_path($locale);
    if (!File::isDirectory($path)) return;

    foreach (File::files($path) as $file) {
      if ($file->getExtension() !== 'php') continue;
      $group = pathinfo($file->getFilename(), PATHINFO_FILENAME);
      $translations = require $file->getPathname();
      if (is_array($translations)) {
        $this->importArrayRecursive($group, $translations, $locale);
        $this->command->line("  Imported PHP group '{$group}' for {$locale}");
      }
    }
  }

  /**
   * 2. Laravel Lang root JSON (lang/{locale}.json) → group 'system'
   */
  protected function importLaravelRootJson(string $locale): void{
    $file = lang_path("{$locale}.json");
    if (!File::exists($file)) return;

    $content = File::get($file);
    $translations = json_decode($content, true);
    if (!is_array($translations)) return;

    foreach ($translations as $key => $value) {
      if (is_string($value)) {
        $this->storeTranslation('system', $key, $value, $locale);
      }
    }
    $this->command->line("  Imported Laravel root JSON for {$locale} → group 'system'");
  }

  /**
   * 3. Custom common JSON (lang/custom/common/{locale}.json) → group 'common'
   */
  protected function importCustomCommon(string $locale): void{
    $file = lang_path("custom/common/{$locale}.json");
    if (!File::exists($file)) return;

    $content = File::get($file);
    $translations = json_decode($content, true);
    if (!is_array($translations)) return;

    $flattened = $this->flattenArray($translations);
    foreach ($flattened as $key => $value) {
      if (is_string($value)) {
        $this->storeTranslation('common', $key, $value, $locale);
      }
    }
    $this->command->line("  Imported custom common JSON for {$locale} → group 'common'");
  }

  /**
   * 4. Vendor PHP files (lang/en/*.php)
   */
  protected function importVendorFiles(string $locale): void{
    $vendorBase = lang_path('vendor');
    if (!File::isDirectory($vendorBase)) return;

    foreach (File::directories($vendorBase) as $vendorDir) {
      $vendorName = basename($vendorDir);
      $vendorLocalePath = "{$vendorDir}/{$locale}";
      if (!File::isDirectory($vendorLocalePath)) continue;

      foreach (File::files($vendorLocalePath) as $file) {
        if ($file->getExtension() !== 'php') continue;
        $group = "{$vendorName}::" . pathinfo($file->getFilename(), PATHINFO_FILENAME);
        $translations = require $file->getPathname();
        if (is_array($translations)) {
          $this->importArrayRecursive($group, $translations, $locale);
          $this->command->line("  Imported vendor group '{$group}' for {$locale}");
        }
      }
    }
  }

  /**
   * Recursively import nested PHP arrays (for groups).
   */
  protected function importArrayRecursive(
    string $group, 
    array $translations, 
    string $locale, 
    string $prefix = ''
  ): void{
    foreach ($translations as $key => $value) {
      $fullKey = $prefix . $key;
      if (is_array($value)) {
        $this->importArrayRecursive($group, $value, $locale, $fullKey . '.');
      } else {
        $this->storeTranslation($group, $fullKey, (string) $value, $locale);
      }
    }
  }

  /**
   * Flatten nested JSON (for custom common).
   */
  protected function flattenArray(array $array, string $prefix = ''): array{
    $result = [];
    foreach ($array as $key => $value) {
      $newKey = $prefix ? $prefix . '.' . $key : $key;
      if (is_array($value)) {
        $result = array_merge($result, $this->flattenArray($value, $newKey));
      } else {
        $result[$newKey] = $value;
      }
    }
    return $result;
  }

  /**
   * Store a single translation line (update if exists).
   */
  protected function storeTranslation(
    string $group, 
    string $key, 
    string $value, 
    string $locale
  ): void{
    $line = LanguageLine::firstOrNew([
      'group' => $group,
      'key'   => $key,
    ]);

    $text = $line->text ?? [];
    $text[$locale] = $value;

    $line->text = $text;
    $line->is_system = true; // Mark as system (can't delete, only edit)
    $line->save();

    $this->importedCount++;
  }

  protected function clearCache(): void{
    $cacheKey = config('translation-loader.cache_key', 'spatie.translation-loader.translations');
    Cache::forget($cacheKey);
    $this->command->info('Translation cache cleared.');
  }
}

// php artisan db:seed --class=ImportDefaultTranslationsSeeder
