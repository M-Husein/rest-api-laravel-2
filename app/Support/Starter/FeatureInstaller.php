<?php

namespace App\Support\Starter;

use RuntimeException;
use Symfony\Component\Process\Process;
use Throwable;

final class FeatureInstaller
{
    public function __construct(private readonly FeatureRepository $repository)
    {
    }

    /**
     * Apply the desired feature set: sync Composer requirements, rewrite the
     * manifest, regenerate the frontend registry, migrate and build.
     */
    public function apply(
        array $desired,
        bool $migrate = true,
        bool $build = true,
        ?callable $log = null,
    ): void {
        $plan = $this->repository->plan($desired);
        $withUi = in_array('ui', $desired, true);

        foreach ($plan['install'] as $feature) {
            $this->log($log, "Installing {$feature->composerName} ({$feature->constraint()}) ...");
            $this->composer(['require', $feature->composerName . ':' . $feature->constraint()], $log);
        }

        foreach ($plan['remove'] as $feature) {
            $this->log($log, "Removing {$feature->composerName} ...");
            $this->composer(['remove', $feature->composerName], $log);
        }

        $this->repository->writeSelected($desired);
        $this->log($log, 'Updated features.json (' . (implode(', ', $desired) ?: 'none') . ').');

        if ($withUi) {
            $this->log($log, 'Regenerating packages/ui/resources/ts/features.generated.ts ...');
            $this->regenerate($log);
        } else {
            $this->log($log, 'UI not selected, skipping frontend codegen.');
        }

        if ($migrate) {
            $this->log($log, 'Running migrations ...');
            $this->runCommand([PHP_BINARY, $this->repository->basePath('artisan'), 'migrate', '--force'], $log);
        }

        if ($build && $withUi) {
            if (! $this->hasBinary('bun')) {
                $this->log($log, 'Bun not found, skipping frontend install/build.');
            } else {
                $this->runShell('bun install', $log);
                $this->runShell('bun run build', $log);
            }
        } elseif ($build) {
            $this->log($log, 'UI not selected, skipping frontend install/build.');
        }
    }

    private function composer(array $arguments, ?callable $log): void
    {
        $parts = array_map(fn (string $part) => escapeshellarg($part), $arguments);

        $this->runShell('composer ' . implode(' ', $parts), $log);
    }

    private function regenerate(?callable $log): void
    {
        if ($this->hasBinary('node')) {
            $this->runShell('node scripts/generate-features.mjs', $log);

            return;
        }

        if ($this->hasBinary('bun')) {
            $this->runShell('bun run generate:features', $log);

            return;
        }

        throw new RuntimeException('Node.js or Bun is required to regenerate features.generated.ts.');
    }

    private function runShell(string $command, ?callable $log): void
    {
        $process = Process::fromShellCommandline(
            $command,
            $this->repository->basePath(),
            ['COMPOSER_NO_INTERACTION' => '1'],
            null,
            1800
        );

        $process->setIdleTimeout(1800);
        $process->mustRun($this->outputHandler($log));
    }

    private function runCommand(array $command, ?callable $log): void
    {
        $process = new Process(
            $command,
            $this->repository->basePath(),
            ['COMPOSER_NO_INTERACTION' => '1'],
            null,
            1800
        );

        $process->setIdleTimeout(1800);
        $process->mustRun($this->outputHandler($log));
    }

    private function outputHandler(?callable $log): callable
    {
        return function (string $type, string $buffer) use ($log): void {
            foreach (preg_split('/\R/', rtrim($buffer)) ?: [] as $line) {
                if ($line !== '') {
                    $this->log($log, $line);
                }
            }
        };
    }

    private function hasBinary(string $binary): bool
    {
        try {
            $process = Process::fromShellCommandline(
                $binary . ' --version',
                $this->repository->basePath(),
                null,
                null,
                30
            );

            $process->run();

            return $process->isSuccessful();
        } catch (Throwable) {
            return false;
        }
    }

    private function log(?callable $log, string $message): void
    {
        if ($log !== null) {
            $log($message);
        }
    }
}
