<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $profile = $user->profile;
        if (! $profile || ! $profile->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            abort(403, 'Akun Anda tidak aktif.');
        }

        if (! in_array($profile->role->value, $roles, true)) {
            abort(403, 'Anda tidak memiliki izin mengakses halaman ini.');
        }

        return $next($request);
    }
}
