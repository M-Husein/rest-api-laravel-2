<?php

namespace App\Support\Rbac;

use Database\Seeders\RbacSeeder;

final class RbacInstaller
{
    public function apply(string $preset, bool $seed = true, ?callable $log = null, ?string $uiMode = null): void
    {
        RbacPreset::write($preset);

        $this->log($log, "RBAC preset set to {$preset}.");

        if ($preset === RbacPreset::ADVANCED) {
            $uiMode ??= RbacUiMode::default();

            RbacUiMode::write($uiMode);

            $this->log($log, "Advanced frontend mode set to {$uiMode}.");
        } else {
            RbacUiMode::clear();
        }

        if (! $seed) {
            $this->log($log, 'Skipping RBAC seeding.');

            return;
        }

        app(RbacSeeder::class)->seed($preset);

        $this->log(
            $log,
            $preset === RbacPreset::NONE
                ? 'RBAC enforcement disabled; existing roles and permissions were left unchanged.'
                : 'RBAC roles and permissions seeded.'
        );
    }

    private function log(?callable $log, string $message): void
    {
        if ($log !== null) {
            $log($message);
        }
    }
}
