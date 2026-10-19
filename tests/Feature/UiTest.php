<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Programmeria\Ui\UiServiceProvider;
use Tests\TestCase;

class UiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (! class_exists(UiServiceProvider::class)) {
            $this->markTestSkipped('The ui package is not installed.');
        }
    }

    public function test_private_pages_are_noindex(): void
    {
        foreach (['/login', '/register', '/forgot-password'] as $path) {
            $response = $this->get($path);

            $response->assertOk();
            $response->assertSee('noindex, nofollow, notranslate, noai', false);
            $response->assertHeader('X-Robots-Tag', 'noindex, nofollow, notranslate, noai');
        }
    }

    public function test_admin_shell_requires_authentication(): void
    {
        $this->get('/app')->assertRedirect('/login');
    }

    public function test_settings_require_authentication(): void
    {
        $this->get('/settings')->assertRedirect('/login');
    }
}
