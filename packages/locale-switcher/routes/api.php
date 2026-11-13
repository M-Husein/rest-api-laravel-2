<?php

use Illuminate\Support\Facades\Route;
use Programmeria\LocaleSwitcher\Http\Controllers\LanguageController;
use Programmeria\LocaleSwitcher\Http\Controllers\LanguagePreferenceController;

Route::middleware('api')->prefix('api')->group(function () {
    Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
        Route::put('me/language', LanguagePreferenceController::class);

        Route::prefix('admin')->group(function () {
            Route::get('language-presets', [LanguageController::class, 'presets'])
                ->middleware('rbac:languages.view');
            Route::get('languages', [LanguageController::class, 'index'])
                ->middleware('rbac:languages.view');
            Route::post('languages', [LanguageController::class, 'store'])
                ->middleware('rbac:languages.manage');
            Route::get('languages/{code}', [LanguageController::class, 'show'])
                ->middleware('rbac:languages.view');
            Route::put('languages/{code}', [LanguageController::class, 'update'])
                ->middleware('rbac:languages.manage');
            Route::delete('languages/{code}', [LanguageController::class, 'destroy'])
                ->middleware('rbac:languages.manage');
            Route::post('languages/{code}/default', [LanguageController::class, 'setDefault'])
                ->middleware('rbac:languages.manage');
            Route::post('languages/{code}/sync', [LanguageController::class, 'sync'])
                ->middleware('rbac:languages.manage');
        });
    });
});
