<?php

use App\Enums\UserRole;
use App\Models\Profile;
use App\Models\Unit;
use App\Models\UnitUnlock;
use App\Models\User;
use Database\Seeders\InitialAdminSeeder;
use Database\Seeders\InitialCurriculumSeeder;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('welcome, login, and register pages render via inertia', function () {
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Welcome'));
    $this->get('/login')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
    $this->get('/register')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Auth/Register'));
});

test('public registration always assigns learner role, ignores forged role input, and unlocks unit 1', function () {
    $this->seed(InitialCurriculumSeeder::class);

    $response = $this->post('/register', [
        'full_name' => 'Peserta Baru',
        'email' => 'learner@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'admin',
    ]);

    $response->assertRedirect(route('learner.home'));

    $user = User::where('email', 'learner@example.com')->firstOrFail();
    $profile = $user->profile;

    expect($profile->role)->toBe(UserRole::Learner);
    expect($profile->is_active)->toBeTrue();

    $unit1 = Unit::where('order_number', 1)->firstOrFail();
    expect(UnitUnlock::where('user_id', $profile->id)->where('unit_id', $unit1->id)->exists())->toBeTrue();
});

test('login redirects each role to its dashboard and rejects inactive accounts', function () {
    $this->seed(InitialAdminSeeder::class);

    $this->post('/login', [
        'email' => 'admin@pasanku.test',
        'password' => 'password123',
    ])->assertRedirect(route('admin.dashboard'));

    $this->post('/logout')->assertRedirect(route('welcome'));

    $this->post('/login', [
        'email' => 'validator@pasanku.test',
        'password' => 'password123',
    ])->assertRedirect(route('validator.queue'));

    $this->post('/logout');

    $validator = User::where('email', 'validator@pasanku.test')->firstOrFail();
    $validator->profile->update(['is_active' => false]);

    $this->post('/login', [
        'email' => 'validator@pasanku.test',
        'password' => 'password123',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('cross-role routes return 403 forbidden', function () {
    $user = User::create([
        'email' => 'learner2@example.com',
        'password' => Hash::make('password123'),
    ]);
    Profile::create([
        'id' => $user->id,
        'full_name' => 'Learner Dua',
        'role' => UserRole::Learner,
        'is_active' => true,
    ]);

    $this->actingAs($user);

    $this->get('/admin')->assertForbidden();
    $this->get('/validator')->assertForbidden();
    $this->get('/preview')->assertForbidden();
});
