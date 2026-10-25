<?php

namespace Tests\Feature;

use Tests\TestCase;

class FrontendCommandTest extends TestCase
{
    public function test_unknown_action_fails(): void
    {
        $this->artisan('frontend', ['action' => 'unknown'])
            ->assertFailed()
            ->expectsOutputToContain('Unknown frontend action');
    }

    public function test_unknown_package_manager_fails(): void
    {
        $this->artisan('frontend', [
            'action' => 'install',
            '--package-manager' => 'yarn',
        ])
            ->assertFailed()
            ->expectsOutputToContain('Unsupported package manager');
    }
}
