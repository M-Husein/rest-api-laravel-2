<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth,Hash,DB};
// use Illuminate\Validation\ValidationException;
use App\Traits\HasLoginIdentifier;

/**
 * @tags Authentication
 */
class AuthSpaController extends Controller{
  use HasLoginIdentifier;

  /**
   * SPA Login
   * 
   * Accepts email, username, or phone number as identifier.
   * Frontend must call GET /sanctum/csrf-cookie first (or auto via csrfHook).
   * 
   * @unauthenticated
   */
  public function login(Request $request){
    $request->validate([
      'identifier' => $this->identifierRule(),
      'password' => 'required|string|min:6',
      'meta' => 'nullable|json|max:2048'
    ]);
 
    $user = $this->findUserByIdentifier($request->identifier);
 
    if(!$user || !Hash::check($request->password, $user->password)){
      // throw ValidationException::withMessages(['identifier' => [__('auth.failed')] ]);
      return jsonError(__('auth.failed'), 422);
    }
 
    Auth::login($user, $request->boolean('remember'));

    $sess = $request->session();
    $sess->regenerate();

    // Manually save the uad payload into the database session row
    if($request->has('uad')){
      $sess->save(); // Force save the current session to ensure the row exists

      DB::table('sessions')
        ->where('id', $sess->getId())
        ->update(['uad' => $request->input('uad')]);
    }
 
    return jsonSuccess($user);
  }

  /**
   * SPA Logout 
   * 
   * Logs out from current web session only.
   */
  public function logout(Request $request){
    Auth::guard('web')->logout();

    $sess = $request->session();
    $sess->invalidate();
    $sess->regenerateToken();

    return jsonSuccess();
  }

  /**
   * SPA Logout
   * 
   * Deletes all sessions from the database for this user.
   */
  public function logoutAll(Request $request){
    DB::table('sessions')
      ->where('user_id', $request->user()->id)
      ->delete();

    return jsonSuccess(); // 'Logged out from all devices'
  }

  // public function verifyEmail(Request $request, string $id, string $hash){
  //   $user = User::findOrFail($id);

  //   if(!hash_equals(sha1($user->getEmailForVerification()), $hash)){
  //     return jsonError('Invalid verification link.', 403);
  //   }

  //   if($user->hasVerifiedEmail()){
  //     return jsonError('Email already verified.');
  //   }

  //   $user->markEmailAsVerified();
  //   event(new Verified($user));

  //   return jsonSuccess(); // ['message' => 'Email verified successfully.']
  // }

  /**
   * Verify user email
   */
  #[ExcludeRouteFromDocs]
  public function verifyEmail(Request $request, string $id, string $hash){
    // Find the user. The signed URL check already ensures integrity.
    $user = $request->user() ?? User::findOrFail($id);

    // Check if the hash matches the user's email.
    if(!hash_equals((string) $hash, sha1($user->getEmailForVerification()))){
      abort(403, 'Invalid verification hash.');
    }

    // $redirectUrl = config('app.frontend_url') . '/verification';

    // If the user is already verified, just redirect.
    if($user->hasVerifiedEmail()){
      return redirect('/login'); // $redirectUrl . '?status=verified'
    }

    // Mark the email as verified.
    $user->markEmailAsVerified();
    event(new Verified($user));

    return redirect('/verification?status=success');
  }
}