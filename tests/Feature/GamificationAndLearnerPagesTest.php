<?php

use App\Enums\ContentStatus;
use App\Enums\UserRole;
use App\Enums\XpActivityType;
use App\Models\Profile;
use App\Models\Unit;
use App\Models\User;
use App\Models\Vocabulary;
use App\Models\XpTransaction;
use Database\Seeders\BadgeSeeder;
use Database\Seeders\InitialCurriculumSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('dictionary only exposes approved vocabularies to learner and leaderboard/profile render xp accurately', function () {
    $this->seed([InitialCurriculumSeeder::class, BadgeSeeder::class]);

    $unit1 = Unit::where('order_number', 1)->firstOrFail();

    Vocabulary::create([
        'unit_id' => $unit1->id,
        'pasan_word' => 'KataTervalidasi',
        'indonesian_meaning' => 'Arti tervalidasi',
        'validation_status' => ContentStatus::Approved,
    ]);
    Vocabulary::create([
        'unit_id' => $unit1->id,
        'pasan_word' => 'KataDrafRahasia',
        'indonesian_meaning' => 'Belum tervalidasi',
        'validation_status' => ContentStatus::Draft,
    ]);

    $user1 = User::create(['email' => 'top@example.com', 'password' => Hash::make('password123')]);
    Profile::create(['id' => $user1->id, 'full_name' => 'Juara Satu', 'role' => UserRole::Learner, 'is_active' => true]);
    XpTransaction::create([
        'user_id' => $user1->id,
        'activity_type' => XpActivityType::Quiz,
        'reference_id' => Str::uuid()->toString(),
        'xp_amount' => 25,
        'created_at' => now(),
    ]);

    $user2 = User::create(['email' => 'me@example.com', 'password' => Hash::make('password123')]);
    Profile::create(['id' => $user2->id, 'full_name' => 'Saya Belajar', 'role' => UserRole::Learner, 'is_active' => true]);
    XpTransaction::create([
        'user_id' => $user2->id,
        'activity_type' => XpActivityType::Lesson,
        'reference_id' => Str::uuid()->toString(),
        'xp_amount' => 10,
        'created_at' => now(),
    ]);

    $this->actingAs($user2);

    $this->get('/learner/kamus')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Learner/Dictionary')
        ->has('vocabularies', 1)
        ->where('vocabularies.0.pasan_word', 'KataTervalidasi')
    );

    $this->get('/learner/papan-skor')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Learner/Leaderboard')
        ->where('rankings.0.full_name', 'Juara Satu')
        ->where('rankings.1.is_current_user', true)
    );

    $this->get('/learner/profil')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Learner/Profile')
        ->where('level_info.total_xp', 10)
        ->has('badges', 5)
    );
});
