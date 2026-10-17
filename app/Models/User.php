<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
// use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Spatie\Permission\Traits\HasRoles;
use App\Models\UserProvider;
use App\Traits\HasUsername;

class User extends Authenticatable implements MustVerifyEmail{
  use HasApiTokens,HasFactory,Notifiable,SoftDeletes,HasRoles,HasUsername;

  public const ROLE_ADMIN = 'Admin';
  public const ROLE_MEMBER = 'Member';

  /**
   * The attributes that are mass assignable.
   *
   * @var list<string>
   */
  protected $fillable = [
    'name',
    'email',
    'phone',
    'password',
    'username',
    'avatar',
    'country',
    'city',
    'bio',
    'email_verified_at',
    'phone_verified_at',
    'pending_email'
    // 'role',
    // 'lang',
  ];

  /**
   * The attributes that should be hidden for serialization.
   *
   * @var list<string>
   */
  protected $hidden = [
    'password',
    'remember_token',
    'roles'
  ];

  /**
   * for social-registered users with no password
   * Option name: has_password but must use hasPassword method
   * 
   * 'roles' or 'role'
   */
  protected $appends = ['role','hasPassword'];

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array{
    return [
      'email_verified_at' => 'datetime',
      'phone_verified_at' => 'datetime',
      'password' => 'hashed'
    ];
  }

  /**
   * Get user's primary role.
   */
  public function getRoleAttribute(): ?string{
    return $this->roles->first()?->name;
    // return $this->getRoleNames()->first();
  }

  // OR

  /**
   * Get user role names.
   */
  // public function getRolesAttribute(): array{
  //   return $this->getRoleNames()->values()->all();
  // }

  /**
   * Determine whether the user has a password.
   * for social-registered users with no password
   */
  public function getHasPasswordAttribute(): bool{
    return !empty($this->password);
  }

  // OR

  // protected function hasPassword(): Attribute{
  //   return Attribute::make(
  //     get: fn() => !empty($this->password)
  //   );
  // }

  /**
   * Get all social providers linked to this user.
   */
  public function providers(){
    return $this->hasMany(UserProvider::class);
  }

  /**
   * Get a specific provider (e.g., 'google').
   */
  public function getProvider(string $provider): ?UserProvider{
    return $this->providers()->where('provider', $provider)->first();
  }

  /**
   * Check if user has a specific provider linked.
   */
  public function hasProvider(string $provider): bool{
    return $this->getProvider($provider) !== null;
  }

  /**
   * Create a new provider link.
   */
  public function addProvider(
    string $provider, 
    string $providerId, 
    array $data = []
  ): UserProvider{
    return $this->providers()->create([
      'provider' => $provider,
      'provider_id' => $providerId,
      'data' => $data
    ]);
  }

  /**
   * Remove a provider link.
   */
  public function removeProvider(string $provider): bool{
    return $this->providers()->where('provider', $provider)->delete();
  }

  /**
   * Send verification link to pending_email
   */
  public function sendPendingEmailVerification(): void{
    $token = \Str::random(64);
    \Cache::put(
      'pending_email_' . $this->id,
      ['email' => $this->pending_email, 'token' => $token],
      now()->addHours(24)
    );

    \Mail::to($this->pending_email)->send(new \App\Mail\PendingEmailVerification($this, $token));
  }
}