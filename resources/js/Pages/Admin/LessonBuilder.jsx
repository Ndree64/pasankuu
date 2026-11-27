import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Lock,
    ArrowUp,
    ArrowDown,
    Plus,
    Trash2,
    Send,
    Globe,
    RotateCcw,
    BookOpen,
    HelpCircle,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';
import QuestionEditor from '../../Components/Admin/QuestionEditor';

function MaterialEditor({ activity, disabled }) {
    const initial = activity.material || {};
    const [content, setContent] = useState(initial.content || '');
    const [explanation, setExplanation] = useState(initial.explanation || '');
    const [vocabularies, setVocabularies] = useState(initial.vocabularies || []);
    const [examples, setExamples] = useState(initial.examples || []);

    const handleSave = (e) => {
        e.preventDefault();
        router.put(`/admin/activities/${activity.id}/material`, {
            content,
            explanation,
            vocabularies,
            examples,
        });
    };

    return (
        <form onSubmit={handleSave} className="space-y-4 pt-3 border-t border-border-subtle">
            <div>
                <label htmlFor={`content_${activity.id}`} className="block text-sm font-semibold text-ink mb-1">
                    Isi Materi Singkat
                </label>
                <textarea
                    id={`content_${activity.id}`}
                    rows={3}
                    value={content}
                    disabled={disabled}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan penjelasan materi singkat Bahasa Pasan"
                    className="w-full p-3 rounded-[12px] border border-border-control bg-surface text-sm"
                    required
                />
            </div>

            <div>
                <label htmlFor={`exp_${activity.id}`} className="block text-sm font-semibold text-ink mb-1">
                    Kotak Catatan (opsional)
                </label>
                <input
                    id={`exp_${activity.id}`}
                    type="text"
                    value={explanation}
                    disabled={disabled}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Catatan penggunaan atau konteks budaya"
                    className="w-full h-11 px-3 rounded-[12px] border border-border-control bg-surface text-sm"
                />
            </div>

            {/* Kosakata */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">Daftar Kosakata</span>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                            setVocabularies([
                                ...vocabularies,
                                { pasan_word: '', indonesian_meaning: '', category: '' },
                            ])
                        }
                        className="inline-flex items-center gap-1 min-h-11 px-3 rounded-[12px] border border-border-control bg-surface text-xs font-bold"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        Tambah Kosakata
                    </button>
                </div>
                {vocabularies.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                            type="text"
                            value={v.pasan_word}
                            disabled={disabled}
                            onChange={(e) => {
                                const next = [...vocabularies];
                                next[idx] = { ...v, pasan_word: e.target.value };
                                setVocabularies(next);
                            }}
                            placeholder="Kata Bahasa Pasan"
                            className="sm:col-span-4 h-11 px-3 rounded-[10px] border border-border-control bg-surface text-sm"
                            required
                        />
                        <input
                            type="text"
                            value={v.indonesian_meaning}
                            disabled={disabled}
                            onChange={(e) => {
                                const next = [...vocabularies];
                                next[idx] = { ...v, indonesian_meaning: e.target.value };
                                setVocabularies(next);
                            }}
                            placeholder="Arti Bahasa Indonesia"
                            className="sm:col-span-5 h-11 px-3 rounded-[10px] border border-border-control bg-surface text-sm"
                            required
                        />
                        <input
                            type="text"
                            value={v.category || ''}
                            disabled={disabled}
                            onChange={(e) => {
                                const next = [...vocabularies];
                                next[idx] = { ...v, category: e.target.value };
                                setVocabularies(next);
                            }}
                            placeholder="Kategori"
                            className="sm:col-span-2 h-11 px-3 rounded-[10px] border border-border-control bg-surface text-sm"
                        />
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setVocabularies(vocabularies.filter((_, i) => i !== idx))}
                            aria-label="Hapus kosakata"
                            className="sm:col-span-1 min-h-11 flex items-center justify-center text-brand"
                        >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Contoh Kalimat */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">Contoh Kalimat</span>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                            setExamples([...examples, { pasan_text: '', indonesian_translation: '' }])
                        }
                        className="inline-flex items-center gap-1 min-h-11 px-3 rounded-[12px] border border-border-control bg-surface text-xs font-bold"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        Tambah Contoh
                    </button>
                </div>
                {examples.map((ex, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
                        <input
                            type="text"
                            value={ex.pasan_text}
                            disabled={disabled}
                            onChange={(e) => {
                                const next = [...examples];
                                next[idx] = { ...ex, pasan_text: e.target.value };
                                setExamples(next);
                            }}
                            placeholder="Kalimat Bahasa Pasan"
                            className="sm:col-span-5 h-11 px-3 rounded-[10px] border border-border-control bg-surface text-sm"
                            required
                        />
                        <input
                            type="text"
                            value={ex.indonesian_translation}
                            disabled={disabled}
                            onChange={(e) => {
                                const next = [...examples];
                                next[idx] = { ...ex, indonesian_translation: e.target.value };
                                setExamples(next);
                            }}
                            placeholder="Terjemahan Bahasa Indonesia"
                            className="sm:col-span-5 h-11 px-3 rounded-[10px] border border-border-control bg-surface text-sm"
                            required
                        />
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => setExamples(examples.filter((_, i) => i !== idx))}
                            aria-label="Hapus contoh kalimat"
                            className="sm:col-span-1 min-h-11 flex items-center justify-center text-brand"
                        >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <TactileButton type="submit" variant="brand" disabled={disabled}>
                    Simpan Materi
                </TactileButton>
            </div>
        </form>
    );
}

