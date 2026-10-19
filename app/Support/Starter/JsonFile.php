<?php

namespace App\Support\Starter;

final class JsonFile
{
    public static function read(string $path): array
    {
        if (! is_file($path)) {
            return [];
        }

        $contents = file_get_contents($path);

        if ($contents === false) {
            return [];
        }

        $contents = preg_replace('/^\xEF\xBB\xBF/', '', $contents);
        $decoded = json_decode($contents, true);

        return is_array($decoded) ? $decoded : [];
    }

    public static function write(string $path, array $data): void
    {
        $json = json_encode(
            $data,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
        );

        file_put_contents($path, $json . "\n");
    }
}
