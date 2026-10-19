<?php

namespace Programmeria\Ui\Http\Controllers;

use Illuminate\Routing\Controller;
use Dedoc\Scramble\Attributes\ExcludeAllRoutesFromDocs;
use Programmeria\Ui\Facades\Spa;

#[ExcludeAllRoutesFromDocs]
class UiController extends Controller
{
    /**
     * Catch-all fallback — React 404 handles unknown routes.
     */
    public function index()
    {
        return Spa::render();
    }

    /**
     * Login page — noindex (guest only).
     */
    public function login()
    {
        return Spa::render()
            ->title('Sign In')
            ->description('Sign in to your account.')
            ->noIndex();
    }

    /**
     * Register page — noindex (guest only).
     */
    public function register()
    {
        return Spa::render()
            ->title('Create Account')
            ->description('Create a new account and get started.')
            ->noIndex();
    }

    /**
     * Forgot password page — noindex (guest only).
     */
    public function forgotPassword()
    {
        return Spa::render()
            ->title('Forgot Password')
            ->description('Reset your account password.')
            ->noIndex();
    }

    /**
     * Reset password page — noindex (guest only).
     */
    public function resetPassword()
    {
        return Spa::render()
            ->title('Reset Password')
            ->description('Choose a new password for your account.')
            ->noIndex();
    }

    /**
     * Settings page — noindex (auth only).
     */
    public function settings()
    {
        return Spa::render()
            ->title('Settings')
            ->description('Manage your account settings.')
            ->noIndex();
    }

    /**
     * Admin dashboard — separate shell view, noindex.
     */
    public function dashboard()
    {
        return Spa::admin()
            ->title('Dashboard')
            ->description('Admin dashboard.')
            ->noIndex();
    }
}
