<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class ReviewPolicy
{
    public function review(User $user): bool
    {
        return $user->profile?->is_active && $user->profile->role === UserRole::Validator;
    }
}
