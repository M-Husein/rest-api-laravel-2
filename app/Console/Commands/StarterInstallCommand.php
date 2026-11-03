<?php

namespace App\Console\Commands;

use App\Support\Frontend\PackageManager;
use App\Support\Rbac\RbacInstaller;
use App\Support\Rbac\RbacPreset;
use App\Support\Starter\FeatureInstaller;
use App\Support\Starter\FeatureRepository;
use Illuminate\Console\Command;
use InvalidArgumentException;
use Throwable;

class StarterInstallCommand extends Command
{
    protected $signature = 'starter:install
        {--preset= : Preset to apply}
        {--with=* : Additional features to include}
        {--without=* : Features to exclude}
        {--dry-run : Show the plan without applying changes}
        {--no-migrate : Skip database migrations}
        {--no-build : Skip frontend install and build}
        {--package-manager= : Frontend package manager to use (bun, npm, or pnpm)}
        {--rbac= : RBAC preset to apply (simple, standard, advanced, or none)}';

    protected $description = 'Install or remove starterkit feature packages';

    public function handle(): int
    {
        $repository = new FeatureRepository(base_path());
        $installer = new FeatureInstaller($repository);

        $preset = $this->option('preset');
        $with = $this->option('with') ?? [];
        $without = $this->option('without') ?? [];
        $packageManager = $this->option('package-manager');
        $packageManager = is_string($packageManager) && trim($packageManager) !== ''
            ? trim($packageManager)
            : null;

        $rbac = $this->option('rbac');
        $rbac = is_string($rbac) && trim($rbac) !== ''
            ? strtolower(trim($rbac))
            : null;

        if ($rbac !== null && ! RbacPreset::exists($rbac)) {
            $this->components->error(
                "Unsupported RBAC preset [{$rbac}]. Supported: "
                .implode(', ', array_keys(RbacPreset::all()))
                .'.'
            );

            return self::FAILURE;
        }

        if ($packageManager !== null) {
            $packageManager = strtolower($packageManager);

            if (! in_array($packageManager, PackageManager::supported(), true)) {
                $this->components->error(
                    "Unsupported package manager [{$packageManager}]. Supported: "
                    .implode(', ', PackageManager::supported())
                    .'.'
                );

                return self::FAILURE;
            }
        }

        if ($preset === null && $with === [] && $without === [] && $rbac === null) {
            if (! $this->input->isInteractive()) {
                $this->components->info('Nothing to do. Pass --preset, --with, --without, or --rbac.');

                return self::SUCCESS;
            }

            $presets = $repository->presets();

            if ($presets === []) {
                $this->components->error('No presets are defined in starterkit.json.');

                return self::FAILURE;
            }

            $preset = $this->choice(
                'Choose a preset',
                array_keys($presets),
                $repository->defaultPreset()
            );
        }

        try {
            $desired = $repository->resolveTarget($preset, $with, $without);
        } catch (InvalidArgumentException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $plan = $repository->plan($desired);
        $featureSelectionRequested = $preset !== null || $with !== [] || $without !== [];

        $this->renderPlan($desired, $plan, $preset, $packageManager, $rbac);

        if ($this->option('dry-run')) {
            $this->components->info('Dry run: no changes were made.');

            return self::SUCCESS;
        }

        if ($this->input->isInteractive() && ! $this->confirm('Apply these changes?', true)) {
            return self::SUCCESS;
        }

        try {
            if ($featureSelectionRequested) {
                $installer->apply(
                    $desired,
                    ! $this->option('no-migrate'),
                    ! $this->option('no-build'),
                    fn (string $line) => $this->line($line),
                    $packageManager,
                );
            } else {
                $this->line('No feature changes requested; skipping feature installation.');
            }

            if ($rbac !== null) {
                (new RbacInstaller)->apply(
                    $rbac,
                    ! $this->option('no-migrate'),
                    fn (string $line) => $this->line($line),
                );
            }
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $this->components->info('Starterkit features updated.');

        return self::SUCCESS;
    }

    private function renderPlan(
        array $desired,
        array $plan,
        ?string $preset,
        ?string $packageManager,
        ?string $rbac,
    ): void {
        $this->components->twoColumnDetail('Preset', $preset ?? '(current selection)');
        $this->components->twoColumnDetail('Package manager', $packageManager ?? 'auto');
        $this->components->twoColumnDetail('RBAC', $rbac ?? '(current selection)');

        $rows = [];

        foreach ($plan['install'] as $feature) {
            $rows[] = ['install', $feature->composerName, $feature->constraint()];
        }

        foreach ($plan['remove'] as $feature) {
            $rows[] = ['remove', $feature->composerName, '-'];
        }

        if ($rows === []) {
            $rows[] = ['no-op', '-', '-'];
        }

        $this->table(['Action', 'Package', 'Version'], $rows);
        $this->line('Selected features: '.(implode(', ', $desired) ?: 'none'));
    }
}
