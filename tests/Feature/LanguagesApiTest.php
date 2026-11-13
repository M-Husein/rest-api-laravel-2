<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Programmeria\LocaleSwitcher\LocaleSwitcherServiceProvider;
use Programmeria\LocaleSwitcher\Models\Language;
use Programmeria\LocaleSwitcher\Support\LocaleConfig;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LanguagesApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (! class_exists(LocaleSwitcherServiceProvider::class)) {
            $this->markTestSkipped('The locale-switcher package is not installed.');
        }
    }

    private function makeAdmin(array $attributes = []): User
    {
        $user = User::factory()->create(array_merge([
            'username' => 'locale-admin',
        ], $attributes));
        $user->assignRole(Role::findOrCreate(User::ROLE_ADMIN, 'web'));

        return $user;
    }

    private function makeMember(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'username' => 'locale-member',
        ], $attributes));
    }

    public function test_guest_cannot_list_languages(): void
    {
        $this->getJson('/api/v1/admin/languages')->assertUnauthorized();
    }

    public function test_member_cannot_list_languages(): void
    {
        Sanctum::actingAs($this->makeMember());

        $this->getJson('/api/v1/admin/languages')->assertForbidden();
    }

    public function test_admin_can_list_languages(): void
    {
        Sanctum::actingAs($this->makeAdmin());
        Language::updateOrCreate(['code' => 'en'], ['name' => 'English', 'is_active' => true, 'sort_order' => 0]);

        $this->getJson('/api/v1/admin/languages')
            ->assertOk()
            ->assertJsonPath('data.0.code', 'en');
    }

    public function test_presets_list_sixteen_languages(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $response = $this->getJson('/api/v1/admin/language-presets')->assertOk();

        $this->assertCount(16, $response->json('data'));
        $this->assertTrue(collect($response->json('data'))->where('code', 'ar')->first()['direction'] === 'rtl');
    }

    public function test_store_adds_language_from_preset(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $this->postJson('/api/v1/admin/languages', ['code' => 'ms'])
            ->assertCreated()
            ->assertJsonPath('data.code', 'ms')
            ->assertJsonPath('data.name', 'Malay');

        LocaleConfig::refresh();

        $this->assertContains('ms', config('localizer.supported_locales'));

        // The new language is immediately accepted by the preference endpoint.
        $this->putJson('/api/v1/me/language', ['lang' => 'ms'])->assertOk();
        $this->assertSame('ms', User::where('username', 'locale-admin')->first()->lang);
    }

    public function test_store_rejects_unknown_code_without_name(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $this->postJson('/api/v1/admin/languages', ['code' => 'xx'])
            ->assertStatus(422);
    }

    public function test_store_accepts_custom_code_with_name(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $this->postJson('/api/v1/admin/languages', ['code' => 'xx', 'name' => 'Custom'])
            ->assertCreated();

        $this->assertSame('Custom', Language::where('code', 'xx')->first()->name);
    }

    public function test_set_default_moves_flag(): void
    {
        Sanctum::actingAs($this->makeAdmin());
        Language::updateOrCreate(['code' => 'en'], ['name' => 'English', 'is_active' => true, 'is_default' => true, 'sort_order' => 0]);
        Language::updateOrCreate(['code' => 'id'], ['name' => 'Indonesia', 'is_active' => true, 'is_default' => false, 'sort_order' => 1]);

        $this->postJson('/api/v1/admin/languages/id/default')->assertOk();

        $this->assertTrue(Language::where('code', 'id')->first()->is_default);
        $this->assertFalse(Language::where('code', 'en')->first()->is_default);
    }

    public function test_default_language_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->makeAdmin());
        Language::updateOrCreate(['code' => 'en'], ['name' => 'English', 'is_active' => true, 'is_default' => true, 'sort_order' => 0]);

        $this->deleteJson('/api/v1/admin/languages/en')->assertStatus(422);
        $this->assertNotNull(Language::where('code', 'en')->first());
    }

    public function test_delete_removes_language_from_supported_locales(): void
    {
        Sanctum::actingAs($this->makeAdmin());
        Language::updateOrCreate(['code' => 'ms'], ['name' => 'Malay', 'is_active' => true, 'is_default' => false, 'sort_order' => 2]);

        $this->deleteJson('/api/v1/admin/languages/ms')->assertOk();

        LocaleConfig::refresh();

        $this->assertNotContains('ms', config('localizer.supported_locales'));
    }

    public function test_sync_endpoint_runs(): void
    {
        Sanctum::actingAs($this->makeAdmin());
        Language::updateOrCreate(['code' => 'en'], ['name' => 'English', 'is_active' => true, 'sort_order' => 0]);

        $this->postJson('/api/v1/admin/languages/en/sync', [])
            ->assertOk()
            ->assertJsonPath('data.code', 'en');
    }
}
