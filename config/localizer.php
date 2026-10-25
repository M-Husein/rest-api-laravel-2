<?php
// use NielsNumbers\LaravelLocalizer\Detectors\{UserDetector,BrowserDetector};
$locales = [
  'en' => 'English',
  'id' => 'Indonesia'
];
return [
  'supported_locales' => array_keys($locales),
  'hide_default_locale' => true,
  'redirect_enabled' => true,
  'persist_locale' => [
    'session' => false,
    'cookie' => false
  ],
  // Empty detectors means no auto-overriding from browser headers
  'detectors' => [
    // BrowserDetector::class, // Browser Accept-Language header
    // UserDetector::class // Keep only if logged-in users have a $user->locale column
  ],
  'locale_directions' => [],
  // CUSTOM: Add supported locales with code => name
  'locales' => $locales
];