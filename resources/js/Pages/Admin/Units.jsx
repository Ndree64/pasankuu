import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Send, Globe, Pencil, AlertCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';

export default function Units({ units }) {
    const [activeUnitId, setActiveUnitId] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        objective: '',
    });

    const handleCreateLesson = (e, unitId) => {
        e.preventDefault();
        post(`/admin/units/${unitId}/lessons`, {
            onSuccess: () => {
                reset();
                setActiveUnitId(null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Kurikulum 5 Unit" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                        Manajemen Unit & Lesson
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Kelola materi lesson, ajukan ke Validator, dan terbitkan konten yang sudah disetujui.
                    </p>
                </div>

                <div className="space-y-5">
                    {units.map((unit) => (
                        <section
                            key={unit.id}
                            className="bg-surface border border-border-subtle rounded-[20px] overflow-hidden"
                        >
                            <div className="bg-brand text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/85">
                                        UNIT {unit.order_number}
                                    </p>
                                    <h2 className="font-display text-xl font-bold">{unit.title}</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveUnitId(activeUnitId === unit.id ? null : unit.id)}
                                    className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-[12px] bg-white text-ink text-xs font-bold"
                                >
                                    <Plus className="w-4 h-4" aria-hidden="true" />
                                    <span>Tambah Lesson Draf</span>
                                </button>
                            </div>

                            {activeUnitId === unit.id && (
                                <form
                                    onSubmit={(e) => handleCreateLesson(e, unit.id)}
                                    className="p-4 bg-surface-soft border-b border-border-subtle space-y-3"
                                >
                                    <h3 className="font-semibold text-sm text-ink">Lesson Draf Baru di Unit {unit.order_number}</h3>
                                    <div>
                                        <label htmlFor={`new_title_${unit.id}`} className="block text-xs font-semibold text-ink mb-1">
                                            Judul Lesson
                                        </label>
                                        <input
                                            id={`new_title_${unit.id}`}
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="Judul lesson"
                                            className="w-full h-11 px-3 rounded-[12px] border border-border-control bg-surface text-sm"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-xs text-brand flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                                <span>{errors.title}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <TactileButton variant="neutral" onClick={() => setActiveUnitId(null)}>
                                            Batal
                                        </TactileButton>
                                        <TactileButton type="submit" variant="brand" disabled={processing}>
                                            Simpan Draf
                                        </TactileButton>
                                    </div>
                                </form>
                            )}

                            <div className="divide-y divide-border-subtle">
                                {unit.lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-bold text-ink-soft">
                                                    Lesson {unit.order_number}.{lesson.order_number} (v{lesson.content_version})
                                                </span>
                                                <StatusBadge status={lesson.status} />
                                            </div>
                                            <p className="font-semibold text-ink">{lesson.title}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <TactileButton
                                                variant="neutral"
                                                href={`/admin/lessons/${lesson.id}`}
                                                className="min-h-11 px-3.5 text-xs"
                                            >
                                                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Builder</span>
                                            </TactileButton>

                                            {(lesson.status === 'draft' || lesson.status === 'changes_requested') && (
                                                <TactileButton
                                                    variant="accent"
                                                    onClick={() => router.post(`/admin/lessons/${lesson.id}/submit-review`)}
                                                    className="min-h-11 px-3.5 text-xs"
                                                >
                                                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                                                    <span>Ajukan Validasi</span>
                                                </TactileButton>
                                            )}

                                            {lesson.status === 'approved' && (
                                                <TactileButton
                                                    variant="success"
                                                    onClick={() => router.post(`/admin/lessons/${lesson.id}/publish`)}
                                                    className="min-h-11 px-3.5 text-xs"
                                                >
                                                    <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                                                    <span>Terbitkan</span>
                                                </TactileButton>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {unit.quiz && (
                                    <div className="px-5 py-3.5 bg-surface-soft flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-bold text-ink">{unit.quiz.title}</span>
                                            <StatusBadge status={unit.quiz.status} />
                                        </div>
                                        <TactileButton
                                            variant="neutral"
                                            href={`/admin/quizzes?unit_id=${unit.id}`}
                                            className="min-h-11 px-3.5 text-xs"
                                        >
                                            Kelola Quiz Unit
                                        </TactileButton>
                                    </div>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
