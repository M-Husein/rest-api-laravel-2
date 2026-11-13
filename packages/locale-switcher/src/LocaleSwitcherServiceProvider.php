<?php

namespace Programmeria\LocaleSwitcher;

use Illuminate\Auth\Events\Authenticated;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Programmeria\LocaleSwitcher\Http\Middleware\SetLang;
use Programmeria\LocaleSwitcher\Http\Middleware\SetUserLocale as SetUserLocaleMiddleware;
use Programmeria\LocaleSwitcher\Listeners\SetUserLocale;
use Programmeria\LocaleSwitcher\Models\Language;
use Programmeria\LocaleSwitcher\Console\LocaleAddCommand;
use Programmeria\LocaleSwitcher\Console\LocaleSyncCommand;

class LocaleSwitcherServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/api.php');

        if ($this->app->runningInConsole()) {
            $this->commands([LocaleAddCommand::class, LocaleSyncCommand::class]);
        }

        $kernel = $this->app->make(Kernel::class);

        $kernel->appendMiddlewareToGroup('api', SetLang::class);
        $kernel->appendMiddlewareToGroup('api', SetUserLocaleMiddleware::class);
        $kernel->addToMiddlewarePriorityBefore(AuthenticatesRequests::class, SetLang::class);
        $kernel->addToMiddlewarePriorityAfter(AuthenticatesRequests::class, SetUserLocaleMiddleware::class);

        Event::listen(Authenticated::class, SetUserLocale::class);

        $this->registerFeatureFillable();
        $this->resolveDynamicLocales();
    }

    /**
     * Merge active DB languages into the localizer config at runtime.
     *
     * This runs in the provider (facades available) instead of
     * config/localizer.php, because config files are evaluated before
     * the facade root is set. Static config stays as the fallback for
     * contexts where the table is missing (migrate, fresh install).
     */
    private function resolveDynamicLocales(): void
    {
        try {
            $resolved = Cache::remember(Language::CACHE_KEY, 3600, function () {
                if (! Schema::hasTable('languages')) {
                    return null;
                }

                $rows = Language::query()->active()->ordered()->get(['code', 'name', 'direction']);

                if ($rows->isEmpty()) {
                    return null;
                }

                return [
                    'locales' => $rows->pluck('name', 'code')->all(),
                    'directions' => $rows->where('direction', '!=', 'ltr')
                        ->mapWithKeys(fn ($row) => [$row->code => $row->direction])
                        ->all(),
                ];
            });
        } catch (\Throwable $e) {
            return;
        }

        if (! is_array($resolved)) {
            return;
        }

        config()->set('localizer.locales', $resolved['locales']);
        config()->set('localizer.supported_locales', array_keys($resolved['locales']));
        config()->set('localizer.locale_directions', $resolved['directions']);
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
