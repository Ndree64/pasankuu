<?php

namespace App\Enums;

enum RemedialStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
