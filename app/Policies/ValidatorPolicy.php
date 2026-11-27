<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class ValidatorPolicy
{
    public function manage(User $user): bool
    {
        return $user->profile?->is_active && $user->profile->role === UserRole::Admin;
    }
}
