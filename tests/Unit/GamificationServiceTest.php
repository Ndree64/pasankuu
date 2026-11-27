<?php

use App\Enums\UserRole;
use App\Enums\XpActivityType;
use App\Models\LearnerLessonProgress;
use App\Models\Lesson;
use App\Models\Profile;
use App\Models\User;
use App\Services\GamificationService;
use Database\Seeders\BadgeSeeder;
use Database\Seeders\InitialCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(Tests\TestCase::class, RefreshDatabase::class);

test('gamification service prevents duplicate xp and awards badges idempotently', function () {
    $this->seed([BadgeSeeder::class, InitialCurriculumSeeder::class]);

    $user = User::create(['email' => 'xp@example.com', 'password' => Hash::make('password123')]);
    $profile = Profile::create(['id' => $user->id, 'full_name' => 'XP Tester', 'role' => UserRole::Learner, 'is_active' => true]);

    $lesson = Lesson::firstOrFail();
    $service = new GamificationService();

    expect($service->awardXpOnce($profile, XpActivityType::Lesson, $lesson->id, 10))->toBe(10);
    expect($service->awardXpOnce($profile, XpActivityType::Lesson, $lesson->id, 10))->toBe(0);
    expect($service->totalXp($profile))->toBe(10);

    LearnerLessonProgress::create([
        'user_id' => $profile->id,
        'lesson_id' => $lesson->id,
        'completed_content_version' => 1,
        'best_score' => 90,
        'status' => 'completed',
        'completed_at' => now(),
    ]);

    $firstBadges = $service->checkAndAwardBadges($profile);
    expect(collect($firstBadges)->pluck('code'))->toContain('first_lesson');

    $secondBadges = $service->checkAndAwardBadges($profile);
    expect($secondBadges)->toBeEmpty();

    $levelInfo = $service->calculateLevelInfo(130);
    expect($levelInfo['level'])->toBe(3);
});
