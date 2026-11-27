<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $loginInput = Str::lower(trim($request->string('login')->toString()));
        $throttleKey = Str::transliterate($loginInput.'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'login' => "Terlalu banyak percobaan masuk. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        $field = str_contains($loginInput, '@') ? 'email' : 'username';
        $credentials = [
            $field => $loginInput,
            'password' => $request->string('password')->toString(),
        ];

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages([
                'login' => 'Email/username atau kata sandi tidak sesuai.',
            ]);
        }

        $user = Auth::user()->load('profile');
        $profile = $user->profile;

        if (! $profile || ! $profile->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'login' => 'Email/username atau kata sandi tidak sesuai, atau akun sedang dinonaktifkan.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();

        return match ($profile->role) {
            UserRole::Admin => redirect()->route('admin.dashboard'),
            UserRole::Validator => redirect()->route('validator.queue'),
            UserRole::Learner => redirect()->route('learner.home'),
        };
    }
}
