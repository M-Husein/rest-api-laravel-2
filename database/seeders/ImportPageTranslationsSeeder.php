<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Programmeria\Seo\Models\PageTranslation;

class ImportPageTranslationsSeeder extends Seeder{
  protected $basePath;
  protected $locales;

  public function __construct(){
    $this->basePath = lang_path('custom/page');
    $this->locales = config('localizer.supported_locales', ['en']);
  }

  public function run(){
    if(!class_exists(PageTranslation::class)){
      $this->command->warn('The seo package is not installed; skipping page translations.');
      return;
    }

    if(empty($this->locales) || !is_array($this->locales)){
      $this->command->error('No locales defined in config("localizer.supported_locales"). Please add locales array.');
      return;
    }

    $this->command->info('Importing page translations from lang/custom/page/...');
    $this->command->info('Locales: ' . implode(', ', $this->locales));

    // Count total JSON files
    $totalFiles = 0;
    foreach($this->locales as $locale){
      $localePath = $this->basePath . '/' . $locale;
      if(File::isDirectory($localePath)){
        $files = File::files($localePath);
        foreach($files as $file){
          if($file->getExtension() === 'json'){
            $totalFiles++;
          }
        }
      }
    }

    if($totalFiles === 0){
      $this->command->warn('No JSON files found.');
      return;
    }

    $progressBar = $this->command->getOutput()->createProgressBar($totalFiles);
    $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %message%');
    $progressBar->setMessage('Starting...');
    $progressBar->start();

    $importedCount = 0;
    $importedFiles = [];

    foreach($this->locales as $locale){
      $localePath = $this->basePath . '/' . $locale;
      if(!File::isDirectory($localePath)){
        // Skip missing directories
        continue;
      }

      $files = File::files($localePath);
      foreach($files as $file){
        if($file->getExtension() !== 'json'){
          $progressBar->advance();
          continue;
        }

        $name = $file->getFilenameWithoutExtension();
        $content = File::get($file->getPathname());
        $translations = json_decode($content, true);

        if(is_array($translations)){
          PageTranslation::updateOrCreate(
            [
              'name' => $name, 
              'lang' => $locale
            ],
            [
              'text' => $translations, 
              // 'is_system' => true // Option
            ]
          );
          $importedCount++;
          $importedFiles[] = "{$name}.json ({$locale})";
          $progressBar->setMessage("Imported: {$name}.json ({$locale})");
        } else {
          $progressBar->setMessage("ERROR: {$file->getFilename()}");
          $this->command->error("\nInvalid JSON in: {$file->getPathname()}");
        }

        $progressBar->advance();
      }
    }

    $progressBar->finish();
    $this->command->newLine(2);

    // Show the list of imported files
    $this->command->info("Imported files (" . count($importedFiles) . "):");
    foreach($importedFiles as $file){
      $this->command->line("  - {$file}");
    }

    $this->command->newLine(1);
    $this->command->info("Done! Total imported/updated: {$importedCount} page translation records.");
  }
}

// php artisan db:seed --class=ImportPageTranslationsSeeder
