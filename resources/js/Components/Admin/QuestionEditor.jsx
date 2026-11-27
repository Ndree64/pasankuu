import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import TactileButton from '../UI/TactileButton';

const QUESTION_TYPES = [
    { value: 'mc_pasan_to_id', label: 'Pilihan Ganda (Pasan -> Indonesia)' },
    { value: 'mc_id_to_pasan', label: 'Pilihan Ganda (Indonesia -> Pasan)' },
    { value: 'matching', label: 'Mencocokkan Pasangan' },
    { value: 'fill_blank', label: 'Melengkapi Ungkapan / Kalimat Rumpang' },
];

function buildInitialState(initialQuestion, unitLessons) {
    const qType = initialQuestion?.question_type || 'mc_pasan_to_id';
    const qData = initialQuestion?.question_data || {};
    const aKey = initialQuestion?.answer_key || {};

    return {
        primary_lesson_id: initialQuestion?.primary_lesson_id || unitLessons?.[0]?.id || '',
        question_type: qType,
        question_text: initialQuestion?.question_text || '',
        explanation: initialQuestion?.explanation || '',
        points: initialQuestion?.points ?? 10,
        options: qData.options || [
            { id: 'A', label: '' },
            { id: 'B', label: '' },
            { id: 'C', label: '' },
            { id: 'D', label: '' },
        ],
        correct_option: aKey.correct_option || 'A',
        left_items: qData.left_items || [
            { id: 'L1', text: '' },
            { id: 'L2', text: '' },
            { id: 'L3', text: '' },
        ],
        right_items: qData.right_items || [
            { id: 'R1', text: '' },
            { id: 'R2', text: '' },
            { id: 'R3', text: '' },
        ],
        pairs: aKey.pairs || { L1: 'R1', L2: 'R2', L3: 'R3' },
        template: qData.template || '___ ...',
        choices: qData.choices || [
            { id: 'A', label: '' },
            { id: 'B', label: '' },
            { id: 'C', label: '' },
        ],
        correct_choice: aKey.correct_choice || 'A',
    };
}

