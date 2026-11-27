<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'full_name',
        'role',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id', 'id');
    }

    public function unitUnlocks(): HasMany
    {
        return $this->hasMany(UnitUnlock::class, 'user_id');
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LearnerLessonProgress::class, 'user_id');
    }

    public function lessonAttempts(): HasMany
    {
        return $this->hasMany(LessonAttempt::class, 'user_id');
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'user_id');
    }

    public function remedialAssignments(): HasMany
    {
        return $this->hasMany(RemedialAssignment::class, 'user_id');
    }

    public function xpTransactions(): HasMany
    {
        return $this->hasMany(XpTransaction::class, 'user_id');
    }

    public function userBadges(): HasMany
    {
        return $this->hasMany(UserBadge::class, 'user_id');
    }
}
