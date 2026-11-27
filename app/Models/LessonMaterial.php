<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonMaterial extends Model
{
    use HasUuids;

    protected $fillable = [
        'activity_id',
        'content',
        'explanation',
        'estimated_duration',
    ];

    protected function casts(): array
    {
        return [
            'estimated_duration' => 'integer',
        ];
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(LessonActivity::class, 'activity_id');
    }

    public function vocabularies(): BelongsToMany
    {
        return $this->belongsToMany(Vocabulary::class, 'material_vocabularies', 'material_id', 'vocabulary_id')
            ->withPivot(['id', 'order_number'])
            ->orderByPivot('order_number');
    }

    public function examples(): HasMany
    {
        return $this->hasMany(MaterialExample::class, 'material_id')->orderBy('order_number');
    }
}
