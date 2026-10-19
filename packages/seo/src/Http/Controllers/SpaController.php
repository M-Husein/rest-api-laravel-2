<?php
namespace Programmeria\Seo\Http\Controllers;
use Illuminate\Routing\Controller;
use Dedoc\Scramble\Attributes\ExcludeAllRoutesFromDocs;
use Programmeria\Seo\Facades\Spa;
use Programmeria\Seo\Models\PageTranslation;

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

  public function getByPageLang(string $name){
    $data = PageTranslation::where('name', $name)
      ->where('lang', app()->getLocale())
      ->first();

    // dd($data);

    return $data ? $data->text : [];
  }
}