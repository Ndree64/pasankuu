import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Play, Check, Lock, Clock, Trophy, Star, Sparkles, AlertTriangle, BookMarked } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import ProgressBar from '../../Components/UI/ProgressBar';
import TactileButton from '../../Components/UI/TactileButton';
import EmptyState from '../../Components/UI/EmptyState';

const ZIGZAG_OFFSETS = ['translate-x-0', 'sm:translate-x-10', 'sm:-translate-x-8', 'sm:translate-x-8', 'translate-x-0'];

function LessonNode({ unitOrder, lesson, index }) {
    const offset = ZIGZAG_OFFSETS[index % ZIGZAG_OFFSETS.length];
    const status = lesson.node_status;

    const circleContent = () => {
        if (status === 'completed') {
            return (
                <Link
                    href={`/learner/lessons/${lesson.id}`}
                    aria-label={`Ulangi Lesson ${unitOrder}.${lesson.order_number}: ${lesson.title} (Selesai)`}
                    className="w-[72px] h-[72px] rounded-full tactile-success flex items-center justify-center"
                >
                    <Check className="w-8 h-8 text-white stroke-[2.75]" aria-hidden="true" />
                </Link>
            );
        }

        if (status === 'active') {
            return (
                <div className="flex flex-col items-center gap-2">
                    <span className="px-3 py-1 rounded-[8px] bg-surface border border-accent-border text-[11px] font-bold uppercase tracking-wider text-ink shadow-focal">
                        MULAI
                    </span>
                    <Link
                        href={`/learner/lessons/${lesson.id}`}
                        aria-label={`Mulai Lesson ${unitOrder}.${lesson.order_number}: ${lesson.title}`}
                        className="w-[84px] h-[84px] rounded-full tactile-accent border-2 border-accent-border flex items-center justify-center"
                    >
                        <Play className="w-8 h-8 text-ink fill-ink ml-0.5" aria-hidden="true" />
                    </Link>
                </div>
            );
        }

        if (status === 'unpublished') {
            return (
                <div
                    aria-label={`Lesson ${unitOrder}.${lesson.order_number}: Segera hadir (dalam validasi)`}
                    className="w-[72px] h-[72px] rounded-full bg-surface-soft border-2 border-dashed border-border-control flex items-center justify-center text-ink-soft"
                >
                    <Clock className="w-6 h-6" aria-hidden="true" />
                </div>
            );
        }

        return (
            <div
                aria-label={`Lesson ${unitOrder}.${lesson.order_number}: Terkunci`}
                className="w-[72px] h-[72px] rounded-full tactile-locked flex items-center justify-center"
            >
                <Lock className="w-6 h-6 text-ink-soft" aria-hidden="true" />
            </div>
        );
    };

    return (
        <div className={`flex flex-col items-center text-center max-w-[240px] ${offset}`}>
            {circleContent()}
            <p className="mt-2.5 text-xs font-bold text-ink-soft">
                Lesson {unitOrder}.{lesson.order_number}
            </p>
            <p className="text-sm font-bold text-ink leading-snug">{lesson.title}</p>
            {status === 'unpublished' && (
                <span className="mt-1 text-xs font-medium text-ink-soft">
                    Segera hadir (dalam validasi)
                </span>
            )}
        </div>
    );
}

function QuizNode({ unit }) {
    const quiz = unit.quiz;
    if (!quiz) return null;

    const status = quiz.status;

    return (
        <div className="flex flex-col items-center text-center max-w-[240px] pt-2">
            {status === 'active' ? (
                <div className="flex flex-col items-center gap-2">
                    <span className="px-3 py-1 rounded-[8px] bg-surface border border-accent-border text-[11px] font-bold uppercase tracking-wider text-ink shadow-focal">
                        QUIZ UNIT
                    </span>
                    <Link
                        href={`/learner/quizzes/${unit.id}`}
                        aria-label={`Mulai ${quiz.title}`}
                        className="w-[84px] h-[84px] rounded-full tactile-accent border-2 border-accent-border flex items-center justify-center"
                    >
                        <Trophy className="w-8 h-8 text-ink" aria-hidden="true" />
                    </Link>
                </div>
            ) : status === 'completed' ? (
                <Link
                    href={`/learner/quizzes/${unit.id}`}
                    aria-label={`${quiz.title} (Lulus)`}
                    className="w-[82px] h-[82px] rounded-full tactile-success flex items-center justify-center"
                >
                    <Trophy className="w-8 h-8 text-white" aria-hidden="true" />
                </Link>
            ) : (
                <div
                    aria-label={`${quiz.title} (${status === 'unpublished' ? 'Belum terbit' : 'Terkunci'})`}
                    className="w-[82px] h-[82px] rounded-full tactile-locked flex items-center justify-center"
                >
                    <Trophy className="w-7 h-7 text-ink-soft" aria-hidden="true" />
                </div>
            )}

            <p className="mt-2.5 text-xs font-bold text-ink-soft">Evaluasi Unit {unit.order_number}</p>
            <p className="text-sm font-bold text-ink">{quiz.title}</p>
            {status === 'unpublished' && (
                <span className="mt-1 text-xs text-ink-soft">Segera hadir (dalam validasi)</span>
            )}
            {status === 'remedial_blocked' && (
                <span className="mt-1 text-xs font-semibold text-brand">
                    Terkunci sementara hingga remedial selesai
                </span>
            )}
        </div>
    );
}

