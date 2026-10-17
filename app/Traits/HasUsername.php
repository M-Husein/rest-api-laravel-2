<?php
namespace App\Traits;
use Illuminate\Support\Str;

trait HasUsername{
  /**
   * Max username length from migration.
   */
  protected int $usernameMaxLength = 32;

  /**
   * Reserved usernames.
   */
  protected array $reservedUsernames = [
    'admin',
    'administrator',
    'root',
    'system',
    'support',
    'staff',
    'owner',
    'moderator',
    'superadmin',
    'api',
    'test',
    'guest'
  ];

  /**
   * Generate unique username.
   */
  public function generateUsername(
    string $value,
    string $column = 'username',
    string $separator = '.'
  ): string {
    // Allowed separators
    if(!in_array($separator, ['.', '_', '-'])){
      $separator = '.';
    }

    // Normalize username
    $username = Str::of($value)
      ->before('@')
      ->ascii()
      ->lower()
      ->replaceMatches('/[^a-z0-9]+/', $separator)
      ->trim($separator)
      ->value();

    if(empty($username)){
      $username = 'user';
    }

    // Trim to max length
    $username = substr($username, 0, $this->usernameMaxLength);

    // Reserved username
    if($this->isReservedUsername($username)){
      $username .= '1';
    }

    $original = $username;

    // Case-insensitive LIKE on PostgreSQL (MySQL's LIKE already is).
    $operator = $this->newQuery()->getConnection()->getDriverName() === 'pgsql'
      ? 'ilike'
      : 'like';

    // Query existing usernames once
    $existing = $this->newQuery()
      ->where($column, $operator, $original . '%')
      ->pluck($column)
      ->toArray();

    $lookup = array_flip($existing);

    // Username available
    if(!isset($lookup[$username])){
      return $username;
    }

    // Generate unique username
    $counter = 1;

    do{
      $suffix = (string) $counter;
      $base = substr(
        $original,
        0,
        $this->usernameMaxLength - strlen($suffix)
      );

      $username = $base . $suffix;
      $counter++;
    }while(isset($lookup[$username]) || $this->isReservedUsername($username));

    return $username;
  }

  /**
   * Check reserved username.
   */
  protected function isReservedUsername(string $username): bool{
    return in_array(strtolower($username), array_map('strtolower', $this->reservedUsernames));
  }
}