<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class QuizPolicy
{
    public function manage(User $user): bool
    {
        return $user->profile?->is_active && $user->profile->role === UserRole::Admin;
    }

    public function preview(User $user): bool
    {
        return $user->profile?->is_active
            && in_array($user->profile->role, [UserRole::Admin, UserRole::Validator], true);
    }
}
