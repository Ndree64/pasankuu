<?php

namespace App\Models;

use App\Enums\AttemptStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'quiz_id',
        'attempt_number',
        'score',
        'status',
        'content_version',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'score' => 'float',
            'status' => AttemptStatus::class,
            'content_version' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(UnitQuiz::class, 'quiz_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(QuizResponse::class, 'attempt_id');
    }

    public function remedialAssignments(): HasMany
    {
        return $this->hasMany(RemedialAssignment::class, 'quiz_attempt_id')->orderBy('priority_order');
    }
}
