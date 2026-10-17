<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  public function up(){
    Schema::create('user_providers', function(Blueprint $table){
      $table->id();

      $table->foreignId('user_id')
            ->constrained('users')
            ->cascadeOnDelete();

      /**
       * Provider, e.g: 'google', 'facebook', 'github'
       */
      $table->string('provider', 32);

      /**
       * Provider User ID, unique ID from provider
       */
      $table->string('provider_id', 191);

      /**
       * Extra provider data (avatar, token, etc.)
       */
      $table->json('data')->nullable();

      $table->timestamps();

      /**
       * Constraints
       */

      // Prevent duplicate provider account globally
      $table->unique([
        'provider',
        'provider_id'
      ]);

      // Prevent same user linking same provider twice
      $table->unique([
        'user_id',
        'provider'
      ]);

      /**
       * Indexes
       */
      $table->index('provider');
    });
  }

  public function down(){
    Schema::dropIfExists('user_providers');
  }
};