<?php

namespace App\Models;

use App\Enums\RemedialStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RemedialAssignment extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'quiz_attempt_id',
        'lesson_id',
        'error_count',
        'priority_order',
        'content_version',
        'status',
        'created_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'error_count' => 'integer',
            'priority_order' => 'integer',
            'content_version' => 'integer',
            'status' => RemedialStatus::class,
            'created_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function quizAttempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
