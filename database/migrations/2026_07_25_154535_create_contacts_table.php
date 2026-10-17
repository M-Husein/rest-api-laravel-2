<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  /**
   * Run the migrations.
   */
  public function up(): void{
    Schema::create('contacts', function(Blueprint $table){
      $table->id();

      // e.g. "Email", "Instagram"
      $table->string('label');

      // e.g. "john@example.com"
      $table->string('value');

      // e.g. "email", "phone", "link", "social"
      $table->string('type')->nullable();

      // URL or path
      $table->string('icon')->nullable();

      // For sort or order
      $table->integer('sort')->default(0);
      $table->timestamps();

      // optional
      // $table->softDeletes();
    });
  }

  public function down(): void{
    Schema::dropIfExists('contacts');
  }
};
