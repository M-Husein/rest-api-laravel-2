<?php

namespace App\Policies;

use App\Models\LoginHistory;
use App\Models\User;

class LoginHistoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('login_histories.view');
    }

    public function view(User $user, LoginHistory $model): bool
    {
        return $user->can('login_histories.view')
            || ($user->can('login_histories.view_own') && $model->user_id === $user->id);
    }

    public function delete(User $user, LoginHistory $model): bool
    {
        return $user->can('login_histories.delete');
    }

    public function deleteAny(User $user): bool
    {
        return $user->can('login_histories.delete');
    }
}
