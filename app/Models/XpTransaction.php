<?php

namespace App\Models;

use App\Enums\XpActivityType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class XpTransaction extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'activity_type',
        'reference_id',
        'xp_amount',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'activity_type' => XpActivityType::class,
            'xp_amount' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }
}
