<?php
namespace Database\Seeders;

// use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder{
  public function run(): void{
    $this->call([
      LanguagesTableSeeder::class,
      ImportDefaultTranslationsSeeder::class,
      ImportPageTranslationsSeeder::class,
      RbacSeeder::class,
      UserSeeder::class,
    ]);
  }

  // // Default Laravel
  // use WithoutModelEvents;

  /**
   * Default Laravel
   * Seed the application's database.
   */
  // public function run(): void{
  //   // User::factory(10)->create();

  //   User::factory()->create([
  //     'name' => 'Test User',
  //     'email' => 'test@example.com',
  //   ]);
  // }
}

// php artisan db:seed
