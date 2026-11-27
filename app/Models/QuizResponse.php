<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizResponse extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'attempt_id',
        'question_id',
        'response_data',
        'is_correct',
        'earned_points',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'response_data' => 'array',
            'is_correct' => 'boolean',
            'earned_points' => 'float',
            'submitted_at' => 'datetime',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}
