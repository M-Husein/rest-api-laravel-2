<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash,Password};
use Illuminate\Support\{Str,Arr};
// use Illuminate\Validation\ValidationException;

/**
 * @tags Auth & Profile
 */
class AuthController extends Controller{
  /**
   * Get authenticated user
   * 
   * Works for both SPA and mobile.
   */
  public function me(Request $request){
    return jsonSuccess($request->user());
  }

  /**
   * Update authenticated user.
   */
  public function updateUser(Request $request){
    $user = $request->user();
    $validated = $request->validate([
      'name' => 'string|max:150',
      'username' => "string|max:32|unique:users,username,$user->id",
      'email' => "string|string|email|max:255|unique:users,email,$user->id|unique:users,pending_email,$user->id",
      'phone' => "nullable|string|max:16|unique:users,phone,$user->id",
      'bio' => 'nullable|string|max:250',
      'country' => 'nullable|string|size:2',
      'city' => 'nullable|string|max:100'
    ]);

    // Check email against the safe $validated array
    $emailChanged = !empty($validated['email']) 
      && $validated['email'] !== $user->email 
      && $validated['email'] !== $user->pending_email;

    // Prepare payload by excluding 'email', but keeping everything else that was validated
    $updateData = Arr::except($validated, ['email']);

    if($emailChanged) $updateData['pending_email'] = $validated['email'];

    // Perform a single database update
    $user->update($updateData);

    // Handle notifications/verification
    if($emailChanged) $user->sendPendingEmailVerification();

    return jsonSuccess($user->fresh());
    // // OR
    // return jsonSuccess([
    //   'user' => $user->fresh(),
    //   'emailChanged' => $emailChanged
    // ]); // , 'Profile updated.'
  }

  /**
   * Update authenticated user's language preference.
   */
  public function updateLanguage(Request $request){
    $user = $request->user();
    $validated = $request->validate([
      'lang' => 'required|string|in:' . implode(',', config('localizer.supported_locales'))
    ]);

    $user->update(['lang' => $validated['lang']]);

    return jsonSuccess($user->fresh());
  }

  /**
   * for social-registered users with no password
   */
  public function setPassword(Request $request){
    $user = $request->user();
    if(!empty($user->password)){
      return jsonError('Password already set. Use change password instead.', 422);
    }

    $validate = $request->validate([
      'password' => 'required|string|min:6|confirmed'
    ]);

    $user->update(['password' => Hash::make($validate['password'])]);
    return jsonSuccess(); // $user->fresh(), 'Password set successfully.'
  }

  /**
   * Cancel pending email change
   */
  public function cancelPendingEmail(Request $request){
    $request->user()->update(['pending_email' => null]);
    return jsonSuccess(); // null, 'Email change cancelled.'
  }

  /**
   * Verify pending email
   */
  public function verifyPendingEmail(Request $request, string $token){
    $user = $request->user();
    $cached = \Cache::get("pending_email_$user->id");

    if(!$cached || $cached['token'] !== $token){
      return jsonError('Invalid or expired verification link.', 422);
    }

    $user->update([
      'email' => $cached['email'],
      'pending_email' => null,
      'email_verified_at' => now()
    ]);

    \Cache::forget("pending_email_$user->id");
    return jsonSuccess(); // null, 'Email updated successfully.'
  }

  /**
   * Send password reset link to email.
   * 
   * @unauthenticated
   */
  public function forgotPassword(Request $request){
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink($request->only('email'));

    if($status !== Password::RESET_LINK_SENT){
      // throw ValidationException::withMessages([
      //   'email' => [__($status)]
      // ]);
      return jsonError(__($status), 422);
    }
    return jsonSuccess(); // null, __('notifs.forgotPassword')
  }

  /**
   * Reset password using token from email.
   */
  public function resetPassword(Request $request){
    $request->validate([
      'token' => 'required',
      'email' => 'required|email',
      'password' => 'required|string|min:6|confirmed'
    ]);

    $status = Password::reset(
      $request->only('email','password','password_confirmation','token'),
      function(User $user, string $password){
        $user->forceFill([
          'password' => Hash::make($password),
          'remember_token' => Str::random(60)
        ])->save();
      }
    );

    if($status !== Password::PASSWORD_RESET){
      // throw ValidationException::withMessages([
      //   'email' => [__($status)]
      // ]);
      return jsonError(__($status), 422);
    }
    return jsonSuccess(null, __($status));
  }

  /**
   * Change password after login.
   */
  public function changePassword(Request $request){
    $request->validate([
      'current_password' => 'required|string',
      'password' => 'required|string|min:6|confirmed'
    ]);
    if(!Hash::check($request->current_password, $request->user()->password)){
      return jsonError(__('auth.password'), 422);
    }
    $request->user()->update([
      'password' => Hash::make($request->password)
    ]);
    return jsonSuccess(); // null, 'Password changed successfully.'
  }

  /**
   * Verify email address.
   * (Request $request, string $id, string $hash)
   */
  #[ExcludeRouteFromDocs]
  public function verifyEmail(string $id, string $hash){
    $user = User::findOrFail($id);

    if(!hash_equals(sha1($user->getEmailForVerification()), $hash)){
      return jsonError('Invalid verification link.', 403);
    }

    if($user->hasVerifiedEmail()){
      return jsonError('Email already verified.');
    }

    $user->markEmailAsVerified();
    event(new Verified($user));

    return jsonSuccess(); // 'Email verified successfully.'
  }

  /**
   * Resend email verification link.
   */
  public function resendVerification(Request $request){
    if($request->user()->hasVerifiedEmail()){
      return jsonSuccess('Email already verified.'); // 'Email already verified.'
    }
    $request->user()->sendEmailVerificationNotification();
    return jsonSuccess(); // 'Verification link sent.'
  }

  public function updateAvatar(Request $request){
    $request->validate([
      'avatar' => 'required|image|mimes:jpeg,png,webp,gif|max:2048'
    ]);

    $user = $request->user();

    // Option: Delete old avatar file if exists
    // if($user->avatar){
    //   \Storage::disk('public')->delete('avatars/' . $user->avatar);
    // }

    // Store & save filename only
    $file = $request->file('avatar');
    $filename = $user->id . '_' . Str::uuid7() . '.' . $file->getClientOriginalExtension();
    $file->storeAs('avatars', $filename, 'public');
    $user->update(['avatar' => $filename]);

    return jsonSuccess($filename); // $user->fresh(), 'Avatar updated.'
  }

  public function deleteAvatar(Request $request){
    $user = $request->user();
    if($user->avatar){
      \Storage::disk('public')->delete('avatars/' . $user->avatar);
    }
    $user->update(['avatar' => null]);
    return jsonSuccess(null); // , 'Avatar removed.'
  }
}