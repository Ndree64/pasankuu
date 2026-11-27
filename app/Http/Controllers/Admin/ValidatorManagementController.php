<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ValidatorManagementController extends Controller
{
    public function index(): Response
    {
        $validators = Profile::with('user:id,username,email')
            ->where('role', UserRole::Validator)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Profile $profile) => [
                'id' => $profile->id,
                'full_name' => $profile->full_name,
                'username' => $profile->user?->username,
                'email' => $profile->user?->email,
                'is_active' => $profile->is_active,
                'created_at' => $profile->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Validators', [
            'validators' => $validators,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'username' => strtolower(trim((string) $request->input('username', ''))),
            'email' => $request->filled('email') ? strtolower(trim((string) $request->input('email'))) : null,
        ]);

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'username' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9._-]+$/', 'unique:users,username'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'username' => $validated['username'],
                'email' => $validated['email'] ?? null,
                'password' => Hash::make($validated['password']),
            ]);

            Profile::create([
                'id' => $user->id,
                'full_name' => trim($validated['full_name']),
                'role' => UserRole::Validator,
                'is_active' => true,
            ]);
        });

        return back()->with('success', 'Akun Validator baru berhasil ditambahkan.');
    }

    public function toggleStatus(Profile $profile): RedirectResponse
    {
        if ($profile->role !== UserRole::Validator) {
            abort(403, 'Hanya akun Validator yang dapat diubah statusnya di halaman ini.');
        }

        $profile->update([
            'is_active' => ! $profile->is_active,
        ]);

        $label = $profile->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Akun Validator {$profile->full_name} berhasil {$label}.");
    }
}
