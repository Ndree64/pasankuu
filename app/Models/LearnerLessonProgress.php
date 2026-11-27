<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearnerLessonProgress extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'learner_lesson_progress';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'completed_content_version',
        'best_score',
        'status',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_content_version' => 'integer',
            'best_score' => 'float',
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
}
