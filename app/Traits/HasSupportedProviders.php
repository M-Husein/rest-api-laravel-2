<?php
namespace App\Traits;

trait HasSupportedProviders{
  /**
   * Get all providers that have 'type' => 'auth' in config/services.php.
   */
  protected function getSupportedProviders(): array{
    return collect(config('services', []))
      ->filter(fn($config) => is_array($config) && ($config['type'] ?? null) === 'auth')
      ->keys()
      ->all();
  }

  /**
   * Check if a given provider is supported.
   */
  protected function isSupportedProvider(string $provider): bool{
    return in_array($provider, $this->getSupportedProviders());
  }

  /**
   * Get OAuth scopes for a given provider from config/services.php.
   * Falls back to empty array if not defined.
   */
  protected function scopesFor(string $provider): array{
    return config("services.{$provider}.scopes", []);
  }

  /**
   * Build a regex pattern of all supported providers.
   * Useful for route where() constraints.
   */
  protected function providerPattern(): string{
    return implode('|', $this->getSupportedProviders());
  }
}