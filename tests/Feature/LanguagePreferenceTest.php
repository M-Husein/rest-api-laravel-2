<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Programmeria\LocaleSwitcher\LocaleSwitcherServiceProvider;
use Tests\TestCase;

class LanguagePreferenceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (! class_exists(LocaleSwitcherServiceProvider::class)) {
            $this->markTestSkipped('The locale-switcher package is not installed.');
        }
    }

    private function makeUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'username' => 'tester',
        ], $attributes));
    }

    public function test_locale_switcher_registers_lang_as_fillable(): void
    {
        $this->assertContains('lang', (new User)->getFillable());
    }

    public function test_user_can_update_language_preference(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/me/language', ['lang' => 'id'])
            ->assertOk()
            ->assertJson(['success' => true]);

        $this->assertSame('id', $user->fresh()->lang);
    }

    public function test_update_language_rejects_unsupported_locale(): void
    {
        $user = $this->makeUser();
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/me/language', ['lang' => 'xx'])
            ->assertStatus(422);

        $this->assertNull($user->fresh()->lang);
    }

    public function test_authenticated_event_applies_user_locale(): void
    {
        $user = $this->makeUser(['lang' => 'id']);

        app()->setLocale('en');
        event(new Authenticated('web', $user));

        $this->assertSame('id', app()->getLocale());
    }

    public function test_authenticated_event_ignores_unsupported_locale(): void
    {
        $user = $this->makeUser(['lang' => 'xx']);

        app()->setLocale('en');
        event(new Authenticated('web', $user));

        $this->assertSame('en', app()->getLocale());
    }
}
