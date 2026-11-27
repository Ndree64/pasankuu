<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitQuiz extends Model
{
    use HasUuids;

    protected $fillable = [
        'unit_id',
        'title',
        'description',
        'passing_score',
        'content_version',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'passing_score' => 'float',
            'content_version' => 'integer',
            'status' => ContentStatus::class,
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class, 'quiz_id')->orderBy('order_number');
    }

    public function contentReviews(): HasMany
    {
        return $this->hasMany(ContentReview::class, 'quiz_id');
    }
}
