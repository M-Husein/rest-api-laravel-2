<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  /**
   * Run the migrations.
   */
  public function up(): void{
    Schema::create('users', function(Blueprint $table){
      $table->id();
      /**
       * OR
       */
      // $table->uuid('id')->primary();

      /**
       * User's display name or fullname.
       * Default 255 (not second arg)
       */
      $table->string('name', 150);

      $table->string('email', 255)->unique();
      $table->timestamp('email_verified_at')->nullable();

      /**
       * Option: For implementation of change email
       */
      $table->string('pending_email', 255)->nullable();
      
      /**
       * Default Laravel
       */
      // $table->string('password');

      /**
       * Implement social auth can register/login without password, 
       * and can set password later.
       */
      $table->string('password')->nullable();

      /**
       * 15 (base) + 17 (timestamp) = 32 characters
       * 
       * OR 40
       * 
       * Why 40?
       * - Enough to fit every possible generated username you’ll ever produce.
       * - Slight extra room for future format changes.
       * - Short enough for a highly efficient index — small indexes are faster in lookups and comparisons.
       * - Well under MySQL’s utf8mb4 index limit (191 characters), so safe on all storage engines.
       */
      $table->string('username', 32)->unique();

      /**
       * User avatar / profile picture
       * Option: ->default('/user.svg') to set default
       */
      $table->string('avatar', 255)->nullable();

      /**
       * Option: For theme light or dark
       * 
       * Why 6 ??
       * Just using 'system', 'dark', or 'light'
       * 
       * Why 20 ??
       * 'high-contrast' (15 characters)
       * 'corporate-blue' (15 characters)
       * 'solarized-light' (16 characters)
       */
      // $table->string('theme', 6)->default('light');

      /**
       * E.164 standard (recommended for storage)
       * The international ITU-T E.164 standard allows:
       * - Up to 15 digits max
       * - Including country code
       * - No spaces, dashes, or symbols (just + prefix optionally, though not counted in the 15-digit limit)
       * 
       * Example:
       * +14155552671       -> 11 digits (US number)
       * +628123456789012   -> 15 digits (longest in Indonesia)
       */
      $table->string('phone', 16)->nullable();

      $table->timestamp('phone_verified_at')->nullable();

      /**
       * Country as a 2‑character code follows the ISO 3166-1 alpha-2 standard (e.g., US, ID, GB). 
       * It’s compact, consistent, and easy to validate.
       * 
       * Add an index on country if you plan to filter/frequently query users by country
       */
      $table->string('country', 2)->nullable()->index();

      /**
       * Add an index on city if you plan to filter/frequently query users by city
       */
      $table->string('city', 100)->nullable()->index();

      /**
       * Short description for their profile.
       */
      $table->string('bio', 250)->nullable();

      /**
       * Option: For Social Auth only 1 provider
       * 
       * Add generic columns for social login.
       * provider (provider_name)
       */
      // $table->string('provider')->nullable();
      // $table->string('provider_id')->nullable();

      /**
       * Added for soft delete support
       */
      $table->softDeletes();
      
      $table->rememberToken();

      /**
       * For login alert
       * 
       * ->after('remember_token');
       */
      // $table->timestamp('last_login_at')->nullable();

      $table->timestamps();

      /**
       * Option: For Social Auth only 1 provider
       * 
       * Add a unique constraint for the provider and provider_id combination
       * This ensures a user can only have one social login from a given provider linked this way.
       */
      // $table->unique(['provider', 'provider_id']);
    });

    Schema::create('password_reset_tokens', function(Blueprint $table){
      $table->string('email')->primary();
      $table->string('token');
      $table->timestamp('created_at')->nullable();
    });

    Schema::create('sessions', function(Blueprint $table){
      $table->string('id')->primary();
      $table->foreignId('user_id')->nullable()->index();
      $table->string('ip_address', 45)->nullable();
      $table->text('user_agent')->nullable();
      $table->longText('payload');
      $table->integer('last_activity')->index();

      // Custom: to save navigator.userAgentData
      $table->json('uad')->nullable();
    });
  }

  public function down(): void{
    Schema::dropIfExists('users');
    Schema::dropIfExists('password_reset_tokens');
    Schema::dropIfExists('sessions');
  }
};
