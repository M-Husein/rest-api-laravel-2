<?php

namespace App\Support\Starter;

final class FeatureManifest
{
    public function __construct(
        public readonly string $name,
        public readonly string $path,
        public readonly string $composerName,
        public readonly string $npmName,
        public readonly string $version,
        public readonly string $label,
        public readonly string $description,
        public readonly array $presets,
        public readonly array $requires,
        public readonly array $conflicts,
        public readonly bool $frontend,
    ) {
    }

    public static function fromPath(string $path): ?self
    {
        $composer = JsonFile::read($path . DIRECTORY_SEPARATOR . 'composer.json');

        if (empty($composer['name'])) {
            return null;
        }

        $package = JsonFile::read($path . DIRECTORY_SEPARATOR . 'package.json');
        $feature = JsonFile::read($path . DIRECTORY_SEPARATOR . 'feature.json');

        $name = $feature['name'] ?? basename($path);
        $version = $composer['version'] ?? $package['version'] ?? '0.1.0';

        return new self(
            name: $name,
            path: $path,
            composerName: $composer['name'],
            npmName: $package['name'] ?? '@programmeria/' . $name,
            version: $version,
            label: $feature['label'] ?? ucwords(str_replace(['-', '_'], ' ', $name)),
            description: $feature['description'] ?? '',
            presets: $feature['presets'] ?? [],
            requires: $feature['requires'] ?? [],
            conflicts: $feature['conflicts'] ?? [],
            frontend: $feature['frontend'] ?? true,
        );
    }

    /**
     * Composer constraint derived from the package version. Uses the wildcard
     * form (0.1.*) instead of a caret so it is safe to pass through cmd.exe.
     */
    public function constraint(): string
    {
        [$major, $minor] = array_pad(explode('.', $this->version), 2, '0');

        return $major . '.' . $minor . '.*';
    }
}
