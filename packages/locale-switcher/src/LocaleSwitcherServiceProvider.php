<?php

namespace Programmeria\LocaleSwitcher;

use Illuminate\Auth\Events\Authenticated;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Programmeria\LocaleSwitcher\Http\Middleware\SetLang;
use Programmeria\LocaleSwitcher\Http\Middleware\SetUserLocale as SetUserLocaleMiddleware;
use Programmeria\LocaleSwitcher\Listeners\SetUserLocale;

class LocaleSwitcherServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/api.php');

        $kernel = $this->app->make(Kernel::class);

        $kernel->appendMiddlewareToGroup('api', SetLang::class);
        $kernel->appendMiddlewareToGroup('api', SetUserLocaleMiddleware::class);
        $kernel->addToMiddlewarePriorityBefore(AuthenticatesRequests::class, SetLang::class);
        $kernel->addToMiddlewarePriorityAfter(AuthenticatesRequests::class, SetUserLocaleMiddleware::class);

        Event::listen(Authenticated::class, SetUserLocale::class);

        $this->registerFeatureFillable();
    }

    /**
     * Let the user model mass assign the feature-owned `lang` attribute.
     */
    private function registerFeatureFillable(): void
    {
        $model = config('auth.providers.users.model');

        if (! is_string($model) || ! is_subclass_of($model, Model::class)) {
            return;
        }

        if (method_exists($model, 'mergeFeatureFillable')) {
            $model::mergeFeatureFillable(['lang']);
        }
    }
}
