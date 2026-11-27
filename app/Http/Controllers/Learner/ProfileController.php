<?php

namespace App\Http\Controllers\Learner;

use App\Enums\AttemptStatus;
use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\QuizAttempt;
use App\Models\UserBadge;
use App\Models\XpTransaction;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private GamificationService $gamificationService)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->profile;
        $totalXp = $this->gamificationService->totalXp($profile);
        $levelInfo = $this->gamificationService->calculateLevelInfo($totalXp);

        $awardedBadges = UserBadge::where('user_id', $profile->id)
            ->get()
            ->keyBy('badge_id');

        $badges = Badge::all()->map(function (Badge $badge) use ($awardedBadges) {
            $userBadge = $awardedBadges->get($badge->id);

            return [
                'id' => $badge->id,
                'code' => $badge->code,
                'name' => $badge->name,
                'description' => $badge->description,
                'icon' => $badge->icon,
                'earned' => $userBadge !== null,
                'awarded_at' => $userBadge?->awarded_at?->toDateTimeString(),
            ];
        })->values();

        $quizHistory = QuizAttempt::with('quiz.unit:id,title,order_number')
            ->where('user_id', $profile->id)
            ->where('status', '!=', AttemptStatus::InProgress)
            ->orderByDesc('completed_at')
            ->limit(20)
            ->get()
            ->map(fn (QuizAttempt $attempt) => [
                'id' => $attempt->id,
                'quiz_title' => $attempt->quiz?->title,
                'unit_order' => $attempt->quiz?->unit?->order_number,
                'attempt_number' => $attempt->attempt_number,
                'score' => $attempt->score,
                'status' => $attempt->status->value,
                'completed_at' => $attempt->completed_at?->toDateTimeString(),
            ])->values();

        $xpHistory = XpTransaction::where('user_id', $profile->id)
            ->orderByDesc('created_at')
            ->limit(30)
            ->get()
            ->map(fn (XpTransaction $tx) => [
                'id' => $tx->id,
                'activity_type' => $tx->activity_type->value,
                'xp_amount' => $tx->xp_amount,
                'created_at' => $tx->created_at?->toDateTimeString(),
            ])->values();

        return Inertia::render('Learner/Profile', [
            'profile' => [
                'id' => $profile->id,
                'full_name' => $profile->full_name,
                'email' => $user->email,
                'role' => $profile->role->value,
            ],
            'level_info' => $levelInfo,
            'badges' => $badges,
            'quiz_history' => $quizHistory,
            'xp_history' => $xpHistory,
        ]);
    }
}
