<?php

namespace Tests\Feature;

use App\Support\Starter\FeatureRepository;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use Tests\TestCase;

class StarterInstallCommandTest extends TestCase
{
    public function test_starter_features_lists_available_features(): void
    {
        $this->artisan('starter:features')
            ->assertSuccessful()
            ->expectsOutputToContain('locale-switcher');
    }

    public function test_install_dry_run_plans_removal_for_api_preset(): void
    {
        $before = file_get_contents(base_path('features.json'));

        $this->artisan('starter:install', [
            '--preset' => 'api',
            '--dry-run' => true,
        ])
            ->assertSuccessful()
            ->expectsOutputToContain('Selected features: none');

        $this->assertSame($before, file_get_contents(base_path('features.json')));
    }

    public function test_install_dry_run_resolves_site_preset(): void
    {
        $this->artisan('starter:install', [
            '--preset' => 'site',
            '--dry-run' => true,
        ])
            ->assertSuccessful()
            ->expectsOutputToContain('Selected features: locale-switcher, seo, ui');
    }

    public function test_install_dry_run_resolves_multilingual_preset_without_ui(): void
    {
        $this->artisan('starter:install', [
            '--preset' => 'multilingual',
            '--dry-run' => true,
        ])
            ->assertSuccessful()
            ->expectsOutputToContain('Selected features: locale-switcher');
    }

    public function test_install_dry_run_resolves_api_ui_preset(): void
    {
        $this->artisan('starter:install', [
            '--preset' => 'api-ui',
            '--dry-run' => true,
        ])
            ->assertSuccessful()
            ->expectsOutputToContain('Selected features: ui');
    }

    public function test_seo_requires_ui(): void
    {
        $repository = new FeatureRepository(base_path());

        $this->assertContains('ui', $repository->resolveTarget('site'));
        $this->assertSame([], $repository->resolveTarget('api'));
    }

    public function test_install_fails_for_unknown_preset(): void
    {
        $this->artisan('starter:install', [
            '--preset' => 'unknown-preset',
            '--dry-run' => true,
        ])
            ->assertFailed()
            ->expectsOutputToContain('Unknown preset');
    }

    public function test_install_dry_run_accepts_package_manager_option(): void
    {
        $this->artisan('starter:install', [
            '--preset' => 'site',
            '--dry-run' => true,
            '--package-manager' => 'npm',
        ])
            ->assertSuccessful()
            ->expectsOutputToContain('Package manager');
    }

    public function test_install_fails_for_unknown_package_manager(): void
    {
        $this->artisan('starter:install', [
            '--preset' => 'site',
            '--dry-run' => true,
            '--package-manager' => 'yarn',
        ])
            ->assertFailed()
            ->expectsOutputToContain('Unsupported package manager');
    }

    public function test_repository_resolves_requirements_and_conflicts(): void
    {
        $base = storage_path('framework/testing/starter-repo-'.uniqid());

        try {
            $this->makePackage($base, 'alpha', ['requires' => ['beta']], ['default']);
            $this->makePackage($base, 'beta');
            $this->makePackage($base, 'gamma', ['conflicts' => ['delta']], ['conflict']);
            $this->makePackage($base, 'delta', ['conflicts' => ['gamma']], ['conflict']);

            file_put_contents($base.'/starterkit.json', json_encode([
                'defaultPreset' => 'default',
                'presets' => [
                    'default' => ['alpha'],
                    'conflict' => ['gamma', 'delta'],
                ],
            ], JSON_PRETTY_PRINT));

            $repository = new FeatureRepository($base);

            $this->assertSame(['alpha', 'beta'], $repository->resolveTarget('default'));

            $this->expectException(InvalidArgumentException::class);
            $repository->resolveTarget('conflict');
        } finally {
            File::deleteDirectory($base);
        }
    }

    private function makePackage(string $base, string $name, array $feature = [], array $presets = []): void
    {
        $path = $base.'/packages/'.$name;
        File::ensureDirectoryExists($path);

        file_put_contents($path.'/composer.json', json_encode([
            'name' => 'programmeria/laravel-'.$name,
            'version' => '0.1.0',
        ], JSON_PRETTY_PRINT));

        file_put_contents($path.'/package.json', json_encode([
            'name' => '@programmeria/'.$name,
            'version' => '0.1.0',
        ], JSON_PRETTY_PRINT));

        file_put_contents($path.'/feature.json', json_encode(array_merge([
            'presets' => $presets,
            'requires' => [],
            'conflicts' => [],
        ], $feature), JSON_PRETTY_PRINT));
    }
}
