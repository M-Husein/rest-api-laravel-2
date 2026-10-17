<?php
return [
  /*
  |--------------------------------------------------------------------------
  | Cross-Origin Resource Sharing (CORS) Configuration
  |--------------------------------------------------------------------------
  | Here you may configure your settings for cross-origin resource sharing
  | or "CORS". This determines what cross-origin operations may execute
  | in web browsers. You are free to adjust these settings as needed.
  |
  | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
  */
  'paths' => ['api/*', 'sanctum/csrf-cookie'],
  'allowed_methods' => ['*'],

  // 'allowed_origins' => ['*'],
  'allowed_origins' => [
    'http://localhost:8000',
    // 'https://your-spa-domain.com', // Your SPA's exact production origin
    'http://localhost:5173', // Your SPA's exact local development origin
    'http://127.0.0.1:5173',
  ],
  'allowed_origins_patterns' => [],
  'allowed_headers' => ['*'],
  'exposed_headers' => [],
  'max_age' => 0,

  /*
  |--------------------------------------------------------------------------
  | Expiration Minutes
  |--------------------------------------------------------------------------
  | Token expiration for mobile tokens.
  | null = never expire (not recommended for production).
  | Set to minutes, e.g. 60 * 24 * 30 = 30 days.
  |--------------------------------------------------------------------------
  */
  'supports_credentials' => true // Default false
];