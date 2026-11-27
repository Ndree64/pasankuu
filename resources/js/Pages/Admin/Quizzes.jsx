import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Send, Globe, RotateCcw, Lock, AlertCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';
import QuestionEditor from '../../Components/Admin/QuestionEditor';

export default function Quizzes({ units, selected_unit_id, unit_lessons, selected_quiz }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const questionCount = selected_quiz?.questions?.length || 0;
    const isCountValid = questionCount >= 15 && questionCount <= 20;

    return (
        <AppLayout>
            <Head title="Manajemen Quiz Unit" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                            Manajemen Quiz Unit
                        </h1>
                        <p className="text-sm text-ink-soft mt-1">
                            Setiap Quiz Unit wajib berisi 15 sampai 20 soal dan dipetakan ke satu lesson sumber utama.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="unit_selector" className="sr-only">
                            Pilih Unit
                        </label>
                        <select
                            id="unit_selector"
                            value={selected_unit_id || ''}
                            onChange={(e) => router.get('/admin/quizzes', { unit_id: e.target.value })}
                            className="h-12 px-4 rounded-[12px] border border-border-control bg-surface font-semibold text-sm text-ink"
                        >
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    Unit {u.order_number}: {u.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selected_quiz && (
                    <div className="space-y-5">
                        <div className="bg-surface border border-border-subtle rounded-[16px] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-display text-xl font-bold text-ink">{selected_quiz.title}</h2>
                                    <StatusBadge status={selected_quiz.status} />
                                </div>
                                <p className={`text-sm font-semibold ${isCountValid ? 'text-success' : 'text-brand'}`}>
                                    Jumlah soal saat ini: {questionCount} / 15 sampai 20 soal
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {(selected_quiz.status === 'draft' || selected_quiz.status === 'changes_requested') && (
                                    <TactileButton
                                        variant="accent"
                                        onClick={() => router.post(`/admin/quizzes/${selected_quiz.id}/submit-review`)}
                                    >
                                        <Send className="w-4 h-4" aria-hidden="true" />
                                        <span>Ajukan Validasi</span>
                                    </TactileButton>
                                )}
                                {selected_quiz.status === 'pending_review' && (
                                    <TactileButton
                                        variant="neutral"
                                        onClick={() => router.post(`/admin/quizzes/${selected_quiz.id}/cancel-review`)}
                                    >
                                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                        <span>Batalkan Pengajuan</span>
                                    </TactileButton>
                                )}
                                {selected_quiz.status === 'approved' && (
                                    <TactileButton
                                        variant="success"
                                        onClick={() => router.post(`/admin/quizzes/${selected_quiz.id}/publish`)}
                                    >
                                        <Globe className="w-4 h-4" aria-hidden="true" />
                                        <span>Terbitkan Quiz</span>
                                    </TactileButton>
                                )}
                            </div>
                        </div>

                        {selected_quiz.is_locked && (
                            <div className="bg-accent-tint border-2 border-accent-border rounded-[16px] p-4 flex items-center gap-3">
                                <Lock className="w-5 h-5 text-ink shrink-0" aria-hidden="true" />
                                <p className="text-sm font-semibold text-ink">
                                    Quiz sedang menunggu review Validator dan terkunci dari perubahan.
                                </p>
                            </div>
                        )}

                        {!isCountValid && (
                            <div className="bg-brand-tint border border-brand rounded-[16px] p-4 flex items-center gap-2.5 text-sm font-semibold text-brand">
                                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                                <span>Tambahkan soal hingga berjumlah 15 sampai 20 soal sebelum mengajukan validasi.</span>
                            </div>
                        )}

                        {!selected_quiz.is_locked && questionCount < 20 && (
                            <div>
                                {showAdd ? (
                                    <QuestionEditor
                                        unitLessons={unit_lessons}
                                        disabled={selected_quiz.is_locked}
                                        onCancel={() => setShowAdd(false)}
                                        onSubmit={(payload) => {
                                            router.post(`/admin/quizzes/${selected_quiz.id}/questions`, payload, {
                                                onSuccess: () => setShowAdd(false),
                                            });
                                        }}
                                    />
                                ) : (
                                    <TactileButton variant="brand" onClick={() => setShowAdd(true)}>
                                        <Plus className="w-4 h-4" aria-hidden="true" />
                                        <span>Tambah Soal Quiz</span>
                                    </TactileButton>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {selected_quiz.questions.map((q) => (
                                <div key={q.id} className="bg-surface border border-border-subtle rounded-[16px] p-4 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="text-xs font-bold text-ink-soft">
                                            Soal #{q.order_number} | {q.question_type} | Sumber: {q.primary_lesson_title} | {q.points} poin
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={selected_quiz.is_locked}
                                                onClick={() => setEditingId(editingId === q.id ? null : q.id)}
                                                className="min-h-11 px-3 rounded-[10px] border border-border-control bg-surface text-xs font-bold"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                type="button"
                                                disabled={selected_quiz.is_locked}
                                                onClick={() => router.delete(`/admin/quiz-questions/${q.id}`)}
                                                className="min-h-11 px-3 rounded-[10px] bg-brand-tint text-xs font-bold text-brand"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-ink">{q.question_text}</p>

                                    {editingId === q.id && (
                                        <QuestionEditor
                                            initialQuestion={q}
                                            unitLessons={unit_lessons}
                                            disabled={selected_quiz.is_locked}
                                            onCancel={() => setEditingId(null)}
                                            onSubmit={(payload) => {
                                                router.put(`/admin/quiz-questions/${q.id}`, payload, {
                                                    onSuccess: () => setEditingId(null),
                                                });
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
