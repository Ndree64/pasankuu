<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Profile;
use App\Models\Unit;
use App\Models\UnitUnlock;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'email' => $request->string('email')->lower()->toString(),
                'password' => Hash::make($request->string('password')->toString()),
            ]);

            $profile = Profile::create([
                'id' => $user->id,
                'full_name' => $request->string('full_name')->trim()->toString(),
                'role' => UserRole::Learner,
                'is_active' => true,
            ]);

            $unitOne = Unit::where('order_number', 1)->first();
            if ($unitOne) {
                UnitUnlock::firstOrCreate(
                    [
                        'user_id' => $profile->id,
                        'unit_id' => $unitOne->id,
                    ],
                    ['unlocked_at' => now()]
                );
            }

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('learner.home');
    }
}
