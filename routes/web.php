<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\{
  AuthSpaController,
  SocialAuthController
};

Route::get('auth/{provider}/callback', [SocialAuthController::class, 'callback']);

Route::get('email/verify/{id}/{hash}', [AuthSpaController::class, 'verifyEmail'])
  ->middleware(['signed','throttle:6,1'])
  ->name('verification.verify');
