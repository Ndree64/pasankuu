import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Play, Trophy } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';

export default function PreviewPath({ units, filter }) {
    const previewControls = (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                onClick={() => router.get('/preview', { filter: 'all' })}
                className={`min-h-11 px-3 rounded-[10px] text-xs font-bold border ${
                    filter === 'all' ? 'bg-ink text-canvas border-ink' : 'bg-surface text-ink border-accent-border'
                }`}
            >
                Semua Status
            </button>
            <button
                type="button"
                onClick={() => router.get('/preview', { filter: 'published' })}
                className={`min-h-11 px-3 rounded-[10px] text-xs font-bold border ${
                    filter === 'published' ? 'bg-ink text-canvas border-ink' : 'bg-surface text-ink border-accent-border'
                }`}
            >
                Hanya Terbit
            </button>
        </div>
    );

    return (
        <AppLayout isPreview previewControls={previewControls}>
            <Head title="Mode Pratinjau Jalur Belajar" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                        Pratinjau Jalur Belajar Pasanku
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Uji seluruh unit, lesson, dan quiz secara langsung tanpa menyimpan progres atau XP.
                    </p>
                </div>

                <div className="space-y-6">
                    {units.map((unit) => (
                        <section key={unit.id} className="space-y-4">
                            <div className="tactile-brand rounded-[20px] p-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-white/85">
                                        UNIT {unit.order_number}
                                    </p>
                                    <h2 className="font-display text-xl font-bold text-white">{unit.title}</h2>
                                </div>
                                <span className="px-3 py-1 rounded-[8px] bg-white/15 text-white text-xs font-bold">
                                    Pratinjau Bebas
                                </span>
                            </div>

                            <div className="bg-surface border border-border-subtle rounded-[16px] divide-y divide-border-subtle">
                                {unit.lessons.map((lesson) => (
                                    <div key={lesson.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-bold text-ink-soft">
                                                    Lesson {unit.order_number}.{lesson.order_number}
                                                </span>
                                                <StatusBadge status={lesson.status} />
                                            </div>
                                            <p className="font-semibold text-ink">{lesson.title}</p>
                                        </div>

                                        <TactileButton
                                            variant="accent"
                                            href={`/preview/lessons/${lesson.id}`}
                                            className="min-h-11 px-4 text-xs"
                                        >
                                            <Play className="w-3.5 h-3.5" aria-hidden="true" />
                                            <span>Simulasi Lesson</span>
                                        </TactileButton>
                                    </div>
                                ))}

                                {unit.quiz && (
                                    <div className="p-4 bg-surface-soft flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Trophy className="w-5 h-5 text-accent-lip" aria-hidden="true" />
                                            <span className="font-bold text-ink">{unit.quiz.title}</span>
                                            <StatusBadge status={unit.quiz.status} />
                                        </div>

                                        <TactileButton
                                            variant="brand"
                                            href={`/preview/quizzes/${unit.id}`}
                                            className="min-h-11 px-4 text-xs"
                                        >
                                            Simulasi Quiz
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
