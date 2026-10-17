<?php
namespace App\Traits;

use App\Models\User;

trait HasLoginIdentifier{
  /**
   * Detect the identifier type from input.
   * Returns: 'email' | 'phone' | 'username'
   */
  protected function detectIdentifierType(string $identifier): string{
    if(filter_var($identifier, FILTER_VALIDATE_EMAIL)){
      return 'email';
    }
    // Phone: starts with + or digits only, min 7 chars
    if(preg_match('/^\+?[0-9]{7,16}$/', $identifier)){
      return 'phone';
    }
    return 'username';
  }

  /**
   * Find user by email, username, or phone.
   * Returns null if not found.
   */
  protected function findUserByIdentifier(string $identifier): ?User{
    $field = $this->detectIdentifierType($identifier);
    return User::query()->where($field, $identifier)->first();
  }

  /**
   * Get the validation rule for the identifier field.
   */
  protected function identifierRule(): string{
    return 'required|string|min:3|max:255';
  }
}