<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProvider extends Model{
  protected $table = 'user_providers';

  protected $fillable = [
    'user_id',
    'provider',
    'provider_id',
    'data'
  ];

  protected $casts = [
    'data' => 'array'
  ];

  /**
   * Get the user that owns this provider.
   */
  public function user(): BelongsTo{
    return $this->belongsTo(User::class);
  }
}