<?php

use App\Enums\ContentStatus;
use App\Enums\UserRole;
use App\Models\Badge;
use App\Models\Lesson;
use App\Models\Profile;
use App\Models\Unit;
use App\Models\UnitQuiz;
use Database\Seeders\DatabaseSeeder;

test('migrations and seeders populate initial accounts, curriculum shells, and badges', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Profile::where('role', UserRole::Admin)->count())->toBe(1);
    expect(Profile::where('role', UserRole::Validator)->count())->toBe(1);
    expect(Unit::where('status', ContentStatus::Published)->count())->toBe(5);
    expect(Lesson::where('status', ContentStatus::Draft)->count())->toBe(25);
    expect(UnitQuiz::where('status', ContentStatus::Draft)->count())->toBe(5);
    expect(Badge::count())->toBe(5);
});
