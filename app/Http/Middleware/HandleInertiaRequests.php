<?php

namespace App\Http\Middleware;

use App\Models\XpTransaction;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing('profile');
        $profile = $user?->profile;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user && $profile ? [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $profile->full_name,
                    'role' => $profile->role->value,
                    'is_active' => $profile->is_active,
                    'total_xp' => (int) XpTransaction::where('user_id', $profile->id)->sum('xp_amount'),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'lesson_feedback' => fn () => $request->session()->get('lesson_feedback'),
                'lesson_result' => fn () => $request->session()->get('lesson_result'),
                'quiz_result' => fn () => $request->session()->get('quiz_result'),
                'preview_result' => fn () => $request->session()->get('preview_result'),
            ],
        ];
    }
}
