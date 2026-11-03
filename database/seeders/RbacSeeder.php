<?php

namespace Database\Seeders;

use App\Support\Rbac\RbacPreset;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $this->seed(RbacPreset::current());
    }

    public function seed(string $preset): void
    {
        $definition = RbacPreset::definition($preset);

        if ($preset === RbacPreset::NONE) {
            app(PermissionRegistrar::class)->forgetCachedPermissions();

            return;
        }

        $permissions = $definition['permissions'] ?? [];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        foreach ($definition['roles'] ?? [] as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $assigned = $rolePermissions === ['*'] ? $permissions : $rolePermissions;

            $role->syncPermissions($assigned);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
