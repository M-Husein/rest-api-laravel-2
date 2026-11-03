<?php

namespace App\Support\Rbac;

use App\Support\Starter\JsonFile;
use InvalidArgumentException;

final class RbacUiMode
{
    public const SERVER = 'server';

    public const CLIENT = 'client';

    private static ?string $resolved = null;

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function all(): array
    {
        return config('rbac.ui_modes', []);
    }

    public static function default(): string
    {
        return config('rbac.default_ui_mode', self::SERVER);
    }

    public static function exists(string $mode): bool
    {
        return array_key_exists($mode, self::all());
    }

    public static function current(?string $preset = null): ?string
    {
        $preset ??= RbacPreset::current();

        if ($preset !== RbacPreset::ADVANCED) {
            return null;
        }

        if (self::$resolved !== null) {
            return self::$resolved;
        }

        $manifest = JsonFile::read(base_path('features.json'));
        $mode = $manifest['rbac_ui'] ?? self::default();

        return self::$resolved = is_string($mode) && self::exists($mode) ? $mode : self::default();
    }

    public static function forget(): void
    {
        self::$resolved = null;
    }

    /**
     * @return array<string, mixed>
     */
    public static function definition(?string $mode = null): array
    {
        $mode ??= self::default();

        if (! self::exists($mode)) {
            throw new InvalidArgumentException(
                "Unknown RBAC UI mode [{$mode}]. Available modes: ".implode(', ', array_keys(self::all())).'.'
            );
        }

        return self::all()[$mode];
    }

    public static function write(string $mode): void
    {
        self::definition($mode);

        $manifest = JsonFile::read(base_path('features.json'));
        $manifest['rbac_ui'] = $mode;

        JsonFile::write(base_path('features.json'), $manifest);

        self::$resolved = $mode;
    }

    public static function clear(): void
    {
        $manifest = JsonFile::read(base_path('features.json'));

        if (array_key_exists('rbac_ui', $manifest)) {
            unset($manifest['rbac_ui']);
            JsonFile::write(base_path('features.json'), $manifest);
        }

        self::forget();
    }
}
