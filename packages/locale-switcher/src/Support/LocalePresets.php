<?php

namespace Programmeria\LocaleSwitcher\Support;

final class LocalePresets
{
    /** @var array<int, array<string, mixed>>|null */
    private static ?array $cache = null;

    /**
     * @return array<int, array{code: string, name: string, native_name: string, direction: string, weekStart: int}>
     */
    public static function all(): array
    {
        if (self::$cache === null) {
            /** @var array<int, array<string, mixed>> $rows */
            $rows = require __DIR__.'/../../resources/locales.preset.php';
            self::$cache = $rows;
        }

        return self::$cache;
    }

    /** @return array<string, mixed>|null */
    public static function find(string $code): ?array
    {
        foreach (self::all() as $row) {
            if (($row['code'] ?? null) === $code) {
                return $row;
            }
        }

        return null;
    }

    /** @return array<int, string> */
    public static function codes(): array
    {
        return array_column(self::all(), 'code');
    }
}
