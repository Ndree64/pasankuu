<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Validator = 'validator';
    case Learner = 'learner';
}
