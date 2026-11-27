<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonActivityProgress extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'lesson_activity_progress';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'activity_id',
        'progress_type',
        'remedial_assignment_id',
        'status',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
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

    public function activity(): BelongsTo
    {
        return $this->belongsTo(LessonActivity::class, 'activity_id');
    }

    public function remedialAssignment(): BelongsTo
    {
        return $this->belongsTo(RemedialAssignment::class, 'remedial_assignment_id');
    }
}
