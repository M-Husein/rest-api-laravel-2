<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\{User,UserProvider};
use App\Traits\HasSupportedProviders;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth,DB};
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Illuminate\Database\UniqueConstraintViolationException;

/**
 * @tags Auth / Social
 */
class SocialAuthController extends Controller{
  use HasSupportedProviders;

  /**
   * SPA — Step 1: Return OAuth redirect URL as JSON.
   * POST /api/v1/auth/{provider}/redirect
   */
  public function redirect(Request $request,string $provider){
    if(!$this->isSupportedProvider($provider)){
      return jsonError('Unsupported provider.', 422);
    }

    // Cache the frontend UAD payload inside the stateful session cookie
    if($request->has('uad')){
      $request->session()->put('oauth_uad', $request->input('uad'));
    }

    $driver = Socialite::driver($provider)
      ->scopes($this->scopesFor($provider));

    if($with = config("services.$provider.with")){
      $driver->with($with);
    }

    if($fields = config("services.$provider.fields")){
      $driver->fields($fields);
    }

    return jsonSuccess($driver->redirect()->getTargetUrl());
  }

  /**
   * SPA — Step 2: OAuth callback (web route — needs session).
   * GET /auth/{provider}/callback
   */
  public function callback(Request $request, string $provider){
    if(!$this->isSupportedProvider($provider)){
      return $this->redirectError($provider, 'unsupported_provider');
    }

    try{
      $socialiteUser = Socialite::driver($provider)->user();

      // Wrap in a transaction in case findOrCreateUser throws an error mid-creation
      $user = DB::transaction(function() use ($provider, $socialiteUser){
        return $this->findOrCreateUser($provider, $socialiteUser);
      });

      Auth::login($user, true);
      // Only this if not use save uad
      // $request->session()->regenerate();

      $sess = $request->session();
      
      // 3. pull() fetches the data and instantly removes it from the session storage
      $oauthUad = $sess->pull('oauth_uad');
      
      $sess->regenerate();

      if($oauthUad){
        $sess->save();

        DB::table('sessions')
          ->where('id', $sess->getId())
          ->update(['uad' => $oauthUad]);
      }

      return view('close-popup', ['provider' => $provider]);
    }catch(InvalidStateException $e){
      report($e);
      return $this->redirectError($provider, 'invalid_oauth_state');
    }catch(\Throwable $e){
      report($e);
      /**
       * @DEV : Need to redirect or view('close-popup') to close the window.open
       */
      return $this->redirectError($provider, 'authentication_failed');
    }
  }

  /**
   * Mobile — Send native SDK access_token, get Sanctum Bearer token back.
   * POST /api/v1/auth/{provider}/mobile
   * Body: { access_token: string, device_name: string }
   */
  public function mobileCallback(Request $request, string $provider){
    if(!$this->isSupportedProvider($provider)){
      return jsonError('Unsupported provider.', 422);
    }

    $request->validate([
      'access_token' => 'required|string',
      'device_name' => 'required|string|max:255'
    ]);

    try{
      $socialiteUser = Socialite::driver($provider)
        ->stateless()
        ->userFromToken($request->access_token);

      $user = $this->findOrCreateUser($provider, $socialiteUser);

      // Revoke existing token for same device to prevent duplicates
      $user->tokens()->where('name', $request->device_name)->delete();

      $token = $user->createToken(
        $request->device_name,
        ['*'],
        now()->addDays(7)
      );

      return jsonSuccess([
        'token' => $token->plainTextToken,
        'expires_at' => $token->accessToken->expires_at,
        'user' => $user
      ]);
    }catch(\Throwable $e){
      report($e);
      return jsonError('Authentication failed. Please try again.', 401);
    }
  }

  /**
   * Link a social provider to existing logged-in account.
   * POST /api/v1/auth/{provider}/link
   * Body (SPA):    {} — session cookie handles auth
   * Body (Mobile): { access_token: string }
   */
  public function link(Request $request, string $provider){
    if(!$this->isSupportedProvider($provider)){
      return jsonError('Unsupported provider.', 422);
    }

    $user = $request->user();

    if($user->hasProvider($provider)){
      return jsonError('Provider already linked.', 422);
    }

    try{
      $socialiteUser = Socialite::driver($provider);

      // Mobile sends access_token directly
      if($request->filled('access_token')){
        $socialiteUser = $socialiteUser
          ->stateless()
          ->userFromToken($request->access_token);
      }else{
        // SPA — session-based OAuth
        $socialiteUser = $socialiteUser->user();
      }

      DB::beginTransaction();

      // Check if this social account is already linked to another user
      $existingProvider = UserProvider::query()
        ->where('provider', $provider)
        ->where('provider_id', $socialiteUser->getId())
        ->first();

      if($existingProvider){
        DB::rollBack();
        return jsonError('This social account is already linked to another user.', 422);
      }

      $user->providers()->create([
        'provider' => $provider,
        'provider_id' => $socialiteUser->getId(),
        'data' => [
          // 'avatar' => $socialiteUser->getAvatar(),
          // 'nickname' => $socialiteUser->getNickname(),
          'name' => $socialiteUser->getName(),
          'email' => $socialiteUser->getEmail()
        ]
      ]);

      DB::commit();
      return jsonSuccess('Provider linked successfully.');
    }catch(\Throwable $e){
      DB::rollBack();
      report($e);
      return jsonError('Failed to link provider.', 500);
    }
  }

