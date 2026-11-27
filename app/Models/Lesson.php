<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasUuids;

    protected $fillable = [
        'unit_id',
        'title',
        'description',
        'objective',
        'order_number',
        'content_version',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'order_number' => 'integer',
            'content_version' => 'integer',
            'status' => ContentStatus::class,
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LessonActivity::class)->orderBy('order_number');
    }

    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class, 'primary_lesson_id');
    }

    public function contentReviews(): HasMany
    {
        return $this->hasMany(ContentReview::class, 'lesson_id');
    }
}
