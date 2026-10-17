<?php
namespace App\Listeners;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class HandleFailedLogin{
  public function handle(Failed $event): void{
    $ip = request()->ip();
    $identifier = request()->input('identifier','unknown');

    // Track failed attempts per IP in cache
    $ipKey = "failed_login_ip:$ip";
    $identifierKey = "failed_login_id:$identifier:$ip";

    $ipAttempts = Cache::increment($ipKey);
    $identifierAttempts = Cache::increment($identifierKey);

    // Set TTL only on first increment (15 min window)
    if($ipAttempts === 1) Cache::expire($ipKey, 900);
    if($identifierAttempts === 1) Cache::expire($identifierKey, 900);

    // Log suspicious activity after threshold
    if($ipAttempts >= 10){
      Log::warning('Suspicious login activity — possible brute force', [
        'ip' => $ip,
        'identifier' => $identifier,
        'ip_attempts' => $ipAttempts,
        'identifier_attempts' => $identifierAttempts,
        'user_agent' => request()->userAgent()
      ]);
    }
  }
}