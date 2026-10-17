<?php
namespace App\Listeners;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HandlePasswordReset{
  public function handle(PasswordReset $event): void{
    $user = $event->user;

    try{
      // Auto-logout all other sessions after password reset
      DB::table('sessions')
        ->where('user_id', $user->id)
        ->where('id', '!=', request()->session()->getId())
        ->delete();

      // Revoke all mobile tokens
      $user->tokens()->delete();

      Log::info('Password reset — all other sessions and tokens revoked', [
        'user_id' => $user->id
      ]);
    }catch(\Throwable $e){
      Log::error('Failed to revoke sessions after password reset', [
        'user_id' => $user->id,
        'error' => $e->getMessage()
      ]);
    }
  }
}