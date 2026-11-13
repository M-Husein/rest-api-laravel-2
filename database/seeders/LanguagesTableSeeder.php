<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Programmeria\LocaleSwitcher\Models\Language;

class LanguagesTableSeeder extends Seeder{
  public function run(): void{
    $rows = [
      ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'direction' => 'ltr', 'is_active' => true, 'is_default' => true, 'sort_order' => 0],
      ['code' => 'id', 'name' => 'Indonesia', 'native_name' => 'Indonesia', 'direction' => 'ltr', 'is_active' => true, 'is_default' => false, 'sort_order' => 1],
    ];

    foreach($rows as $row){
      Language::updateOrCreate(['code' => $row['code']], $row);
    }
  }
}

// php artisan db:seed --class=Database\\Seeders\\LanguagesTableSeeder
