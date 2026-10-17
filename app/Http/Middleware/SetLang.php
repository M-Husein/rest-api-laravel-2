<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class SetLang{
  public function handle(Request $request, Closure $next){
    /**
     * Priority
     * 1. Accept-Language header
     * 2. Query param ?lang=
     * 3. Default locale
     */
    $defaultLang = config('app.fallback_locale', 'en');
    $locales = config('localizer.supported_locales', [$defaultLang]);
    $lang = $request->getPreferredLanguage($locales);
    if(!$lang){
      $lang = $request->query('lang');
      if(!in_array($lang, $locales)){
        $lang = $defaultLang;
      }
    }
		app()->setLocale($lang);
		return $next($request);
  }
}