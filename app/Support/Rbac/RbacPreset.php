<?php

namespace App\Support\Rbac;

use App\Support\Starter\JsonFile;
use InvalidArgumentException;

final class RbacPreset
{
    public const SIMPLE = 'simple';

    public const STANDARD = 'standard';

    public const ADVANCED = 'advanced';

    public const NONE = 'none';

    private static ?string $resolved = null;

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function all(): array
    {
        return config('rbac.presets', []);
    }

    public static function current(): string
    {
        if (self::$resolved !== null) {
            return self::$resolved;
        }

        $manifest = JsonFile::read(base_path('features.json'));
        $preset = $manifest['rbac'] ?? config('rbac.default', self::SIMPLE);

        return self::$resolved = is_string($preset) && self::exists($preset) ? $preset : self::SIMPLE;
    }

    public static function forget(): void
    {
        self::$resolved = null;
    }

    public static function exists(string $preset): bool
    {
        return array_key_exists($preset, self::all());
    }

    public static function is(string $preset): bool
    {
        return self::current() === $preset;
    }

    public static function enabled(): bool
    {
        return self::current() !== self::NONE;
    }

    /**
     * @return array<string, mixed>
     */
    public static function definition(?string $preset = null): array
    {
        $preset ??= self::current();

        if (! self::exists($preset)) {
            throw new InvalidArgumentException(
                "Unknown RBAC preset [{$preset}]. Available presets: ".implode(', ', array_keys(self::all())).'.'
            );
        }

        return self::all()[$preset];
    }

    public static function write(string $preset): void
    {
        self::definition($preset);

        $manifest = JsonFile::read(base_path('features.json'));
        $manifest['rbac'] = $preset;

        JsonFile::write(base_path('features.json'), $manifest);

        self::$resolved = $preset;
    }
}
