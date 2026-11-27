<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialVocabulary extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'material_id',
        'vocabulary_id',
        'order_number',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(LessonMaterial::class, 'material_id');
    }

    public function vocabulary(): BelongsTo
    {
        return $this->belongsTo(Vocabulary::class);
    }
}
