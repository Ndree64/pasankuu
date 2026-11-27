<?php

namespace App\Models;

use App\Enums\QuestionType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LessonQuestion extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'activity_id',
        'question_type',
        'question_text',
        'question_data',
        'explanation',
        'points',
        'order_number',
    ];

    protected function casts(): array
    {
        return [
            'question_type' => QuestionType::class,
            'question_data' => 'array',
            'points' => 'float',
            'order_number' => 'integer',
        ];
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(LessonActivity::class, 'activity_id');
    }

    public function answerKey(): HasOne
    {
        return $this->hasOne(LessonQuestionAnswerKey::class, 'question_id');
    }
}
