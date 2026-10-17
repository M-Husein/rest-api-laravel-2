<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\SpaController;
use App\Http\Middleware\SetUserLang;
use App\Http\Controllers\Api\V1\{
  AuthSpaController,
  SocialAuthController
};

Route::localize(function(){
  // Guest only — redirect to /dashboard if already logged in
  Route::middleware('guest')->group(function(){
    Route::get('login', [SpaController::class, 'login']);
    Route::get('register', [SpaController::class, 'register']);
    Route::get('forgot-password', [SpaController::class, 'forgotPassword']);
    // Route::get('reset-password', [SpaController::class, 'index'])->name('password.reset');
  });

  // Public pages
  Route::get('/', [SpaController::class, 'home'])->name('home');
  Route::get('about', [SpaController::class, 'about']);
  Route::get('articles', [SpaController::class, 'index']);
  // Route::get('contact', [SpaController::class, 'contact']);
  Route::get('contact-us', [SpaController::class, 'contact']);

  // Auth required — redirect to /login if not logged in
  Route::middleware('auth')->group(function(){
    // Route::get('profile', [SpaController::class, 'profile']);
    Route::get('settings/{any?}', [SpaController::class, 'settings'])->where('any', '.*');

    // Dev
    // Route::get('editor', [SpaController::class, 'index']);
  });

  // Catch-all — must be last, lets React Router handle unknown routes
  // Route::get('/{any}', [SpaController::class, 'index'])->where('any', '.*');
});

// Public OAuth endpoints
// $providerPattern = implode('|', array_keys(
//   array_filter(
//     config('services', []),
//     fn($c) => is_array($c) && ($c['type'] ?? null) === 'auth'
//   )
// ));

Route::get('reset-password', [SpaController::class, 'index'])
  ->middleware('guest')
  ->name('password.reset');

Route::get('auth/{provider}/callback', [SocialAuthController::class, 'callback']);
// ->where('provider', $providerPattern);

Route::get('email/verify/{id}/{hash}', [AuthSpaController::class, 'verifyEmail'])
  // ->middleware('signed')
  ->middleware(['signed','throttle:6,1'])
  ->name('verification.verify');

// Admin dashboard
Route::get('app/{any?}', [SpaController::class, 'dashboard'])
  ->where('any', '.*')
  ->middleware(['auth','role:Admin',SetUserLang::class]);