  /**
   * Unlink a social provider.
   * DELETE /api/v1/auth/providers/{provider}
   */
  public function unlink(Request $request, string $provider){
    $user = $request->user();
    $providerAccount = $user->providers()
      ->where('provider', $provider)
      ->first();

    if(!$providerAccount) return jsonError('Provider not linked.', 404);

    $hasPassword = !empty($user->password);
    $providerCount = $user->providers()->count();

    if(!$hasPassword && $providerCount <= 1){
      return jsonError('Cannot remove last login method. Please set a password first.', 422);
    }
    $providerAccount->delete();
    return jsonSuccess('Provider unlinked successfully.');
  }

  /**
   * List linked providers for current user.
   * GET /api/v1/auth/providers
   */
  public function linkedProviders(Request $request){
    $linked = $request->user()
      ->providers()
      ->get()
      ->map(fn($p) => [
        'provider' => $p->provider,
        // 'avatar' => $p->data['avatar'], // ?? null,
        'name' => $p->data['name'],
        'created_at' => $p->created_at
      ]);

    return jsonSuccess($linked);
  }

  /**
   * Shared: find existing or create new user from social profile.
   */
  private function findOrCreateUser(string $provider, $socialiteUser): User{
    $email = trim($socialiteUser->getEmail());
    if(empty($email)){
      throw new \RuntimeException('email_not_provided');
    }

    $providerId = $socialiteUser->getId();

    DB::beginTransaction();

    try {
      // 1. Existing provider link?
      $providerAccount = UserProvider::query()
        ->where('provider', $provider)
        ->where('provider_id', $providerId)
        ->first();

      if($providerAccount){
        $user = $providerAccount->user;
        if($user){
          DB::commit();
          return $user;
        }
        // Orphan provider – delete and continue
        $providerAccount->delete();
      }

      // 2. Find user by email (including soft‑deleted)
      $user = User::withTrashed()
        ->where('email', $email)
        ->first();

      // 3. If not found, case‑insensitive fallback (also with trashed)
      if(!$user){
        $user = User::withTrashed()
          ->whereRaw('LOWER(email) = ?', [strtolower($email)])
          ->first();
      }

      // 4. If user exists but is soft‑deleted, restore it
      if($user && $user->trashed()){
        $user->restore();
      }

      // 5. If still no user, create one
      if(!$user){
        $name = $socialiteUser->getName() ?: $socialiteUser->getNickname() ?: 'User';

        // Try to create, but catch duplicate key race condition
        try {
          $user = User::create([
            'name' => $name,
            'email' => $email,
            'username' => (new User)->generateUsername($email),
            'email_verified_at' => now(),
            'password' => null
          ])
          ->assignRole(User::ROLE_MEMBER);
        }catch(UniqueConstraintViolationException $e){
          // Another request inserted the user – fetch it now (with trashed)
          $user = User::withTrashed()->where('email', $email)->first();
          if(!$user){
            $user = User::withTrashed()
              ->whereRaw('LOWER(email) = ?', [strtolower($email)])
              ->first();
          }
          if(!$user){
            throw $e; // should not happen, but rethrow if still missing
          }
          if($user->trashed()){
            $user->restore();
          }
        }
      }

      // 6. Link the provider (avoid duplicates)
      $existing = UserProvider::query()
        ->where('provider', $provider)
        ->where('provider_id', $providerId)
        ->first();

      if(!$existing){
        $user->providers()->create([
          'provider' => $provider,
          'provider_id' => $providerId,
          'data' => [
            'name' => $socialiteUser->getName(),
            'email' => $email
          ]
        ]);
      }

      DB::commit();
      return $user;
    }catch(\Throwable $e){
      DB::rollBack();
      throw $e;
    }
  }

  // private function findOrCreateUser(
  //   string $provider,
  //   $socialiteUser
  // ): User{
  //   DB::beginTransaction();

  //   $email = $socialiteUser->getEmail();

  //   if(empty($email)){
  //     DB::rollBack();
  //     throw new \RuntimeException('email_not_provided');
  //   }

  //   $providerId = $socialiteUser->getId();

  //   // 1. Existing provider account → return its user
  //   $providerAccount = UserProvider::query()
  //     ->where('provider', $provider)
  //     ->where('provider_id', $providerId)
  //     ->first();

  //   if($providerAccount){
  //     DB::commit();
  //     return $providerAccount->user;
  //   }

  //   // 2. Logged-in user linking a new provider
  //   if(Auth::check()){
  //     $user = Auth::user();
  //     if($user->hasProvider($provider)){
  //       DB::rollBack();
  //       throw new \RuntimeException('provider_already_linked');
  //     }
  //   }else{
  //     // 3. Existing user by email → link provider to their account
  //     $user = User::query()->where('email', $email)->first();

  //     // 4. Brand new user — register
  //     if(!$user){
  //       $name = $socialiteUser->getName()
  //         ?: $socialiteUser->getNickname()
  //         ?: 'User';

  //       $user = User::create([
  //         'name' => $name,
  //         'email' => $email,
  //         'username' => (new User)->generateUsername($email),
  //         // 'avatar' => $socialiteUser->getAvatar(),
  //         'email_verified_at' => now(),
  //         'password' => null
  //       ]);
  //     }
  //   }

  //   // Link the provider
  //   $user->providers()->create([
  //     'provider' => $provider,
  //     'provider_id' => $providerId,
  //     'data' => [
  //       // 'avatar' => $socialiteUser->getAvatar(),
  //       // 'nickname' => $socialiteUser->getNickname(),
  //       'name' => $socialiteUser->getName(),
  //       'email' => $email
  //     ]
  //   ]);

  //   DB::commit();
  //   return $user;
  // }

  /**
   * Redirect error helper.
   */
  protected function redirectError(string $provider, string $error){
    return redirect('/login?' . http_build_query([
      'provider' => $provider,
      'error' => $error
    ]));
  }
}