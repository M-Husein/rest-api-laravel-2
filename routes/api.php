<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\{
  AuthController,
  AuthSpaController,
  AuthTokenController,
  SessionController,
  RegisterController,
  TokenController,
  TranslationController,
  PageTranslationController,
  SocialAuthController,
  UserController,
  ArticleController,
  ContactController,
  LoginHistoriesController,
  ClearCacheController
};

Route::prefix('v1')->group(function(){
  Route::get('locales/{lang}/common', [TranslationController::class, 'getCommon']);

  // Public endpoint for frontend to fetch page translations
  Route::get('locales/{lang}/page/{name}', [PageTranslationController::class, 'getByPageLang']);
  Route::get('articles', [ArticleController::class, 'index']);
  Route::get('contacts', [ContactController::class, 'index']);

  // Public OAuth endpoints
  // $providerPattern = implode('|', array_keys(
  //   array_filter(
  //     config('services', []),
  //     fn($c) => is_array($c) && ($c['type'] ?? null) === 'auth'
  //   )
  // ));

  // SPA — get redirect URL
  // ✅ Redirect must be accessible by both guests AND authenticated users
  Route::post('auth/{provider}/redirect', [SocialAuthController::class, 'redirect']);
    // ->middleware('throttle:oauth');

  // Route::get('auth/{provider}/redirect', [SocialAuthController::class, 'redirect']);
    // ->where('provider', $providerPattern);

  // Mobile — send native SDK token, get Sanctum token back
  Route::post('auth/{provider}/mobile', [SocialAuthController::class, 'mobileCallback'])
    ->middleware(['throttle:login', 'throttle:oauth']);
    // ->where('provider', $providerPattern);

  Route::middleware('guest:sanctum')->group(function(){
    // SPA Auth (cookie / session based)
    Route::post('login', [AuthSpaController::class, 'login']);// ->middleware('throttle:login');

    Route::post('login/mobile', [AuthTokenController::class, 'login'])->middleware('throttle:login');

    // SPA & Mobile
    Route::post('register', RegisterController::class)->middleware('throttle:register');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:sensitive');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:sensitive');
  });

  Route::middleware('auth:sanctum')->group(function(){
    Route::get('me', [AuthController::class, 'me']);
    Route::put('me', [AuthController::class, 'updateUser']);

    // Set Password — for social-registered users with no password
    Route::post('me/password', [AuthController::class, 'setPassword']);

    Route::put('me/change-password', [AuthController::class, 'changePassword']);
    Route::post('me/avatar', [AuthController::class, 'updateAvatar']);
      // ->middleware('throttle:upload');
    Route::delete('me/avatar', [AuthController::class, 'deleteAvatar']);

    // Route::post('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    //   ->middleware('signed')
    //   ->name('verification.verify');
    Route::post('email/resend', [AuthController::class, 'resendVerification'])
      ->name('verification.resend')
      ->middleware('throttle:sensitive');
    
    Route::get('me/email/verify/{token}', [AuthController::class, 'verifyPendingEmail']);
    Route::delete('me/email/pending', [AuthController::class, 'cancelPendingEmail']);

    Route::post('logout', [AuthSpaController::class, 'logout']);
    Route::post('logout/all', [AuthSpaController::class, 'logoutAll']);
    Route::post('logout/mobile', [AuthTokenController::class, 'logout']);

    Route::get('auth/providers', [SocialAuthController::class, 'linkedProviders']);

    // Link / unlink provider (auth required)
    // auth/{provider}/link | auth/link/{provider}
    Route::post('auth/{provider}/link', [SocialAuthController::class, 'link']);
      // ->where('provider', $providerPattern);
    Route::delete('auth/providers/{provider}', [SocialAuthController::class, 'unlink']);
      // ->where('provider', $providerPattern);

    Route::delete('users/delete', [UserController::class, 'destroyMany'])
      ->middleware('role:Admin');
    Route::apiResource('users', UserController::class)
      ->middleware('role:Admin');

    // login_histories
    // 1. Frontend Telemetry (Ad-blocker evasion - strictly POST)
    Route::post('setup', [LoginHistoriesController::class, 'store']);

    // 2. Admin Dashboard Management (Strictly GET and DELETE)
    Route::delete('login-histories/delete', [LoginHistoriesController::class, 'destroyMany'])
      ->middleware('role:Admin');
    Route::apiResource('login-histories', LoginHistoriesController::class)
      ->except(['store','update'])
      ->middleware('role:Admin');

    Route::post('clear-cache', ClearCacheController::class)
      ->middleware('role:Admin');
  });

  // Session Management (SPA — web devices)
  Route::prefix('sessions')->name('sessions.')->middleware('auth:sanctum')->group(function(){
    Route::get('', [SessionController::class, 'index'])->name('index');
    Route::delete('current', [SessionController::class, 'destroyCurrent'])->name('destroy.current');
    Route::delete('others', [SessionController::class, 'destroyOthers'])->name('destroy.others');
    Route::delete('all', [SessionController::class, 'destroyAll'])->name('destroy.all');
    Route::delete('{sessionId}', [SessionController::class, 'destroy'])->name('destroy');
  });

  // Token Management (Mobile devices)
  Route::prefix('tokens')->name('tokens.')->middleware('auth:sanctum')->group(function(){
    Route::get('', [TokenController::class, 'index'])->name('index');
    Route::delete('current', [TokenController::class, 'destroyCurrent'])->name('destroy.current');
    Route::delete('all', [TokenController::class, 'destroyAll'])->name('destroy.all');
    Route::delete('{tokenId}', [TokenController::class, 'destroy'])->name('destroy');
  });

  // // Your app's protected API endpoints (add your own routes below)
  // Route::middleware('auth:sanctum')->group(function(){
  //   // Example: Route::apiResource('posts', PostController::class);
  // });
});