export default function QuestionEditor({
    initialQuestion = null,
    unitLessons = null,
    disabled = false,
    processing = false,
    errors = {},
    onSubmit,
    onCancel = null,
    submitLabel = 'Simpan Soal',
}) {
    const [form, setForm] = useState(() => buildInitialState(initialQuestion, unitLessons));

    const handleSubmit = (e) => {
        e.preventDefault();

        let question_data = {};
        let answer_key = {};

        if (form.question_type === 'mc_pasan_to_id' || form.question_type === 'mc_id_to_pasan') {
            question_data = { options: form.options };
            answer_key = { correct_option: form.correct_option };
        } else if (form.question_type === 'matching') {
            question_data = {
                left_items: form.left_items,
                right_items: form.right_items,
            };
            answer_key = { pairs: form.pairs };
        } else {
            question_data = {
                template: form.template,
                choices: form.choices,
            };
            answer_key = { correct_choice: form.correct_choice };
        }

        const payload = {
            question_type: form.question_type,
            question_text: form.question_text,
            question_data,
            answer_key,
            explanation: form.explanation,
            points: Number(form.points),
        };

        if (unitLessons) {
            payload.primary_lesson_id = form.primary_lesson_id;
        }

        onSubmit(payload);
    };

    const addMatchingPair = () => {
        const nextNum = form.left_items.length + 1;
        const leftId = `L${nextNum}`;
        const rightId = `R${nextNum}`;
        setForm({
            ...form,
            left_items: [...form.left_items, { id: leftId, text: '' }],
            right_items: [...form.right_items, { id: rightId, text: '' }],
            pairs: { ...form.pairs, [leftId]: rightId },
        });
    };

    const removeMatchingPair = (index) => {
        if (form.left_items.length <= 2) return;
        const removedLeftId = form.left_items[index].id;
        const nextLeft = form.left_items.filter((_, i) => i !== index);
        const nextRight = form.right_items.filter((_, i) => i !== index);
        const nextPairs = { ...form.pairs };
        delete nextPairs[removedLeftId];
        setForm({
            ...form,
            left_items: nextLeft,
            right_items: nextRight,
            pairs: nextPairs,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-surface-soft border border-border-subtle rounded-[16px] p-4 sm:p-5">
            {unitLessons && (
                <div>
                    <label htmlFor="primary_lesson_id" className="block text-sm font-semibold text-ink mb-1">
                        Lesson Sumber Utama (untuk Rekomendasi Remedial)
                    </label>
                    <select
                        id="primary_lesson_id"
                        value={form.primary_lesson_id}
                        disabled={disabled}
                        onChange={(e) => setForm({ ...form, primary_lesson_id: e.target.value })}
                        className="w-full h-12 px-3 rounded-[12px] border border-border-control bg-surface text-sm text-ink"
                        required
                    >
                        {unitLessons.map((lesson) => (
                            <option key={lesson.id} value={lesson.id}>
                                Lesson {lesson.order_number}: {lesson.title}
                            </option>
                        ))}
                    </select>
                    {errors.primary_lesson_id && (
                        <p className="mt-1 text-xs font-semibold text-brand flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" aria-hidden="true" />
                            <span>{errors.primary_lesson_id}</span>
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                    <label htmlFor="question_type" className="block text-sm font-semibold text-ink mb-1">
                        Jenis Soal
                    </label>
                    <select
                        id="question_type"
                        value={form.question_type}
                        disabled={disabled}
                        onChange={(e) => setForm({ ...form, question_type: e.target.value })}
                        className="w-full h-12 px-3 rounded-[12px] border border-border-control bg-surface text-sm text-ink"
                    >
                        {QUESTION_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="points" className="block text-sm font-semibold text-ink mb-1">
                        Bobot Poin
                    </label>
                    <input
                        id="points"
                        type="number"
                        min={1}
                        max={100}
                        value={form.points}
                        disabled={disabled}
                        onChange={(e) => setForm({ ...form, points: e.target.value })}
                        className="w-full h-12 px-3 rounded-[12px] border border-border-control bg-surface text-sm text-ink"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="question_text" className="block text-sm font-semibold text-ink mb-1">
                    Teks Pertanyaan
                </label>
                <textarea
                    id="question_text"
                    rows={2}
                    value={form.question_text}
                    disabled={disabled}
                    onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                    placeholder="Tulis pertanyaan dengan jelas"
                    className="w-full p-3 rounded-[12px] border border-border-control bg-surface text-sm text-ink"
                    required
                />
            </div>

            {(form.question_type === 'mc_pasan_to_id' || form.question_type === 'mc_id_to_pasan') && (
                <div className="space-y-2.5">
                    <p className="text-sm font-semibold text-ink">Opsi Jawaban & Kunci Benar</p>
                    {form.options.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="correct_option"
                                id={`opt_${opt.id}`}
                                checked={form.correct_option === opt.id}
                                disabled={disabled}
                                onChange={() => setForm({ ...form, correct_option: opt.id })}
                                className="w-4 h-4 accent-success shrink-0"
                                aria-label={`Jadikan opsi ${opt.id} sebagai kunci benar`}
                            />
                            <span className="w-7 text-sm font-bold text-ink">{opt.id}.</span>
                            <input
                                type="text"
                                value={opt.label}
                                disabled={disabled}
                                onChange={(e) => {
                                    const next = [...form.options];
                                    next[idx] = { ...opt, label: e.target.value };
                                    setForm({ ...form, options: next });
                                }}
                                placeholder={`Teks opsi ${opt.id}`}
                                className="flex-1 h-11 px-3 rounded-[12px] border border-border-control bg-surface text-sm text-ink"
                                required
                            />
                        </div>
                    ))}
                </div>
            )}

            {form.question_type === 'matching' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">Pasangan Kiri, Kanan, & Kunci</p>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={addMatchingPair}
                            className="inline-flex items-center gap-1 min-h-11 px-3 rounded-[12px] border border-border-control bg-surface text-xs font-bold text-ink"
                        >
                            <Plus className="w-4 h-4" aria-hidden="true" />
                            Tambah Pasangan
                        </button>
                    </div>
                    {form.left_items.map((left, idx) => (
                        <div key={left.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-surface p-2.5 rounded-[12px] border border-border-subtle">
                            <input
                                type="text"
                                value={left.text}
                                disabled={disabled}
                                onChange={(e) => {
                                    const next = [...form.left_items];
                                    next[idx] = { ...left, text: e.target.value };
                                    setForm({ ...form, left_items: next });
                                }}
                                placeholder={`Kiri ${left.id}`}
                                className="sm:col-span-4 h-11 px-3 rounded-[10px] border border-border-control text-sm"
                                required
                            />
                            <input
                                type="text"
                                value={form.right_items[idx]?.text || ''}
                                disabled={disabled}
                                onChange={(e) => {
                                    const next = [...form.right_items];
                                    next[idx] = { id: next[idx]?.id || `R${idx + 1}`, text: e.target.value };
                                    setForm({ ...form, right_items: next });
                                }}
                                placeholder={`Kanan R${idx + 1}`}
                                className="sm:col-span-4 h-11 px-3 rounded-[10px] border border-border-control text-sm"
                                required
                            />
                            <select
                                value={form.pairs[left.id] || ''}
                                disabled={disabled}
                                onChange={(e) => setForm({ ...form, pairs: { ...form.pairs, [left.id]: e.target.value } })}
                                aria-label={`Pasangan benar untuk ${left.id}`}
                                className="sm:col-span-3 h-11 px-2 rounded-[10px] border border-border-control text-sm bg-success-tint text-ink font-semibold"
                            >
                                {form.right_items.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        Kunci: {r.id}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={disabled || form.left_items.length <= 2}
                                onClick={() => removeMatchingPair(idx)}
                                aria-label={`Hapus pasangan ${left.id}`}
                                className="sm:col-span-1 inline-flex items-center justify-center min-h-11 text-brand disabled:opacity-40"
                            >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {form.question_type === 'fill_blank' && (
                <div className="space-y-3">
                    <div>
                        <label htmlFor="template_text" className="block text-sm font-semibold text-ink mb-1">
                            Kalimat Rumpang (gunakan ___ untuk bagian kosong)
                        </label>
                        <input
                            id="template_text"
                            type="text"
                            value={form.template}
                            disabled={disabled}
                            onChange={(e) => setForm({ ...form, template: e.target.value })}
                            className="w-full h-11 px-3 rounded-[12px] border border-border-control bg-surface text-sm"
                            required
                        />
                    </div>
                    <p className="text-sm font-semibold text-ink">Pilihan Pengisi & Kunci Benar</p>
                    {form.choices.map((ch, idx) => (
                        <div key={ch.id} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="correct_choice"
                                checked={form.correct_choice === ch.id}
                                disabled={disabled}
                                onChange={() => setForm({ ...form, correct_choice: ch.id })}
                                className="w-4 h-4 accent-success shrink-0"
                                aria-label={`Jadikan pilihan ${ch.id} sebagai kunci benar`}
                            />
                            <span className="w-7 text-sm font-bold text-ink">{ch.id}.</span>
                            <input
                                type="text"
                                value={ch.label}
                                disabled={disabled}
                                onChange={(e) => {
                                    const next = [...form.choices];
                                    next[idx] = { ...ch, label: e.target.value };
                                    setForm({ ...form, choices: next });
                                }}
                                placeholder={`Pilihan ${ch.id}`}
                                className="flex-1 h-11 px-3 rounded-[12px] border border-border-control bg-surface text-sm"
                                required
                            />
                        </div>
                    ))}
                </div>
            )}

            <div>
                <label htmlFor="explanation" className="block text-sm font-semibold text-ink mb-1">
                    Pembahasan Jawaban (opsional)
                </label>
                <textarea
                    id="explanation"
                    rows={2}
                    value={form.explanation}
                    disabled={disabled}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    placeholder="Ditampilkan setelah Learner menyelesaikan soal"
                    className="w-full p-3 rounded-[12px] border border-border-control bg-surface text-sm text-ink"
                />
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
                {onCancel && (
                    <TactileButton variant="neutral" onClick={onCancel}>
                        Batal
                    </TactileButton>
                )}
                <TactileButton type="submit" variant="brand" disabled={disabled || processing}>
                    {processing ? 'Menyimpan...' : submitLabel}
                </TactileButton>
            </div>
        </form>
    );
}
