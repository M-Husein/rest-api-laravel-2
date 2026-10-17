<?php
namespace App\Listeners;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewLoginAlert;

class HandleSuccessfulLogin{
  public function handle(Login $event): void{
    $user = $event->user;
    $ip = request()->ip();
    $userAgent = request()->userAgent();

    // Clear failed login counters on successful login
    Cache::forget("failed_login_ip:$ip");
    Cache::forget("failed_login_id:{$user->email}:$ip");

    // Track last login
    $user->updateQuietly(['last_login_at' => now()]);

    // Detect login from a new IP — send security alert email
    $knownIps = Cache::get("known_ips:{$user->id}", []);

    if(!in_array($ip, $knownIps)){
      // Add new IP to known list (keep last 10)
      $knownIps = array_slice([...$knownIps, $ip], -10);
      Cache::put("known_ips:{$user->id}", $knownIps, now()->addDays(90));

      // Skip alert on very first login (no known IPs before)
      if(count($knownIps) > 1){
        try{
          Mail::to($user->email)->send(new NewLoginAlert($user, $ip, $userAgent));
        }catch(\Throwable $e){
          Log::error('Failed to send login alert email', [
            'user_id' => $user->id,
            'error' => $e->getMessage()
          ]);
        }
      }
    }
  }
}
