<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizQuestionAnswerKey extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'question_id';

    protected $keyType = 'string';

    protected $fillable = [
        'question_id',
        'answer_key',
    ];

    protected function casts(): array
    {
        return [
            'answer_key' => 'array',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }
}
