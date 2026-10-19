<?php

use Illuminate\Support\Facades\Route;
use Programmeria\Seo\Http\Controllers\SpaController;

Route::middleware('web')->group(function () {
    Route::localize(function () {
        Route::middleware('guest')->group(function () {
            Route::get('login', [SpaController::class, 'login']);
            Route::get('register', [SpaController::class, 'register']);
            Route::get('forgot-password', [SpaController::class, 'forgotPassword']);
        });

        Route::get('/', [SpaController::class, 'home'])->name('home');
        Route::get('about', [SpaController::class, 'about']);
        Route::get('articles', [SpaController::class, 'index']);
        Route::get('contact-us', [SpaController::class, 'contact']);

        Route::middleware('auth')->group(function () {
            Route::get('settings/{any?}', [SpaController::class, 'settings'])->where('any', '.*');
        });
    });

    Route::get('reset-password', [SpaController::class, 'index'])
        ->middleware('guest')
        ->name('password.reset');

    Route::get('app/{any?}', [SpaController::class, 'dashboard'])
        ->where('any', '.*')
        ->middleware(['auth', 'role:Admin']);
});