export default function LessonBuilder({ lesson, activities, is_locked, reviews }) {
    const [activeTab, setActiveTab] = useState('content');
    const [addingQuestionFor, setAddingQuestionFor] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const metaForm = useForm({
        title: lesson.title,
        description: lesson.description || '',
        objective: lesson.objective || '',
    });

    const newActivityForm = useForm({
        activity_type: 'material',
        title: '',
        instruction: '',
    });

    const moveActivity = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= activities.length) return;
        const reordered = [...activities];
        const [moved] = reordered.splice(index, 1);
        reordered.splice(targetIndex, 0, moved);
        router.patch(`/admin/lessons/${lesson.id}/activities/reorder`, {
            ordered_ids: reordered.map((a) => a.id),
        });
    };

    return (
        <AppLayout>
            <Head title={`Builder: ${lesson.title}`} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                            Unit {lesson.unit_order}: {lesson.unit_title} / Lesson {lesson.unit_order}.{lesson.order_number} (v{lesson.content_version})
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5 mt-1">
                            <h1 className="font-display text-2xl font-bold text-ink">{lesson.title}</h1>
                            <StatusBadge status={lesson.status} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {(lesson.status === 'draft' || lesson.status === 'changes_requested') && (
                            <TactileButton
                                variant="accent"
                                onClick={() => router.post(`/admin/lessons/${lesson.id}/submit-review`)}
                            >
                                <Send className="w-4 h-4" aria-hidden="true" />
                                <span>Ajukan Validasi</span>
                            </TactileButton>
                        )}
                        {lesson.status === 'pending_review' && (
                            <TactileButton
                                variant="neutral"
                                onClick={() => router.post(`/admin/lessons/${lesson.id}/cancel-review`)}
                            >
                                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                <span>Batalkan Pengajuan</span>
                            </TactileButton>
                        )}
                        {lesson.status === 'approved' && (
                            <TactileButton
                                variant="success"
                                onClick={() => router.post(`/admin/lessons/${lesson.id}/publish`)}
                            >
                                <Globe className="w-4 h-4" aria-hidden="true" />
                                <span>Terbitkan Lesson</span>
                            </TactileButton>
                        )}
                    </div>
                </div>

                {is_locked && (
                    <div className="bg-accent-tint border-2 border-accent-border rounded-[16px] p-4 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-ink shrink-0" aria-hidden="true" />
                        <p className="text-sm font-semibold text-ink">
                            Lesson sedang berstatus Menunggu Review dan terkunci dari perubahan hingga Validator memberi keputusan atau pengajuan dibatalkan.
                        </p>
                    </div>
                )}

                {lesson.status === 'published' && (
                    <div className="bg-surface-soft border border-border-control rounded-[16px] p-4 text-sm text-ink-soft">
                        Catatan: mengubah lesson berstatus Terbit akan menaikkan versi konten otomatis dan mengembalikan status ke Draf untuk validasi ulang.
                    </div>
                )}

                {reviews.length > 0 && reviews[0].review_note && (
                    <div className="bg-brand-tint border border-brand rounded-[16px] p-4 text-sm text-ink">
                        <p className="font-bold text-brand">Catatan Validator Terakhir ({reviews[0].reviewer_name || 'Validator'}):</p>
                        <p className="mt-1">{reviews[0].review_note}</p>
                    </div>
                )}

                {/* Tabs */}
                <div role="tablist" className="flex gap-2 border-b border-border-subtle pb-2">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'content'}
                        onClick={() => setActiveTab('content')}
                        className={`min-h-11 px-4 rounded-[12px] text-sm font-bold ${
                            activeTab === 'content' ? 'bg-brand text-white' : 'bg-surface text-ink-soft border border-border-control'
                        }`}
                    >
                        Edit Materi & Soal
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'order'}
                        onClick={() => setActiveTab('order')}
                        className={`min-h-11 px-4 rounded-[12px] text-sm font-bold ${
                            activeTab === 'order' ? 'bg-brand text-white' : 'bg-surface text-ink-soft border border-border-control'
                        }`}
                    >
                        Urutan Aktivitas ({activities.length})
                    </button>
                </div>

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        {/* Identitas Lesson */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                metaForm.put(`/admin/lessons/${lesson.id}`);
                            }}
                            className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-4"
                        >
                            <h2 className="font-display text-lg font-bold text-ink">Identitas Lesson</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="lesson_title" className="block text-sm font-semibold text-ink mb-1">
                                        Judul Lesson
                                    </label>
                                    <input
                                        id="lesson_title"
                                        type="text"
                                        value={metaForm.data.title}
                                        disabled={is_locked}
                                        onChange={(e) => metaForm.setData('title', e.target.value)}
                                        className="w-full h-11 px-3 rounded-[12px] border border-border-control text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lesson_objective" className="block text-sm font-semibold text-ink mb-1">
                                        Tujuan Belajar
                                    </label>
                                    <input
                                        id="lesson_objective"
                                        type="text"
                                        value={metaForm.data.objective}
                                        disabled={is_locked}
                                        onChange={(e) => metaForm.setData('objective', e.target.value)}
                                        className="w-full h-11 px-3 rounded-[12px] border border-border-control text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="lesson_desc" className="block text-sm font-semibold text-ink mb-1">
                                    Deskripsi Singkat
                                </label>
                                <textarea
                                    id="lesson_desc"
                                    rows={2}
                                    value={metaForm.data.description}
                                    disabled={is_locked}
                                    onChange={(e) => metaForm.setData('description', e.target.value)}
                                    className="w-full p-3 rounded-[12px] border border-border-control text-sm"
                                />
                            </div>
                            <div className="flex justify-end">
                                <TactileButton type="submit" variant="brand" disabled={is_locked || metaForm.processing}>
                                    Simpan Identitas
                                </TactileButton>
                            </div>
                        </form>

                        {/* Daftar Aktivitas & Isinya */}
                        {activities.map((activity) => (
                            <section
                                key={activity.id}
                                className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        {activity.activity_type === 'material' ? (
                                            <BookOpen className="w-5 h-5 text-brand" aria-hidden="true" />
                                        ) : (
                                            <HelpCircle className="w-5 h-5 text-accent-lip" aria-hidden="true" />
                                        )}
                                        <div>
                                            <span className="text-xs font-bold uppercase text-ink-soft">
                                                Aktivitas {activity.order_number}: {activity.activity_type === 'material' ? 'Materi' : 'Latihan'}
                                            </span>
                                            <h3 className="font-display text-lg font-bold text-ink">{activity.title}</h3>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={is_locked}
                                        onClick={() => router.delete(`/admin/activities/${activity.id}`)}
                                        className="inline-flex items-center gap-1 min-h-11 px-3 rounded-[12px] text-xs font-bold text-brand hover:bg-brand-tint disabled:opacity-40"
                                    >
                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                        Hapus Aktivitas
                                    </button>
                                </div>

                                {activity.activity_type === 'material' ? (
                                    <MaterialEditor activity={activity} disabled={is_locked} />
                                ) : (
                                    <div className="space-y-3 pt-3 border-t border-border-subtle">
                                        {activity.questions.map((q) => (
                                            <div key={q.id} className="p-4 rounded-[12px] bg-surface-soft border border-border-subtle space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="text-xs font-bold text-ink-soft">
                                                        Soal #{q.order_number} | {q.question_type} | {q.points} poin
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={is_locked}
                                                            onClick={() => setEditingQuestion(editingQuestion?.id === q.id ? null : q)}
                                                            className="min-h-11 px-3 rounded-[10px] border border-border-control bg-surface text-xs font-bold text-ink"
                                                        >
                                                            Ubah
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={is_locked}
                                                            onClick={() => router.delete(`/admin/lesson-questions/${q.id}`)}
                                                            className="min-h-11 px-3 rounded-[10px] bg-brand-tint text-xs font-bold text-brand"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-ink text-sm">{q.question_text}</p>
                                                {editingQuestion?.id === q.id && (
                                                    <QuestionEditor
                                                        initialQuestion={q}
                                                        disabled={is_locked}
                                                        onCancel={() => setEditingQuestion(null)}
                                                        onSubmit={(payload) => {
                                                            router.put(`/admin/lesson-questions/${q.id}`, payload, {
                                                                onSuccess: () => setEditingQuestion(null),
                                                            });
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        {addingQuestionFor === activity.id ? (
                                            <QuestionEditor
                                                disabled={is_locked}
                                                onCancel={() => setAddingQuestionFor(null)}
                                                onSubmit={(payload) => {
                                                    router.post(`/admin/activities/${activity.id}/questions`, payload, {
                                                        onSuccess: () => setAddingQuestionFor(null),
                                                    });
                                                }}
                                            />
                                        ) : (
                                            <TactileButton
                                                variant="neutral"
                                                disabled={is_locked}
                                                onClick={() => setAddingQuestionFor(activity.id)}
                                            >
                                                <Plus className="w-4 h-4" aria-hidden="true" />
                                                <span>Tambah Soal Latihan</span>
                                            </TactileButton>
                                        )}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}

                {activeTab === 'order' && (
                    <div className="space-y-5">
                        <div className="bg-surface border border-border-subtle rounded-[16px] divide-y divide-border-subtle">
                            {activities.map((activity, idx) => (
                                <div key={activity.id} className="p-4 flex items-center justify-between gap-3">
                                    <div>
                                        <span className="text-xs font-bold uppercase text-ink-soft">
                                            #{activity.order_number} ({activity.activity_type === 'material' ? 'Materi' : 'Latihan'})
                                        </span>
                                        <p className="font-semibold text-ink">{activity.title}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={is_locked || idx === 0}
                                            onClick={() => moveActivity(idx, -1)}
                                            aria-label={`Naikkan ${activity.title}`}
                                            className="inline-flex items-center gap-1 min-h-11 px-3 rounded-[12px] border border-border-control bg-surface text-xs font-bold disabled:opacity-40"
                                        >
                                            <ArrowUp className="w-4 h-4" aria-hidden="true" />
                                            <span>Naik</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={is_locked || idx === activities.length - 1}
                                            onClick={() => moveActivity(idx, 1)}
                                            aria-label={`Turunkan ${activity.title}`}
                                            className="inline-flex items-center gap-1 min-h-11 px-3 rounded-[12px] border border-border-control bg-surface text-xs font-bold disabled:opacity-40"
                                        >
                                            <ArrowDown className="w-4 h-4" aria-hidden="true" />
                                            <span>Turun</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                newActivityForm.post(`/admin/lessons/${lesson.id}/activities`, {
                                    onSuccess: () => newActivityForm.reset('title', 'instruction'),
                                });
                            }}
                            className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3"
                        >
                            <h3 className="font-display text-lg font-bold text-ink">Tambah Aktivitas Baru</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label htmlFor="act_type" className="block text-xs font-semibold text-ink mb-1">
                                        Jenis Aktivitas
                                    </label>
                                    <select
                                        id="act_type"
                                        value={newActivityForm.data.activity_type}
                                        disabled={is_locked}
                                        onChange={(e) => newActivityForm.setData('activity_type', e.target.value)}
                                        className="w-full h-11 px-3 rounded-[12px] border border-border-control bg-surface text-sm"
                                    >
                                        <option value="material">Materi Singkat</option>
                                        <option value="exercise">Latihan Interaktif</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="act_title" className="block text-xs font-semibold text-ink mb-1">
                                        Judul Aktivitas
                                    </label>
                                    <input
                                        id="act_title"
                                        type="text"
                                        value={newActivityForm.data.title}
                                        disabled={is_locked}
                                        onChange={(e) => newActivityForm.setData('title', e.target.value)}
                                        placeholder="Contoh: Pengenalan Sapaan Pagi"
                                        className="w-full h-11 px-3 rounded-[12px] border border-border-control bg-surface text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <TactileButton type="submit" variant="brand" disabled={is_locked || newActivityForm.processing}>
                                    <Plus className="w-4 h-4" aria-hidden="true" />
                                    <span>Tambah ke Urutan</span>
                                </TactileButton>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
