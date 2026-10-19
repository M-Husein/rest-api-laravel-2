<?php

use Illuminate\Support\Facades\Route;
use Programmeria\Seo\Http\Controllers\PageTranslationController;

Route::middleware('api')->prefix('api')->group(function () {
    Route::prefix('v1')->group(function () {
        Route::get('locales/{lang}/page/{name}', [PageTranslationController::class, 'getByPageLang']);
    });
});
