<?php

namespace App\Models;

use App\Enums\AttemptStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonAttempt extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'attempt_type',
        'remedial_assignment_id',
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

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function remedialAssignment(): BelongsTo
    {
        return $this->belongsTo(RemedialAssignment::class, 'remedial_assignment_id');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(LessonResponse::class, 'attempt_id');
    }
}
