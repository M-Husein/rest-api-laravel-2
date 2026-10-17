<?php
return [
  /*
  |--------------------------------------------------------------------------
  | Third Party Services
  |--------------------------------------------------------------------------
  | This file is for storing the credentials for third party services such
  | as Mailgun, Postmark, AWS and more. This file provides the de facto
  | location for this type of information, allowing packages to have
  | a conventional file to locate the various service credentials.
  */
  // CUSTOM
  'google' => [
    'type' => 'auth',
    'scopes' => ['openid','profile','email'],
    'with' => [
      'prompt' => 'select_account'
    ],
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI')
  ],
  // 'facebook' => [
  //   'type' => 'auth',
  //   'scopes' => ['email'],
  //   // 'fields' => ['name','email'],
  //   'client_id' => env('FACEBOOK_CLIENT_ID'),
  //   'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
  //   'redirect' => env('FACEBOOK_REDIRECT_URI')
  // ],
  // 'linkedin' => [
  //   'type' => 'auth',
  //   'client_id' => env('LINKEDIN_CLIENT_ID'),
  //   'client_secret' => env('LINKEDIN_CLIENT_SECRET'),
  //   'redirect' => env('LINKEDIN_REDIRECT_URI')
  // ],
  // 'github' => [
  //   'type' => 'auth',
  //   'scopes' => ['read:user', 'user:email'],
  //   'client_id' => env('GITHUB_CLIENT_ID'),
  //   'client_secret' => env('GITHUB_CLIENT_SECRET'),
  //   'redirect' => env('GITHUB_REDIRECT_URI')
  // ],
  // Add more providers here as needed (e.g., twitter/X, microsoft, etc.)

  // 'postmark' => [
  //   'key' => env('POSTMARK_API_KEY')
  // ],
  // 'ses' => [
  //   'key' => env('AWS_ACCESS_KEY_ID'),
  //   'secret' => env('AWS_SECRET_ACCESS_KEY'),
  //   'region' => env('AWS_DEFAULT_REGION', 'us-east-1')
  // ],
  // 'resend' => [
  //   'key' => env('RESEND_API_KEY')
  // ],
  // 'slack' => [
  //   'notifications' => [
  //     'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
  //     'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL')
  //   ]
  // ]
];