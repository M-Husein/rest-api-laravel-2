<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;
use Programmeria\LocaleSwitcher\LocaleSwitcherServiceProvider;
use Programmeria\Ui\UiServiceProvider;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LocaleContractTest extends TestCase
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
            'username' => 'locale-contract',
        ], $attributes));
    }

    public function test_public_default_url_uses_default_locale(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('lang="en"', false);
    }

    public function test_public_page_ignores_accept_language(): void
    {
        $this->withHeader('Accept-Language', 'id')
            ->get('/')
            ->assertOk()
            ->assertSee('lang="en"', false);
    }

    public function test_public_non_default_url_uses_url_locale(): void
    {
        $this->get('/id')
            ->assertOk()
            ->assertSee('lang="id"', false);
    }

    public function test_default_locale_prefix_redirects_to_canonical_url(): void
    {
        $this->get('/en')->assertRedirect('/');
        $this->get('/en/articles')->assertRedirect('/articles');
    }

    public function test_unsupported_locale_prefix_is_not_found(): void
    {
        $this->get('/xx')->assertNotFound();
    }

    public function test_api_query_locale_wins_over_accept_language(): void
    {
        $this->registerLocaleProbe();

        $this->getJson('/api/v1/locale-probe?lang=id', ['Accept-Language' => 'en'])
            ->assertOk()
            ->assertJsonPath('locale', 'id');
    }

    public function test_api_accept_language_is_used_without_query_locale(): void
    {
        $this->registerLocaleProbe();

        $this->getJson('/api/v1/locale-probe', ['Accept-Language' => 'id'])
            ->assertOk()
            ->assertJsonPath('locale', 'id');
    }

    public function test_api_invalid_query_falls_back_to_accept_language(): void
    {
        $this->registerLocaleProbe();

        $this->getJson('/api/v1/locale-probe?lang=xx', ['Accept-Language' => 'id'])
            ->assertOk()
            ->assertJsonPath('locale', 'id');
    }

    public function test_api_uses_default_locale_without_explicit_signal(): void
    {
        $this->registerLocaleProbe();

        $this->getJson('/api/v1/locale-probe')
            ->assertOk()
            ->assertJsonPath('locale', 'en');
    }

    public function test_api_unsupported_accept_language_uses_default_locale(): void
    {
        $this->registerLocaleProbe();

        $this->getJson('/api/v1/locale-probe', ['Accept-Language' => 'xx'])
            ->assertOk()
            ->assertJsonPath('locale', 'en');
    }

    public function test_user_locale_applies_to_admin_request(): void
    {
        $user = $this->makeUser(['lang' => 'id']);

        $this->setRequestLocaleContext('/app');
        app()->setLocale('en');

        event(new Authenticated('web', $user));

        $this->assertSame('id', app()->getLocale());
    }

    public function test_admin_shell_uses_user_locale_after_login(): void
    {
        if (! class_exists(UiServiceProvider::class)) {
            $this->markTestSkipped('The ui package is not installed.');
        }

        $user = $this->makeUser([
            'email' => 'admin-locale@example.test',
            'lang' => 'id',
        ]);
        $user->assignRole(Role::findOrCreate(User::ROLE_ADMIN, 'web'));

        $this->withHeader('Referer', 'http://localhost')
            ->postJson('/api/v1/login', [
                'identifier' => $user->email,
                'password' => 'password',
            ])->assertOk();

        auth()->forgetGuards();

        $this->get('/app')
            ->assertOk()
            ->assertSee('lang="id"', false);
    }

    public function test_user_locale_applies_to_api_request_without_explicit_signal(): void
    {
        Sanctum::actingAs($this->makeUser(['lang' => 'id']));

        $this->registerLocaleProbe(auth: true);

        $this->withHeader('Accept-Language', '')
            ->getJson('/api/v1/locale-probe')
            ->assertOk()
            ->assertJsonPath('locale', 'id');
    }

    public function test_api_query_locale_still_wins_with_auth_user(): void
    {
        Sanctum::actingAs($this->makeUser(['lang' => 'id']));

        $this->registerLocaleProbe(auth: true);

        $this->getJson('/api/v1/locale-probe?lang=en')
            ->assertOk()
            ->assertJsonPath('locale', 'en');
    }

    public function test_api_accept_language_still_wins_with_auth_user(): void
    {
        Sanctum::actingAs($this->makeUser(['lang' => 'id']));

        $this->registerLocaleProbe(auth: true);

        $this->withHeader('Accept-Language', 'en')
            ->getJson('/api/v1/locale-probe')
            ->assertOk()
            ->assertJsonPath('locale', 'en');
    }

    public function test_user_locale_wins_over_admin_query_locale(): void
    {
        $user = $this->makeUser(['lang' => 'en']);

        $this->setRequestLocaleContext('/app?lang=id');
        app()->setLocale('id');

        event(new Authenticated('web', $user));

        $this->assertSame('en', app()->getLocale());
    }

    public function test_user_locale_does_not_override_public_url(): void
    {
        $user = $this->makeUser(['lang' => 'en']);

        $this->setRequestLocaleContext('/id', 'with_locale');
        app()->setLocale('id');

        event(new Authenticated('web', $user));

        $this->assertSame('id', app()->getLocale());
    }

    public function test_user_locale_does_not_override_api_query_locale(): void
    {
        $user = $this->makeUser(['lang' => 'en']);

        $this->setRequestLocaleContext('/api/v1/locale-probe?lang=id');
        app()->setLocale('id');

        event(new Authenticated('sanctum', $user));

        $this->assertSame('id', app()->getLocale());
    }

    public function test_user_locale_does_not_override_api_accept_language(): void
    {
        $user = $this->makeUser(['lang' => 'id']);

        $this->setRequestLocaleContext('/api/v1/locale-probe', acceptLanguage: 'en');
        app()->setLocale('en');

        event(new Authenticated('sanctum', $user));

        $this->assertSame('en', app()->getLocale());
    }

    public function test_invalid_api_query_locale_falls_back_to_user_locale(): void
    {
        Sanctum::actingAs($this->makeUser(['lang' => 'id']));

        $this->registerLocaleProbe(auth: true);

        $this->withHeader('Accept-Language', '')
            ->getJson('/api/v1/locale-probe?lang=xx')
            ->assertOk()
            ->assertJsonPath('locale', 'id');
    }

    private function registerLocaleProbe(bool $auth = false): void
    {
        Route::middleware($auth ? ['api', 'auth:sanctum'] : 'api')
            ->get('/api/v1/locale-probe', fn () => response()->json([
                'locale' => app()->getLocale(),
            ]));
    }

    private function setRequestLocaleContext(
        string $uri,
        ?string $localeType = null,
        ?string $acceptLanguage = null
    ): void {
        $request = Request::create($uri);
        $request->headers->remove('Accept-Language');

        if ($acceptLanguage !== null) {
            $request->headers->set('Accept-Language', $acceptLanguage);
        }

        if ($localeType !== null) {
            $route = new RoutingRoute(['GET'], $uri, fn () => null);
            $route->setAction(['locale_type' => $localeType]);
            $request->setRouteResolver(fn () => $route);
        }

        app()->instance('request', $request);
    }
}
