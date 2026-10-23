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

        if ($json === false) {
            throw new \RuntimeException('Unable to encode JSON.');
        }

        $json = preg_replace_callback(
            '/^(?: {4})+/m',
            static fn (array $matches): string => str_repeat(' ', strlen($matches[0]) / 2),
            $json
        );

        file_put_contents($path, $json."\n");
    }
}
