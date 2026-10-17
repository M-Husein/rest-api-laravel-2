<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;

class SecurityHeaders{
  public function handle(Request $req, Closure $next){
    $nonce = base64_encode(random_bytes(16));
    Vite::useCspNonce($nonce);
    view()->share('nonce',$nonce);

    $res = $next($req);

    // Total Obfuscation: Remove PHP's default footprint entirely
    if(function_exists('header_remove')){
      header_remove('X-Powered-By');
    }
    $res->headers->remove('X-Powered-By');

    $heads = [
      'Cross-Origin-Opener-Policy' => 'same-origin-allow-popups',
      'Permissions-Policy' => 'usb=(), browsing-topics=(), accelerometer=(), gyroscope=(), magnetometer=(), midi=()',
      'Referrer-Policy' => 'strict-origin-when-cross-origin',
      'Vary' => 'Accept-Encoding',
      'X-Frame-Options' => 'SAMEORIGIN',
      'X-Content-Type-Options' => 'nosniff',
      'X-Permitted-Cross-Domain-Policies' => 'none',
      'X-XSS-Protection' => '0' // 1; mode=block - OPTION: deprecated in modern browsers
    ];

    $frameSrc = [
      "'self'",
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      "https://www.google.com/maps/"
    ];

    $csp = [
      // Fallback for all unmentioned directives
      "default-src 'self'",

      // Trust local scripts, nonced scripts, and scripts loaded dynamically by nonced scripts (Vite chunks)
      "script-src 'self' 'nonce-{$nonce}' 'strict-dynamic'",

      // Stylesheets (Allow bundled CSS + inline styles if required by UI libraries)
      // "style-src 'self' 'unsafe-inline'",

      // Allow external stylesheet files from your domain + nonced <style> tags
      "style-src-elem 'self' 'nonce-{$nonce}' https://fonts.googleapis.com",

      // Allow inline style="..." attributes (required for React style props)
      "style-src-attr 'unsafe-inline'",

      // Images & Fonts (Includes support for inline SVGs, Canvas blobs, base64 images)
      "img-src 'self' data: blob: https://*.gstatic.com https://*.googleapis.com",
      "frame-src " . implode(' ', $frameSrc),
      "font-src 'self' data: https://fonts.gstatic.com",

      "media-src 'self' blob:",

      // API calls & WebSockets (XHR/Fetch requests to your domain)
      "connect-src 'self'",

      // Security Hardening (OWASP Best Practices)
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'"
    ];

    // if(app()->environment('local')){
    //   // Logs CSP violations to browser console without actually blocking scripts
    //   $heads['Content-Security-Policy-Report-Only'] = implode('; ', $csp);
    // }

    if(app()->environment('production')){
      $heads = [
        ...$heads,
        // Force HTTPS
        'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
        'Content-Security-Policy' => implode('; ', $csp)
      ];
    }
    $res->headers->add($heads);
    return $res;
  }
}