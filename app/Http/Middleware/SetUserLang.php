<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

/**
 * Apply the authenticated user's stored language preference.
 *
 * Must run AFTER the auth middleware so $request->user() is resolved.
 * When the user has no language (or an unsupported one), the locale set
 * earlier by SetLang (Accept-Language / ?lang / default) is left intact.
 */
class SetUserLang{
  public function handle(Request $request, Closure $next){
    $lang = $request->user()?->lang;
    $locales = config('localizer.supported_locales', []);

    if($lang && in_array($lang, $locales, true)){
      app()->setLocale($lang);
    }

    return $next($request);
  }
}
