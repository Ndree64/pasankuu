<?php

namespace App\Enums;

enum XpActivityType: string
{
    case Lesson = 'lesson';
    case Remedial = 'remedial';
    case Quiz = 'quiz';
}
