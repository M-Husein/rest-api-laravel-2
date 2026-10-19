<?php

use Illuminate\Support\Facades\Route;
use Programmeria\Seo\Http\Controllers\SpaController;

Route::middleware('web')->group(function () {
    Route::localize(function () {
        Route::get('/', [SpaController::class, 'home'])->name('home');
        Route::get('about', [SpaController::class, 'about']);
        Route::get('articles', [SpaController::class, 'index']);
        Route::get('contact-us', [SpaController::class, 'contact']);
    });
});
