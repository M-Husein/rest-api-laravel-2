<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  public function up(): void{
    Schema::create('articles', function(Blueprint $table){
      /**
       * $table->ulid()->primary();
       * or
       * $table->uuid()->primary();
       */
      $table->id();
      
      $table->string('title');
      
      // Essential for SEO and friendly URLs. Generate from title.
      $table->string('slug')->unique();

      /**
       * Short summary, up to 65k chars. Use text for flexibility.
       * Column name: description or desc
       */
      $table->text('desc')->nullable();

      // For markdown/HTML/JSON. longText holds up to 4GB.
      $table->longText('content');

      // Publish status.
      $table->boolean('is_active')->default(false);

      // Allows scheduling.
      $table->timestamp('published_at')->nullable();

      // Optional analytics.
      $table->integer('view_count')->default(0);

      $table->timestamps();

      // Safely recover deleted
      $table->softDeletes();
    });
  }

  public function down(): void{
    Schema::dropIfExists('articles');
  }
};
