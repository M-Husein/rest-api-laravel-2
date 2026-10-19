<?php

namespace Programmeria\Ui;

use Illuminate\Support\ServiceProvider;

class UiServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'ui');
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
    }
}
