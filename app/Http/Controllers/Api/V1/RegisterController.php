<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Models\User;

class RegisterController extends Controller{
  /**
   * Register
   * 
   * Works for both SPA and mobile.
   * SPA: call spaLogin after register.
   * Mobile: returns token directly.
   */
  public function __invoke(Request $request){
    $validated = $request->validate([
      'name' => 'required|string|max:150',
      'username' => [
        'nullable',
        'string',
        'min:3',
        'max:32',
        'regex:/^(?!.*[._-]{2})[a-zA-Z0-9][a-zA-Z0-9._-]{1,30}[a-zA-Z0-9]$/',
        'unique:users,username'
      ],
      'email' => 'required|string|email|max:255|unique:users,email',
      'password' => 'required|string|min:6|confirmed',
      'country' => 'sometimes|string|size:2|regex:/^[A-Z]{2}$/'
      // 'device_name' => 'sometimes|string|max:255' // optional, for mobile
    ]);

    // Generate username if not provided
    if(empty($validated['username'])){
      $validated['username'] = (new User)->generateUsername($validated['email']);
    }

    $user = User::create([
      'name' => $validated['name'],
      'username' => $validated['username'],
      'email' => $validated['email'],
      'password' => Hash::make($validated['password']),
      'country' => $validated['country'] ?? null
    ])
    ->assignRole(User::ROLE_MEMBER);

    // Fire registered event to send verification email (requires implements MustVerifyEmail)
    event(new Registered($user));
    return jsonSuccess($user);

    // // Mobile — return token if device_name provided
    // if($request->filled('device_name')){
    //   $token = $user->createToken(
    //     $request->device_name, 
    //     ['*'], 
    //     now()->addDays(30)
    //   );

    //   return jsonSuccess([
    //     'user' => $user,
    //     'token' => $token->plainTextToken,
    //     'expiresAt' => $token->accessToken->expires_at
    //   ]);
    // }

    // // SPA — just return user, frontend calls spaLogin next
    // return jsonSuccess(['user' => $user]);
  }

  // public function __invoke(Request $request){
  //   $validated = $request->validate([
  //     'name' => 'required|string|max:255',
  //     'email' => 'required|string|email|max:255|unique:users',
  //     'password' => 'required|string|min:6|confirmed',
  //     'country' => 'sometimes|string|size:2|regex:/^[A-Z]{2}$/'
  //   ]);

  //   $user = User::create([
  //     'name' => $validated['name'],
  //     'email' => $validated['email'],
  //     'password' => Hash::make($validated['password'])
  //   ]);

  //   // Fire registered event to send verification email (requires implements MustVerifyEmail)
  //   event(new Registered($user));

  //   return jsonSuccess(
  //     $user, 
  //     'Registration successful. Please verify your email before logging in.'
  //   );

  //   // You can optionally log the user in or return a token
  //   // For now, just return the user (no token)
  //   // return jsonSuccess($user, 'Registration successful. Please login.', 201);
  // }
}