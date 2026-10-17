<?php
namespace App\Providers;

use Illuminate\Routing\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\{RateLimiter,Event,Gate};
use Illuminate\Auth\Notifications\ResetPassword;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\{OpenApi,SecurityScheme};
use Illuminate\Auth\Events\PasswordReset;
use App\Listeners\{
  HandlePasswordReset,
  // HandleFailedLogin,
  // HandleSuccessfulLogin,
  // HandleEmailVerified
};

class AppServiceProvider extends ServiceProvider{
  /**
   * Register any application services.
   */
  public function register(): void{
    
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void{
    /**
     * Auth — Brute force protection
     * 5 attempts per minute per IP + email combination
     */
    RateLimiter::for('login', function(Request $request){
      return [
        Limit::perMinute(5)->by($request->ip()),
        Limit::perMinute(3)->by(
          $request->input('identifier', '') . '|' . $request->ip()
        )
      ];
    });

    // Registration — prevent mass account creation
    RateLimiter::for('register', function(Request $request){
      return Limit::perHour(10)->by($request->ip());
    });

    /**
     * Sensitive — password reset, email verification resend
     * Slow enough to prevent abuse, not so slow it frustrates real users
     */
    RateLimiter::for('sensitive', function(Request $request){
      return [
        Limit::perMinute(3)->by($request->ip()),
        Limit::perHour(10)->by($request->ip())
      ];
    });

    // Social OAuth — prevent redirect spam
    RateLimiter::for('oauth', function(Request $request){
      return Limit::perMinute(10)->by($request->ip());
    });

    // Upload — prevent storage abuse
    RateLimiter::for('upload', function(Request $request){
      return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
    });

    /**
     * Mutations — write operations (POST, PUT, PATCH, DELETE)
     * Per authenticated user
     */
    RateLimiter::for('mutations', function(Request $request){
      return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
    });

    /**
     * API general — read operations
     * Higher limit for authenticated users vs guests
     */
    RateLimiter::for('api', function(Request $request){
      return $request->user()
        ? Limit::perMinute(120)->by($request->user()->id)
        : Limit::perMinute(30)->by($request->ip());
    });

    // Failed login — brute force detection and logging
    // Event::listen(Failed::class, HandleFailedLogin::class);

    // Successful login — clear failed counters, update last_login_at,
    // detect new IP and send security alert email
    // Event::listen(Login::class, HandleSuccessfulLogin::class);

    // Password reset — auto-revoke all other sessions and tokens
    Event::listen(PasswordReset::class, HandlePasswordReset::class);

    // Email verified — send welcome email
    // Event::listen(Verified::class, HandleEmailVerified::class);

    // Fix password reset link to point to SPA
    ResetPassword::createUrlUsing(function($user, string $token){
      return config('app.url') . '/reset-password?' . http_build_query([
        'token' => $token,
        'email' => $user->getEmailForPasswordReset()
      ]);
    });

    Scramble::configure()
      // Include only your versioned API routes
      ->routes(function(Route $route){
        return str_starts_with($route->uri, 'api/v1');
      })
      // Document both SPA cookie and Mobile Bearer token auth
      ->withDocumentTransformers(function(OpenApi $openApi){
        // Mobile — Bearer token
        $openApi->components->securitySchemes['mobile'] = SecurityScheme::http('bearer');

        // SPA cookie auth — documented as API key (X-XSRF-TOKEN)
        $openApi->components->securitySchemes['spa'] = SecurityScheme::apiKey('header', 'X-XSRF-TOKEN');

        // Default: Bearer token for testing in docs UI
        $openApi->secure(SecurityScheme::http('bearer'));
      });

    // Control who can access docs
    Gate::define('viewApiDocs', function(){ // $user = null
      return app()->environment('local');

      // Only authenticated admins in production
      // Production: return $user?->is_admin;

      // OR

      // if(app()->environment('production')){
      //   return $user?->is_admin === true;
      // }
      // return true; // everyone in local

      /**
       * Export current spec to file:
       * php artisan scramble:export --path=docs/openapi.json
       */
    });
  }
}