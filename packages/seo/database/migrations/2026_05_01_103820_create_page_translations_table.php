<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  /**
   * Run the migrations.
   */
  public function up(): void{
    Schema::create('page_translations', function(Blueprint $table){
      $table->id();

      /**
       * Page name or title, e.g 'login', 'register'.
       * Options column name: page, name
       */
      $table->string('name', 50);

      /**
       * Language code, e.g 'en', 'id'.
       */
      $table->string('lang', 5);

      /**
       * JSON column to store translations, full nested translation object
       */
      $table->json('text');

      /**
       * To check whether this line is user-made (custom) or not (default/core app)
       * By default false for initial installation.
       * 
       * Options: is_system | is_default | is_core | is_custom
       */
      // $table->boolean('is_system')->default(false);

      $table->timestamps();

      /**
       * One row per page name per language
       */
      $table->unique(['name', 'lang']);
    });
  }

  public function down(): void{
    Schema::dropIfExists('page_translations');
  }
};
