<?php
namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;
use Dedoc\Scramble\Attributes\ExcludeAllRoutesFromDocs;
use App\Facades\Spa;
use App\Models\PageTranslation;

#[ExcludeAllRoutesFromDocs]
class SpaController extends Controller{
  /**
   * Catch-all fallback — React 404 handles unknown routes.
   */
  public function index(){
    return Spa::render();
  }

  /**
   * Home page — includes WebSite + Organization schema
   */
  public function home(){
    return Spa::render()
      ->title(config('app.name'), '')
      ->description('Welcome to ' . config('app.name') . '. Your platform description here.')
      ->schemaWebSite()
      ->schemaOrganization();
  }

  /**
   * Contact page.
   */
  public function contact(){
    $key = "contact-us";
    $content = $this->getByPageLang($key);

    return Spa::render()
      ->title($content['title'] ?? 'Contact Us')
      ->description($content['desc'] ?? '')
      ->schemaBreadcrumb([
        ['name' => 'Home', 'url' => config('app.url')],
        ['name' => 'Contact', 'url' => request()->url()]
      ])
      ->props([
        'key' => $key,
        'content' => $content
      ]);
  }

  /**
   * About page.
   */
  public function about(){
    return Spa::render()
      ->title('About Us')
      ->description('Learn more about who we are and what we do.')
      ->schemaBreadcrumb([
        ['name' => 'Home', 'url' => config('app.url')],
        ['name' => 'About Us', 'url' => request()->url()]
      ]);
  }

  /**
   * Login page — noindex (guest only).
   */
  public function login(){
    return Spa::render()
      ->title('Sign In')
      ->description('Sign in to your account.')
      ->noIndex();
  }

  /**
   * Register page — noindex (guest only).
   */
  public function register(){
    return Spa::render()
      ->title('Create Account')
      ->description('Create a new account and get started.')
      ->noIndex();
  }

  /**
   * Forgot password page — noindex (guest only).
   */
  public function forgotPassword(){
    return Spa::render()
      ->title('Forgot Password')
      ->description('Reset your account password.')
      ->noIndex();
  }

  /**
   * Settings page — noindex (auth only).
   */
  public function settings(){
    return Spa::render()
      ->title('Settings')
      ->description('Manage your account settings.')
      ->noIndex();
  }

  /**
   * Admin dashboard — separate shell view, noindex.
   */
  public function dashboard(){
    return Spa::admin()
      ->title('Dashboard')
      ->description('Admin dashboard.')
      ->noIndex();
  }

  public function getByPageLang(string $name){
    $data = PageTranslation::where('name', $name)
      ->where('lang', app()->getLocale())
      ->first();

    // dd($data);

    return $data ? $data->text : [];
  }
}