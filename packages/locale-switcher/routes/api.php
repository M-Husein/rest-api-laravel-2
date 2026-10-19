<?php

use Illuminate\Support\Facades\Route;
use Programmeria\LocaleSwitcher\Http\Controllers\LanguagePreferenceController;

Route::middleware('api')->prefix('api')->group(function () {
    Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
        Route::put('me/language', LanguagePreferenceController::class);
    });
});
