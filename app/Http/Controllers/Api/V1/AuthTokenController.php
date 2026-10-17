<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
// use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Traits\HasLoginIdentifier;

/**
 * @tags Authentication
 */
class AuthTokenController extends Controller{
  use HasLoginIdentifier;

  /**
   * Mobile Login.
   * 
   * Accepts email, username, or phone number as identifier.
   * Returns a Sanctum Bearer token.
   * 
   * @unauthenticated
   */
  public function login(Request $request){
    $request->validate([
      'identifier' => $this->identifierRule(),
      'password' => 'required|string',
      'device_name' => 'sometimes|string|max:255' // optional, for identifying the device
    ]);

    $user = $this->findUserByIdentifier($request->identifier);

    if(!$user || !Hash::check($request->password, $user->password)){
      throw ValidationException::withMessages([
        'identifier' => [__('auth.failed')]
      ]);
    }

    $expire = config('sanctum.expiration');
    $deviceName = $request->input('device_name', $request->userAgent());

    // Remove any existing token for this device to prevent duplicates
    if($deviceName){
      $user->tokens()->where('name', $deviceName)->delete();
    }

    $token = $user->createToken(
      $deviceName ?? 'unknown',
      ['*'],
      now()->addDays($expire)
    );

    return jsonSuccess([
      'user' => $user,
      'token' => $token->plainTextToken,
      'expiresAt' => $token->accessToken->expires_at
    ]);
  }

  /**
   * Mobile Logout
   * 
   * Revoke current device token only.
   */
  public function logout(Request $request){
    $request->user()->currentAccessToken()->delete();
    return jsonSuccess();
  }
}