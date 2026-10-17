<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class SecureApiHeaders{
  public function handle(Request $req, Closure $next){
    $res = $next($req);
    // Total Obfuscation: Hide PHP/Laravel signatures from API scrapers too
    if(function_exists('header_remove')){
      header_remove('X-Powered-By');
    }
    $res->headers->remove('X-Powered-By');
    $res->headers->add([
      'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma' => 'no-cache',
      'X-Frame-Options' => 'DENY',
      'X-Content-Type-Options' => 'nosniff',
      'X-Robots-Tag' => 'noindex, nofollow, noai'
    ]);
    return $res;
  }
}