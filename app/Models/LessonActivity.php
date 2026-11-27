<?php

namespace App\Models;

use App\Enums\ActivityType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class LessonActivity extends Model
{
    use HasUuids;

    protected $fillable = [
        'lesson_id',
        'activity_type',
        'title',
        'instruction',
        'order_number',
        'is_required',
    ];

    protected function casts(): array
    {
        return [
            'activity_type' => ActivityType::class,
            'order_number' => 'integer',
            'is_required' => 'boolean',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function material(): HasOne
    {
        return $this->hasOne(LessonMaterial::class, 'activity_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(LessonQuestion::class, 'activity_id')->orderBy('order_number');
    }
}
