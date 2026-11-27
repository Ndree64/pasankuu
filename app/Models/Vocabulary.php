<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Vocabulary extends Model
{
    use HasUuids;

    protected $fillable = [
        'unit_id',
        'first_lesson_id',
        'pasan_word',
        'indonesian_meaning',
        'category',
        'source_note',
        'validation_status',
    ];

    protected function casts(): array
    {
        return [
            'validation_status' => ContentStatus::class,
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function firstLesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'first_lesson_id');
    }

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(LessonMaterial::class, 'material_vocabularies', 'vocabulary_id', 'material_id');
    }
}
