import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Play, Check, Clock, Trophy, Star, Eye, Layers } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import EmptyState from '../../Components/UI/EmptyState';

const ZIGZAG_OFFSETS = ['translate-x-0', 'sm:translate-x-10', 'sm:-translate-x-8', 'sm:translate-x-8', 'translate-x-0'];

function PreviewLessonNode({ unitOrder, lesson, index }) {
    const offset = ZIGZAG_OFFSETS[index % ZIGZAG_OFFSETS.length];
    const isPublished = lesson.status === 'published';

    return (
        <div className={`flex flex-col items-center text-center max-w-[240px] ${offset}`}>
            {isPublished ? (
                <div className="flex flex-col items-center gap-2">
                    <span className="px-3 py-1 rounded-[8px] bg-surface border border-accent-border text-[11px] font-bold uppercase tracking-wider text-ink shadow-focal">
                        SIMULASI
                    </span>
                    <Link
                        href={`/preview/lessons/${lesson.id}`}
                        aria-label={`Simulasi Lesson ${unitOrder}.${lesson.order_number}: ${lesson.title}`}
                        className="w-[84px] h-[84px] rounded-full tactile-accent border-2 border-accent-border flex items-center justify-center"
                    >
                        <Play className="w-8 h-8 text-ink fill-ink ml-0.5" aria-hidden="true" />
                    </Link>
                </div>
            ) : (
                <Link
                    href={`/preview/lessons/${lesson.id}`}
                    aria-label={`Simulasi Lesson ${unitOrder}.${lesson.order_number}: ${lesson.title} (${lesson.status})`}
                    className="w-[72px] h-[72px] rounded-full bg-surface border-2 border-dashed border-accent-border flex items-center justify-center text-ink hover:bg-accent-tint transition-colors"
                >
                    {lesson.status === 'approved' ? (
                        <Check className="w-7 h-7 text-success" aria-hidden="true" />
                    ) : (
                        <Clock className="w-6 h-6 text-ink-soft" aria-hidden="true" />
                    )}
                </Link>
            )}

            <p className="mt-2.5 text-xs font-bold text-ink-soft">
                Lesson {unitOrder}.{lesson.order_number} (v{lesson.content_version})
            </p>
            <p className="text-sm font-bold text-ink leading-snug">{lesson.title}</p>
            <div className="mt-1.5">
                <StatusBadge status={lesson.status} />
            </div>
        </div>
    );
}

export default function PreviewPath({ units, filter }) {
    const totalLessons = units.reduce((acc, u) => acc + u.lessons.length, 0);
    const publishedLessons = units.reduce(
        (acc, u) => acc + u.lessons.filter((l) => l.status === 'published').length,
        0
    );

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

    const rightRail = (
        <div className="space-y-4">
            <div className="bg-accent-tint border-2 border-accent-border rounded-[20px] shadow-focal p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-ink font-display font-bold text-lg">
                    <Eye className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Tentang Mode Pratinjau</span>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">
                    Tata letak di halaman ini mengikuti jalur belajar Learner. Anda dapat mencoba lesson maupun quiz status apa pun tanpa batasan kunci urutan dan tanpa mengubah database.
                </p>
            </div>

            <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                <div className="flex items-center gap-2 font-display font-bold text-base text-ink">
                    <Layers className="w-4 h-4 text-brand" aria-hidden="true" />
                    <span>Ringkasan Kurikulum</span>
                </div>
                <dl className="grid grid-cols-2 gap-2.5 text-sm">
                    <div className="p-3 rounded-[12px] bg-surface-soft border border-border-subtle">
                        <dt className="text-xs text-ink-soft">Ditampilkan</dt>
                        <dd className="font-display text-2xl font-bold text-ink mt-0.5">{totalLessons}</dd>
                    </div>
                    <div className="p-3 rounded-[12px] bg-success-tint border border-success">
                        <dt className="text-xs text-ink-soft">Sudah Terbit</dt>
                        <dd className="font-display text-2xl font-bold text-ink mt-0.5">{publishedLessons}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );

    return (
        <AppLayout isPreview previewControls={previewControls} rightRail={rightRail}>
            <Head title="Mode Pratinjau Jalur Belajar" />

            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-[24px] sm:text-[26px] lg:text-[28px] font-bold text-ink">
                        Jalur Belajar Bahasa Pasan (Pratinjau)
                    </h1>
                    <p className="text-sm sm:text-[15px] text-ink-soft mt-1">
                        Klik node lesson atau piala Quiz Unit mana saja untuk menguji materi dan penilaian tanpa menyimpan progres.
                    </p>
                </div>

                {units.length === 0 ? (
                    <EmptyState
                        title="Belum ada konten pada filter ini"
                        description="Ubah filter ke Semua Status untuk melihat lesson yang masih berstatus Draf atau Menunggu Review."
                    />
                ) : (
                    <div className="space-y-10">
                        {units.map((unit) => (
                            <section key={unit.id} className="space-y-6">
                                <div className="tactile-brand rounded-[20px] p-5 sm:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="space-y-1 max-w-xl">
                                            <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/90">
                                                UNIT {unit.order_number}
                                            </p>
                                            <h2 className="font-display text-xl sm:text-[22px] font-bold text-white leading-snug">
                                                {unit.title}
                                            </h2>
                                            {unit.description && (
                                                <p className="text-sm text-white/90 leading-relaxed">
                                                    {unit.description}
                                                </p>
                                            )}
                                        </div>

                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white/15 border border-white/25 text-xs font-bold text-white shrink-0">
                                            <Star className="w-3.5 h-3.5" aria-hidden="true" />
                                            <span>Pratinjau Bebas</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-7 py-2">
                                    {unit.lessons.length === 0 ? (
                                        <p className="text-sm text-ink-soft py-2">
                                            Belum ada lesson yang cocok dengan filter aktif di unit ini.
                                        </p>
                                    ) : (
                                        unit.lessons.map((lesson, idx) => (
                                            <PreviewLessonNode
                                                key={lesson.id}
                                                unitOrder={unit.order_number}
                                                lesson={lesson}
                                                index={idx}
                                            />
                                        ))
                                    )}

                                    {unit.quiz && (
                                        <div className="flex flex-col items-center text-center max-w-[240px] pt-2">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="px-3 py-1 rounded-[8px] bg-surface border border-accent-border text-[11px] font-bold uppercase tracking-wider text-ink shadow-focal">
                                                    SIMULASI QUIZ
                                                </span>
                                                <Link
                                                    href={`/preview/quizzes/${unit.id}`}
                                                    aria-label={`Simulasi ${unit.quiz.title}`}
                                                    className="w-[84px] h-[84px] rounded-full tactile-accent border-2 border-accent-border flex items-center justify-center"
                                                >
                                                    <Trophy className="w-8 h-8 text-ink" aria-hidden="true" />
                                                </Link>
                                            </div>
                                            <p className="mt-2.5 text-xs font-bold text-ink-soft">
                                                Evaluasi Unit {unit.order_number}
                                            </p>
                                            <p className="text-sm font-bold text-ink">{unit.quiz.title}</p>
                                            <div className="mt-1.5">
                                                <StatusBadge status={unit.quiz.status} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
