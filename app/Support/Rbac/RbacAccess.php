<?php

namespace App\Support\Rbac;

use App\Models\Article;
use App\Models\Contact;
use App\Models\LoginHistory;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use InvalidArgumentException;

final class RbacAccess
{
    /**
     * @var array<string, array{0: class-string, 1: array<string, string>}>
     */
    private const RESOURCES = [
        'users' => [
            User::class,
            [
                'list' => 'viewAny',
                'show' => 'view',
                'create' => 'create',
                'edit' => 'update',
                'update' => 'update',
                'delete' => 'delete',
                'delete_any' => 'deleteAny',
                'restore' => 'restore',
                'force_delete' => 'forceDelete',
            ],
        ],
        'login-histories' => [
            LoginHistory::class,
            [
                'list' => 'viewAny',
                'show' => 'view',
                'delete' => 'delete',
                'delete_any' => 'deleteAny',
            ],
        ],
        'articles' => [
            Article::class,
            [
                'list' => 'viewAny',
                'show' => 'view',
                'create' => 'create',
                'edit' => 'update',
                'update' => 'update',
                'delete' => 'delete',
                'publish' => 'publish',
            ],
        ],
        'contacts' => [
            Contact::class,
            [
                'list' => 'viewAny',
                'show' => 'view',
                'create' => 'create',
                'edit' => 'update',
                'update' => 'update',
                'delete' => 'delete',
            ],
        ],
    ];

    /**
     * @return array<string, mixed>
     */
    public static function payload(User $user): array
    {
        $preset = RbacPreset::current();

        return [
            'preset' => $preset,
            'ui_mode' => RbacUiMode::current($preset),
            'user_id' => $user->id,
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
            'is_admin' => $user->hasRole(User::ROLE_ADMIN),
        ];
    }

    public static function check(User $user, string $resource, string $action, mixed $id = null): bool
    {
        if (RbacPreset::current() === RbacPreset::NONE) {
            return true;
        }

        $resource = str_replace('_', '-', strtolower($resource));
        $definition = self::RESOURCES[$resource] ?? null;

        if ($definition === null) {
            throw new InvalidArgumentException("Unknown RBAC resource [{$resource}].");
        }

        [$model, $abilities] = $definition;
        $ability = $abilities[$action] ?? null;

        if ($ability === null) {
            throw new InvalidArgumentException(
                "Unknown RBAC action [{$action}] for resource [{$resource}]."
            );
        }

        $target = $id === null ? $model : $model::query()->findOrFail($id);

        return Gate::forUser($user)->allows($ability, $target);
    }
}
