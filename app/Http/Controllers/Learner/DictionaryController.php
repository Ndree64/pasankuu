<?php

namespace App\Http\Controllers\Learner;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\Vocabulary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DictionaryController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $unitFilter = (string) $request->query('unit', 'all');

        $query = Vocabulary::with('unit:id,title,order_number')
            ->where('validation_status', ContentStatus::Approved)
            ->orderBy('pasan_word');

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('pasan_word', 'like', "%{$q}%")
                    ->orWhere('indonesian_meaning', 'like', "%{$q}%");
            });
        }

        if (in_array($unitFilter, ['1', '2', '3'], true)) {
            $orderNum = (int) $unitFilter;
            $query->whereHas('unit', fn ($u) => $u->where('order_number', $orderNum));
        } elseif ($unitFilter === '4-5') {
            $query->whereHas('unit', fn ($u) => $u->whereIn('order_number', [4, 5]));
        }

        $vocabularies = $query->get()->map(fn (Vocabulary $v) => [
            'id' => $v->id,
            'pasan_word' => $v->pasan_word,
            'indonesian_meaning' => $v->indonesian_meaning,
            'category' => $v->category,
            'source_note' => $v->source_note,
            'unit_title' => $v->unit?->title,
            'unit_order' => $v->unit?->order_number,
        ])->values();

        return Inertia::render('Learner/Dictionary', [
            'vocabularies' => $vocabularies,
            'filters' => [
                'q' => $q,
                'unit' => $unitFilter,
            ],
        ]);
    }
}