export default function LearningPath({ units, summary }) {
    const rightRail = (
        <div className="space-y-4">
            <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                            Level {summary.level.level}
                        </p>
                        <h2 className="font-display text-lg font-bold text-ink">{summary.level.title}</h2>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-[8px] bg-accent text-ink text-sm font-bold">
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        {summary.total_xp} XP
                    </span>
                </div>
                <ProgressBar
                    value={summary.level.progress_percent}
                    max={100}
                    tone="accent"
                    label="Progres menuju level berikutnya"
                />
                <p className="text-xs text-ink-soft">
                    {summary.level.next_level_xp
                        ? `${summary.total_xp} / ${summary.level.next_level_xp} XP menuju level berikutnya`
                        : 'Level tertinggi tercapai'}
                </p>
            </div>

            <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                <h2 className="font-display text-base font-bold text-ink">Progres Kurikulum</h2>
                <ProgressBar
                    value={summary.completed_lessons}
                    max={Math.max(1, summary.total_lessons)}
                    tone="success"
                    label="Lesson terbit yang sudah lulus"
                />
                <p className="text-xs text-ink-soft">
                    {summary.completed_lessons} dari {summary.total_lessons} lesson terbit selesai.
                </p>
                <div className="pt-1">
                    <TactileButton variant="neutral" href="/learner/kamus" className="w-full min-h-11 text-sm">
                        <BookMarked className="w-4 h-4" aria-hidden="true" />
                        <span>Buka Kamus Bahasa Pasan</span>
                    </TactileButton>
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout rightRail={rightRail}>
            <Head title="Jalur Belajar Bahasa Pasan" />

            <div className="space-y-8">
                <div>
                    <h1 className="font-display text-[24px] sm:text-[26px] lg:text-[28px] font-bold text-ink">
                        Jalur Belajar Bahasa Pasan
                    </h1>
                    <p className="text-sm sm:text-[15px] text-ink-soft mt-1">
                        Ikuti lesson secara berurutan, lalu taklukkan Quiz Unit untuk membuka unit berikutnya.
                    </p>
                </div>

                {units.length === 0 ? (
                    <EmptyState
                        title="Kurikulum belum tersedia"
                        description="Materi pembelajaran sedang disiapkan oleh Admin dan Validator."
                    />
                ) : (
                    <div className="space-y-10">
                        {units.map((unit) => (
                            <section key={unit.id} className="space-y-6">
                                {/* Unit Banner */}
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
                                            {unit.is_unlocked ? (
                                                <>
                                                    <Star className="w-3.5 h-3.5" aria-hidden="true" />
                                                    <span>Aktif</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                                                    <span>Terkunci</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Vertical Zig-Zag Nodes */}
                                <div className="flex flex-col items-center gap-7 py-2">
                                    {unit.lessons.map((lesson, idx) => (
                                        <LessonNode
                                            key={lesson.id}
                                            unitOrder={unit.order_number}
                                            lesson={lesson}
                                            index={idx}
                                        />
                                    ))}

                                    <QuizNode unit={unit} />
                                </div>

                                {/* Kartu Remedial jika Quiz Unit gagal */}
                                {unit.active_remedials?.length > 0 && (
                                    <div className="bg-accent-tint border-2 border-accent-border rounded-[20px] p-5 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-ink shrink-0" aria-hidden="true" />
                                                <h3 className="font-display text-lg font-bold text-ink">
                                                    Rekomendasi Remedial Unit {unit.order_number}
                                                </h3>
                                            </div>
                                            {unit.quiz?.latest_failed_score !== null && (
                                                <span className="px-2.5 py-1 rounded-[8px] bg-surface border border-accent-border text-xs font-bold text-ink">
                                                    Skor Quiz Terakhir: {unit.quiz.latest_failed_score} / 100
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-ink-soft">
                                            Selesaikan lesson berikut dengan nilai minimal 75 untuk membuka kembali Quiz Unit {unit.order_number}.
                                        </p>

                                        <div className="space-y-2.5">
                                            {unit.active_remedials.map((r) => (
                                                <div
                                                    key={r.id}
                                                    className="bg-surface border border-accent-border rounded-[14px] p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                                >
                                                    <div>
                                                        <p className="text-xs font-bold text-ink-soft">
                                                            Prioritas #{r.priority_order} | {r.error_count} kesalahan di quiz
                                                        </p>
                                                        <p className="font-bold text-ink">
                                                            Lesson {unit.order_number}.{r.lesson_order}: {r.lesson_title}
                                                        </p>
                                                    </div>

                                                    {r.status === 'completed' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-success-tint border border-success text-success text-xs font-bold">
                                                            <Check className="w-4 h-4" aria-hidden="true" />
                                                            <span>Selesai</span>
                                                        </span>
                                                    ) : (
                                                        <TactileButton
                                                            variant="accent"
                                                            href={`/learner/lessons/${r.lesson_id}?mode=remedial&assignment=${r.id}`}
                                                            className="min-h-11 px-4 text-xs shrink-0"
                                                        >
                                                            Mulai Remedial
                                                        </TactileButton>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
