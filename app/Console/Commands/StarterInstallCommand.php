<?php

namespace App\Console\Commands;

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
        {--no-build : Skip frontend install and build}';

    protected $description = 'Install or remove starterkit feature packages';

    public function handle(): int
    {
        $repository = new FeatureRepository(base_path());
        $installer = new FeatureInstaller($repository);

        $preset = $this->option('preset');
        $with = $this->option('with') ?? [];
        $without = $this->option('without') ?? [];

        if ($preset === null && $with === [] && $without === []) {
            if (! $this->input->isInteractive()) {
                $this->components->info('Nothing to do. Pass --preset, --with, or --without.');

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

        $this->renderPlan($desired, $plan, $preset);

        if ($this->option('dry-run')) {
            $this->components->info('Dry run: no changes were made.');

            return self::SUCCESS;
        }

        if ($this->input->isInteractive() && ! $this->confirm('Apply these changes?', true)) {
            return self::SUCCESS;
        }

        try {
            $installer->apply(
                $desired,
                ! $this->option('no-migrate'),
                ! $this->option('no-build'),
                fn (string $line) => $this->line($line)
            );
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $this->components->info('Starterkit features updated.');

        return self::SUCCESS;
    }

    private function renderPlan(array $desired, array $plan, ?string $preset): void
    {
        $this->components->twoColumnDetail('Preset', $preset ?? '(current selection)');

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
        $this->line('Selected features: ' . (implode(', ', $desired) ?: 'none'));
    }
}
