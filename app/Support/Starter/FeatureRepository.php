<?php

namespace App\Support\Starter;

use InvalidArgumentException;

final class FeatureRepository
{
    public function __construct(private readonly string $basePath)
    {
    }

    public function basePath(string $path = ''): string
    {
        if ($path === '') {
            return $this->basePath;
        }

        return $this->basePath . DIRECTORY_SEPARATOR . ltrim($path, '/\\');
    }

    /**
     * @return array<string, FeatureManifest>
     */
    public function all(): array
    {
        $features = [];

        foreach (glob($this->basePath('packages') . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [] as $path) {
            $feature = FeatureManifest::fromPath($path);

            if ($feature !== null) {
                $features[$feature->name] = $feature;
            }
        }

        ksort($features);

        return $features;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function presets(): array
    {
        return JsonFile::read($this->basePath('starterkit.json'))['presets'] ?? [];
    }

    public function defaultPreset(): string
    {
        return JsonFile::read($this->basePath('starterkit.json'))['defaultPreset'] ?? 'site';
    }

    /**
     * @return array<int, string>
     */
    public function selected(): array
    {
        $features = JsonFile::read($this->basePath('features.json'))['features'] ?? [];

        return array_values(array_filter($features, 'is_string'));
    }

    public function writeSelected(array $features): void
    {
        $available = $this->all();

        $manifest = JsonFile::read($this->basePath('features.json'));
        $manifest['features'] = array_values(array_unique($features));
        $manifest['frontend'] = array_values(array_filter(
            $manifest['features'],
            fn (string $name) => ($available[$name]->frontend ?? false) === true
        ));

        if (empty($manifest['inRepo'])) {
            $manifest['inRepo'] = new \stdClass();
        }

        JsonFile::write($this->basePath('features.json'), $manifest);
    }

    /**
     * @return array<int, string>
     */
    public function requiredComposerPackages(): array
    {
        $composer = JsonFile::read($this->basePath('composer.json'));

        return array_keys($composer['require'] ?? []);
    }

    /**
     * Resolve the desired feature set from a preset and explicit overrides.
     *
     * @param  array<int, string>  $with
     * @param  array<int, string>  $without
     * @return array<int, string>
     */
    public function resolveTarget(?string $preset, array $with = [], array $without = []): array
    {
        $available = $this->all();

        if ($preset !== null) {
            $presets = $this->presets();

            if (! array_key_exists($preset, $presets)) {
                throw new InvalidArgumentException(
                    "Unknown preset [{$preset}]. Available presets: " . implode(', ', array_keys($presets))
                );
            }

            $features = $presets[$preset];
        } else {
            $features = $this->selected();
        }

        $features = array_values(array_unique(array_merge($features, $with)));
        $features = array_values(array_diff($features, $without));

        foreach ($features as $name) {
            $this->assertAvailable($available, $name);
        }

        $queue = $features;

        while ($queue !== []) {
            $name = array_shift($queue);

            foreach ($available[$name]->requires as $dependency) {
                $this->assertAvailable($available, $dependency);

                if (! in_array($dependency, $features, true)) {
                    $features[] = $dependency;
                    $queue[] = $dependency;
                }
            }
        }

        foreach ($features as $name) {
            foreach ($available[$name]->conflicts as $conflict) {
                if (in_array($conflict, $features, true)) {
                    throw new InvalidArgumentException(
                        "Feature [{$name}] conflicts with [{$conflict}]."
                    );
                }
            }
        }

        sort($features);

        return array_values(array_unique($features));
    }

    /**
     * @param  array<int, string>  $desired
     * @return array{install: array<int, FeatureManifest>, remove: array<int, FeatureManifest>}
     */
    public function plan(array $desired): array
    {
        $available = $this->all();
        $required = array_flip($this->requiredComposerPackages());

        $install = [];

        foreach ($desired as $name) {
            $feature = $available[$name] ?? null;

            if ($feature !== null && ! isset($required[$feature->composerName])) {
                $install[] = $feature;
            }
        }

        $remove = [];

        foreach ($available as $name => $feature) {
            if (! in_array($name, $desired, true) && isset($required[$feature->composerName])) {
                $remove[] = $feature;
            }
        }

        return ['install' => $install, 'remove' => $remove];
    }

    /**
     * @param  array<string, FeatureManifest>  $available
     */
    private function assertAvailable(array $available, string $name): void
    {
        if (! isset($available[$name])) {
            throw new InvalidArgumentException(
                "Unknown feature [{$name}]. Available features: " . implode(', ', array_keys($available))
            );
        }
    }
}
