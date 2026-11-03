<?php

namespace Tests\Feature;

use App\Models\LoginHistory;
use App\Models\User;
use App\Support\Rbac\RbacInstaller;
use App\Support\Rbac\RbacPreset;
use App\Support\Rbac\RbacUiMode;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public function test_current_preset_is_read_from_the_features_manifest(): void
    {
        $this->withRbacPreset(RbacPreset::STANDARD, function () {
            $this->assertSame(RbacPreset::STANDARD, RbacPreset::current());
        });
    }

    public function test_simple_preset_seeds_roles_without_permissions(): void
    {
        (new RbacSeeder)->seed(RbacPreset::SIMPLE);

        $this->assertTrue(Role::where('name', 'Admin')->exists());
        $this->assertTrue(Role::where('name', 'Member')->exists());
        $this->assertSame(0, Permission::count());
    }

    public function test_none_preset_does_not_seed_roles(): void
    {
        (new RbacSeeder)->seed(RbacPreset::NONE);

        $this->assertSame(0, Role::count());
        $this->assertSame(0, Permission::count());
    }

    public function test_installer_writes_the_selected_preset(): void
    {
        $path = base_path('features.json');
        $original = file_get_contents($path);

        try {
            (new RbacInstaller)->apply(RbacPreset::STANDARD, false);

            $manifest = json_decode(file_get_contents($path), true);

            $this->assertSame(RbacPreset::STANDARD, $manifest['rbac']);
        } finally {
            file_put_contents($path, $original);
            RbacPreset::forget();
        }
    }

    public function test_ui_mode_defaults_to_server_for_advanced(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            $this->assertSame(RbacUiMode::SERVER, RbacUiMode::current());
        });
    }

    public function test_ui_mode_writes_to_features_manifest(): void
    {
        $path = base_path('features.json');
        $original = file_get_contents($path);

        try {
            $this->withRbacPreset(RbacPreset::ADVANCED, function () use ($path) {
                RbacUiMode::write(RbacUiMode::CLIENT);
                $this->assertSame(RbacUiMode::CLIENT, RbacUiMode::current());

                $manifest = json_decode(file_get_contents($path), true);
                $this->assertSame(RbacUiMode::CLIENT, $manifest['rbac_ui']);
            });
        } finally {
            file_put_contents($path, $original);
            RbacPreset::forget();
            RbacUiMode::forget();
        }
    }

    public function test_ui_mode_is_cleared_for_non_advanced_presets(): void
    {
        $path = base_path('features.json');
        $original = file_get_contents($path);

        try {
            $this->withRbacPreset(RbacPreset::ADVANCED, function () {
                RbacUiMode::write(RbacUiMode::CLIENT);
            });

            (new RbacInstaller)->apply(RbacPreset::STANDARD, false);

            $manifest = json_decode(file_get_contents($path), true);
            $this->assertArrayNotHasKey('rbac_ui', $manifest);
            $this->assertNull(RbacUiMode::current(RbacPreset::STANDARD));
        } finally {
            file_put_contents($path, $original);
            RbacPreset::forget();
            RbacUiMode::forget();
        }
    }

    public function test_access_payload_includes_ui_mode(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            (new RbacSeeder)->seed(RbacPreset::ADVANCED);

            $admin = $this->makeUser();
            $admin->assignRole('Admin');

            Sanctum::actingAs($admin);

            $this->getJson('/api/v1/me/access')
                ->assertOk()
                ->assertJson([
                    'success' => true,
                    'data' => [
                        'preset' => RbacPreset::ADVANCED,
                        'ui_mode' => RbacUiMode::SERVER,
                        'is_admin' => true,
                    ],
                ]);
        });
    }

    public function test_access_check_allows_admin_to_delete_user(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            (new RbacSeeder)->seed(RbacPreset::ADVANCED);

            $admin = $this->makeUser();
            $admin->assignRole('Admin');
            $target = $this->makeUser();

            Sanctum::actingAs($admin);

            $this->postJson('/api/v1/me/access/check', [
                'resource' => 'users',
                'action' => 'delete',
                'id' => $target->id,
            ])->assertOk()->assertJson(['success' => true, 'data' => ['can' => true]]);
        });
    }

    public function test_access_check_denies_member_from_deleting_other_user(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            (new RbacSeeder)->seed(RbacPreset::ADVANCED);

            $member = $this->makeUser();
            $member->assignRole('Member');
            $target = $this->makeUser();

            Sanctum::actingAs($member);

            $this->postJson('/api/v1/me/access/check', [
                'resource' => 'users',
                'action' => 'delete',
                'id' => $target->id,
            ])->assertOk()->assertJson(['success' => true, 'data' => ['can' => false]]);
        });
    }

    public function test_access_check_denies_member_from_viewing_other_login_history(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            (new RbacSeeder)->seed(RbacPreset::ADVANCED);

            $member = $this->makeUser();
            $member->assignRole('Member');
            $foreign = LoginHistory::create(['user_id' => $this->makeUser()->id, 'ip_address' => '127.0.0.1']);

            Sanctum::actingAs($member);

            $this->postJson('/api/v1/me/access/check', [
                'resource' => 'login-histories',
                'action' => 'show',
                'id' => $foreign->id,
            ])->assertOk()->assertJson(['success' => true, 'data' => ['can' => false]]);
        });
    }

    public function test_access_check_allows_authenticated_users_for_none(): void
    {
        $this->withRbacPreset(RbacPreset::NONE, function () {
            $user = $this->makeUser();
            Sanctum::actingAs($user);

            $this->postJson('/api/v1/me/access/check', [
                'resource' => 'users',
                'action' => 'delete',
                'id' => $user->id,
            ])->assertOk()->assertJson(['success' => true, 'data' => ['can' => true]]);
        });
    }

    public function test_standard_preset_seeds_permissions_and_assigns_admin(): void
    {
        (new RbacSeeder)->seed(RbacPreset::STANDARD);

        $admin = $this->makeUser();
        $admin->assignRole('Admin');

        $this->assertTrue($admin->hasPermissionTo('users.view'));
        $this->assertTrue($admin->hasPermissionTo('login_histories.view_own'));
        $this->assertFalse($admin->checkPermissionTo('articles.publish'));
    }

    public function test_standard_preset_authorizes_by_permission_without_admin_role(): void
    {
        $this->withRbacPreset(RbacPreset::STANDARD, function () {
            (new RbacSeeder)->seed(RbacPreset::STANDARD);

            $allowed = $this->makeUser();
            $allowed->givePermissionTo('users.view');
            $denied = $this->makeUser();

            Sanctum::actingAs($allowed);
            $this->getJson('/api/v1/users')->assertOk();

            Sanctum::actingAs($denied);
            $this->getJson('/api/v1/users')->assertForbidden();
        });
    }

    public function test_advanced_preset_applies_ownership_policies(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            (new RbacSeeder)->seed(RbacPreset::ADVANCED);

            $admin = $this->makeUser();
            $admin->assignRole('Admin');
            $member = $this->makeUser();
            $member->assignRole('Member');
            $own = LoginHistory::create(['user_id' => $member->id, 'ip_address' => '127.0.0.1']);
            $other = LoginHistory::create(['user_id' => $admin->id, 'ip_address' => '127.0.0.2']);

            $this->assertTrue($member->can('view', $own));
            $this->assertFalse($member->can('view', $other));
            $this->assertFalse($member->can('viewAny', LoginHistory::class));
            $this->assertTrue($admin->can('view', $other));
            $this->assertFalse($admin->can('delete', $admin));
        });
    }

    public function test_simple_preset_requires_admin_role_for_admin_routes(): void
    {
        $this->withRbacPreset(RbacPreset::SIMPLE, function () {
            (new RbacSeeder)->seed(RbacPreset::SIMPLE);

            $admin = $this->makeUser();
            $admin->assignRole('Admin');
            $member = $this->makeUser();
            $member->assignRole('Member');

            Sanctum::actingAs($member);
            $this->getJson('/api/v1/users')->assertForbidden();

            Sanctum::actingAs($admin);
            $this->getJson('/api/v1/users')->assertOk();
        });
    }

    public function test_none_preset_allows_authenticated_users_through_admin_routes(): void
    {
        $this->withRbacPreset(RbacPreset::NONE, function () {
            $user = $this->makeUser();
            Sanctum::actingAs($user);

            $this->getJson('/api/v1/users')->assertOk();
        });
    }

    public function test_advanced_preset_enforces_bulk_delete_and_self_delete_policies(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            (new RbacSeeder)->seed(RbacPreset::ADVANCED);

            $admin = $this->makeUser();
            $admin->assignRole('Admin');
            $target = $this->makeUser();

            Sanctum::actingAs($admin);

            $this->deleteJson('/api/v1/users/'.$admin->id)->assertForbidden();
            $this->deleteJson('/api/v1/users/delete', ['ids' => [$target->id]])->assertOk();
            $this->assertSoftDeleted('users', ['id' => $target->id]);
        });
    }

    public function test_advanced_preset_allows_members_to_view_only_their_own_login_history(): void
    {
        $this->withRbacPreset(RbacPreset::ADVANCED, function () {
            (new RbacSeeder)->seed(RbacPreset::ADVANCED);

            $member = $this->makeUser();
            $member->assignRole('Member');
            $other = $this->makeUser();
            $own = LoginHistory::create(['user_id' => $member->id, 'ip_address' => '127.0.0.1']);
            $foreign = LoginHistory::create(['user_id' => $other->id, 'ip_address' => '127.0.0.2']);

            Sanctum::actingAs($member);

            $this->getJson('/api/v1/login-histories/'.$own->id)->assertOk();
            $this->getJson('/api/v1/login-histories/'.$foreign->id)->assertForbidden();
        });
    }

    private function makeUser(): User
    {
        return User::factory()->create([
            'username' => fake()->unique()->userName(),
        ]);
    }

    private function withRbacPreset(string $preset, callable $callback): void
    {
        $path = base_path('features.json');
        $original = file_get_contents($path);

        RbacPreset::write($preset);

        try {
            $callback();
        } finally {
            file_put_contents($path, $original);
            RbacPreset::forget();
        }
    }
}
