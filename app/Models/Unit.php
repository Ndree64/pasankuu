<?php

namespace App\Models;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Unit extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'description',
        'order_number',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'order_number' => 'integer',
            'status' => ContentStatus::class,
        ];
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('order_number');
    }

    public function quiz(): HasOne
    {
        return $this->hasOne(UnitQuiz::class, 'unit_id');
    }

    public function vocabularies(): HasMany
    {
        return $this->hasMany(Vocabulary::class);
    }
}
