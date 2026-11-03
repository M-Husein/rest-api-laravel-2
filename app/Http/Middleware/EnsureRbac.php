<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Rbac\RbacPreset;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureRbac
{
    public function handle(
        Request $request,
        Closure $next,
        ?string $permission = null,
        ?string $ability = null,
        ?string $model = null,
    ): Response {
        $preset = RbacPreset::current();

        if ($preset === RbacPreset::NONE) {
            return $next($request);
        }

        $user = $request->user();

        abort_if($user === null, 401);

        if ($preset === RbacPreset::SIMPLE) {
            abort_unless($user->hasRole(User::ROLE_ADMIN), 403);

            return $next($request);
        }

        if ($permission !== null && $permission !== '' && ! $user->can($permission)) {
            abort(403);
        }

        if ($preset === RbacPreset::ADVANCED && $ability !== null && $model !== null) {
            Gate::authorize($ability, $this->policyTarget($request, $model));
        }

        return $next($request);
    }

    private function policyTarget(Request $request, string $model): object|string
    {
        if (! class_exists($model)) {
            return $model;
        }

        $route = $request->route();

        if ($route === null) {
            return $model;
        }

        foreach ($route->parameters() as $parameter) {
            if ($parameter instanceof $model) {
                return $parameter;
            }
        }

        $value = $route->parameter(Str::snake(class_basename($model)));

        if ($value !== null && ! is_object($value)) {
            return $model::query()->whereKey($value)->firstOrFail();
        }

        return $model;
    }
}
