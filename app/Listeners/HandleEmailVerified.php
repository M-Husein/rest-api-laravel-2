<?php
namespace App\Listeners;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeVerified;

class HandleEmailVerified{
  public function handle(Verified $event): void{
    $user = $event->user;

    try{
      Mail::to($user->email)->send(new WelcomeVerified($user));
    }catch(\Throwable $e){
      Log::error('Failed to send welcome email after verification', [
        'user_id' => $user->id,
        'error' => $e->getMessage()
      ]);
    }
  }
}
