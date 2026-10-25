<?php

namespace App\Console\Commands;

use App\Support\Frontend\PackageManager;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;
use Throwable;

class FrontendCommand extends Command
{
    protected $signature = 'frontend
        {action : Action to run (install, build, dev)}
        {--package-manager= : Frontend package manager to use (bun, npm, or pnpm)}';

    protected $description = 'Install, build, or run the frontend with Bun, npm, or pnpm';

    public function handle(): int
    {
        $action = strtolower(trim((string) $this->argument('action')));

        if (! in_array($action, ['install', 'build', 'dev'], true)) {
            $this->components->error(
                "Unknown frontend action [{$action}]. Available actions: install, build, dev."
            );

            return self::FAILURE;
        }

        try {
            $manager = PackageManager::detect(base_path(), $this->option('package-manager'));
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        if ($manager === null) {
            $this->components->error('No supported package manager found. Install Bun, npm, or pnpm.');

            return self::FAILURE;
        }

        $this->components->info("Using {$manager->name()} for frontend {$action}.");

        $command = match ($action) {
            'install' => $manager->installCommand(),
            'build' => $manager->buildCommand(),
            'dev' => $this->devCommand($manager),
        };

        return $this->executeCommand($command, $action === 'dev');
    }

    private function devCommand(PackageManager $manager): string
    {
        $commands = [
            'php artisan serve',
            'php artisan queue:listen --tries=1 --timeout=0',
            'php artisan pail --timeout=0',
            $manager->devCommand(),
        ];

        $commands = array_map(
            static fn (string $command): string => '"'.str_replace('"', '\\"', $command).'"',
            $commands
        );

        return sprintf(
            '%s concurrently -c "#93c5fd,#c4b5fd,#fb7185,#fdba74" %s --names=server,queue,logs,vite --kill-others',
            $manager->runner(),
            implode(' ', $commands)
        );
    }

    private function executeCommand(string $command, bool $interactive): int
    {
        $process = Process::fromShellCommandline(
            $command,
            base_path(),
            null,
            null,
            $interactive ? null : 1800
        );

        if ($interactive) {
            $process->setIdleTimeout(null);
            $process->setTimeout(null);

            if (Process::isTtySupported()) {
                $process->setTty(true);
            }
        } else {
            $process->setIdleTimeout(1800);
        }

        try {
            $process->run(function (string $type, string $buffer): void {
                $this->output->write($buffer);
            });
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        if (! $process->isSuccessful()) {
            $this->components->error(sprintf(
                'Frontend command failed with exit code %d.',
                $process->getExitCode() ?? 1
            ));

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
