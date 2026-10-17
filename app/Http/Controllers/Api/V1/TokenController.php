<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * @tags Tokens
 */
class TokenController extends Controller{
  /**
   * List all active tokens (mobile devices) for the authenticated user.
   */
  public function index(Request $request){
    $tokens = $request->user()
      ->tokens()
      ->orderByDesc('last_used_at')
      ->get()
      ->map(fn($token) => [
        'id' => $token->id,
        'name' => $token->name, // device name
        'last_used' => $token->last_used_at?->diffForHumans() ?? 'Never',
        'expires_at' => $token->expires_at?->toDateTimeString() ?? 'Never',
        'created_at' => $token->created_at, // ->toDateTimeString(),
        'is_current' => $token->id === $request->user()->currentAccessToken()?->id
      ]);

    return jsonSuccess($tokens);
  }

  /**
   * Revoke the current device token.
   */
  public function destroyCurrent(Request $request){
    $request->user()->currentAccessToken()->delete();
    return jsonSuccess(); // ['message' => 'Current device logged out.']
  }

  /**
   * Revoke all tokens (logout from all mobile devices).
   */
  public function destroyAll(Request $request){
    $request->user()->tokens()->delete();
    return jsonSuccess(); // null, 'Logged out from all devices.'
  }

  /**
   * Revoke a specific token by ID.
   */
  public function destroy(Request $request, int $tokenId){
    $deleted = $request->user()
      ->tokens()
      ->where('id', $tokenId)
      ->delete();

    if(!$deleted) return jsonError('Token not found.', 404);
    return jsonSuccess();
  }
}