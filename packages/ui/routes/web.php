<?php

use Illuminate\Support\Facades\Route;
use Programmeria\Ui\Http\Controllers\UiController;

Route::middleware('web')->group(function () {
    Route::localize(function () {
        Route::middleware('guest')->group(function () {
            Route::get('login', [UiController::class, 'login']);
            Route::get('register', [UiController::class, 'register']);
            Route::get('forgot-password', [UiController::class, 'forgotPassword']);
        });

        Route::middleware('auth')->group(function () {
            Route::get('settings/{any?}', [UiController::class, 'settings'])->where('any', '.*');
        });
    });

    Route::get('reset-password', [UiController::class, 'resetPassword'])
        ->middleware('guest')
        ->name('password.reset');

    Route::get('app/{any?}', [UiController::class, 'dashboard'])
        ->where('any', '.*')
        ->middleware(['auth', 'role:Admin']);
});
