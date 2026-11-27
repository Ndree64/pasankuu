<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        $units = Unit::with(['lessons' => fn ($q) => $q->orderBy('order_number'), 'quiz:id,unit_id,title,status,content_version'])
            ->orderBy('order_number')
            ->get()
            ->map(fn (Unit $unit) => [
                'id' => $unit->id,
                'title' => $unit->title,
                'description' => $unit->description,
                'order_number' => $unit->order_number,
                'status' => $unit->status->value,
                'quiz' => $unit->quiz ? [
                    'id' => $unit->quiz->id,
                    'title' => $unit->quiz->title,
                    'status' => $unit->quiz->status->value,
                    'content_version' => $unit->quiz->content_version,
                ] : null,
                'lessons' => $unit->lessons->map(fn (Lesson $lesson) => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'order_number' => $lesson->order_number,
                    'content_version' => $lesson->content_version,
                    'status' => $lesson->status->value,
                ])->values(),
            ]);

        return Inertia::render('Admin/Units', [
            'units' => $units,
        ]);
    }

    public function storeLesson(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'order_number' => ['nullable', 'integer', 'min:1'],
        ]);

        $orderNumber = $validated['order_number'] ?? ((int) $unit->lessons()->max('order_number') + 1);

        if ($unit->lessons()->where('order_number', $orderNumber)->exists()) {
            return back()->withErrors([
                'order_number' => "Nomor urut lesson {$orderNumber} sudah digunakan pada unit ini.",
            ]);
        }

        $lesson = $unit->lessons()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'objective' => $validated['objective'] ?? null,
            'order_number' => $orderNumber,
            'content_version' => 1,
            'status' => ContentStatus::Draft,
        ]);

        return redirect()
            ->route('admin.lessons.edit', $lesson)
            ->with('success', 'Lesson draf baru berhasil ditambahkan.');
    }
}
