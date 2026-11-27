<?php

namespace App\Http\Controllers\Validator;

use App\Http\Controllers\Controller;
use App\Models\Vocabulary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferenceDictionaryController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));
        $status = (string) $request->query('status', 'all');

        $query = Vocabulary::with('unit:id,title,order_number')
            ->orderBy('pasan_word');

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('pasan_word', 'like', "%{$q}%")
                    ->orWhere('indonesian_meaning', 'like', "%{$q}%");
            });
        }

        if (in_array($status, ['draft', 'pending_review', 'approved', 'changes_requested'], true)) {
            $query->where('validation_status', $status);
        }

        $vocabularies = $query->get()->map(fn (Vocabulary $v) => [
            'id' => $v->id,
            'pasan_word' => $v->pasan_word,
            'indonesian_meaning' => $v->indonesian_meaning,
            'category' => $v->category,
            'source_note' => $v->source_note,
            'validation_status' => $v->validation_status->value,
            'unit_title' => $v->unit?->title,
        ])->values();

        return Inertia::render('Validator/ReferenceDictionary', [
            'vocabularies' => $vocabularies,
            'filters' => [
                'q' => $q,
                'status' => $status,
            ],
        ]);
    }
}
