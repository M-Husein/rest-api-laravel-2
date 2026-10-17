<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginHistory extends Model{
  // Tells Eloquent to automatically manage created_at but ignore updated_at completely
  const UPDATED_AT = null;

  protected $table = 'login_histories';

  protected $fillable = [
    'user_id',
    'ip_address',
    'meta'
  ];

  protected $casts = [
    'meta' => 'array'
  ];

  /**
   * Get the user that owns this data.
   */
  public function user(): BelongsTo{
    return $this->belongsTo(User::class);
  }
}