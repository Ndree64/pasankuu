<?php

namespace App\Models;

use App\Enums\QuestionType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class QuizQuestion extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'quiz_id',
        'primary_lesson_id',
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

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(UnitQuiz::class, 'quiz_id');
    }

    public function primaryLesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'primary_lesson_id');
    }

    public function answerKey(): HasOne
    {
        return $this->hasOne(QuizQuestionAnswerKey::class, 'question_id');
    }
}
