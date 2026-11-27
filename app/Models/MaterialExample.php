<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialExample extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'material_id',
        'pasan_text',
        'indonesian_translation',
        'order_number',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(LessonMaterial::class, 'material_id');
    }
}
