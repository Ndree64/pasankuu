import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import FocusLayout from '../../Layouts/FocusLayout';
import TactileButton from '../../Components/UI/TactileButton';
import StatusBadge from '../../Components/UI/StatusBadge';
import MultipleChoice from '../../Components/Questions/MultipleChoice';
import MatchingPairs from '../../Components/Questions/MatchingPairs';
import FillBlank from '../../Components/Questions/FillBlank';
import EmptyState from '../../Components/UI/EmptyState';

export default function LessonPlayer({
    lesson,
    attempt,
    activities,
    completed_activity_ids,
    submitted_responses,
    mode,
}) {
    const { flash } = usePage().props;
    const lessonFeedback = flash?.lesson_feedback;
    const lessonResult = flash?.lesson_result;

    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState(() => {
        const init = {};
        Object.entries(submitted_responses || {}).forEach(([qId, r]) => {
            init[qId] = r.response_data;
        });
        return init;
    });
    const [submitting, setSubmitting] = useState(false);

    const totalSteps = activities.length;
    const current = activities[stepIndex];

    const handleCompleteMaterial = () => {
        setSubmitting(true);
        router.post(
            `/learner/lessons/${lesson.id}/activities/${current.id}/complete`,
            { attempt_id: attempt.id },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
                onSuccess: () => {
                    if (stepIndex < totalSteps - 1) {
                        setStepIndex(stepIndex + 1);
                    }
                },
            }
        );
    };

    const handleSubmitQuestion = (questionId) => {
        const responseData = answers[questionId];
        if (!responseData) return;

        setSubmitting(true);
        router.post(
            `/learner/lessons/${lesson.id}/responses`,
            {
                attempt_id: attempt.id,
                question_id: questionId,
                response_data: responseData,
            },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleFinishLesson = () => {
        setSubmitting(true);
        router.post(
            `/learner/lessons/${lesson.id}/finish`,
            { attempt_id: attempt.id },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const renderQuestion = (q) => {
        const saved = submitted_responses?.[q.id];
        const props = {
            question: q,
            value: answers[q.id],
            disabled: submitting,
            onChange: (val) => setAnswers({ ...answers, [q.id]: val }),
        };

        return (
            <div key={q.id} className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink-soft">
                        Soal {q.order_number} ({q.points} poin)
                    </span>
                    {saved && (
                        <StatusBadge
                            status={saved.is_correct ? 'passed' : 'failed'}
                            labelOverride={saved.is_correct ? 'Tersimpan: Benar' : 'Tersimpan: Periksa Lagi'}
                        />
                    )}
                </div>

                <p className="font-semibold text-base text-ink">{q.question_text}</p>

                {q.question_type === 'matching' ? (
                    <MatchingPairs {...props} />
                ) : q.question_type === 'fill_blank' ? (
                    <FillBlank {...props} />
                ) : (
                    <MultipleChoice {...props} />
                )}

                {lessonFeedback && lessonFeedback.question_id === q.id && (
                    <div
                        className={`p-3.5 rounded-[12px] border text-sm space-y-1 animate-slide-up ${
                            lessonFeedback.is_correct
                                ? 'bg-success-tint border-success text-ink'
                                : 'bg-brand-tint border-brand text-ink'
                        }`}
                    >
                        <p className="font-bold flex items-center gap-1.5">
                            {lessonFeedback.is_correct ? (
                                <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-brand" aria-hidden="true" />
                            )}
                            <span>
                                {lessonFeedback.is_correct ? 'Jawaban tepat!' : 'Belum tepat.'} ({lessonFeedback.earned_points} / {lessonFeedback.max_points} poin)
                            </span>
                        </p>
                        {lessonFeedback.explanation && (
                            <p className="text-ink-soft">{lessonFeedback.explanation}</p>
                        )}
                    </div>
                )}

                <div className="flex justify-end">
                    <TactileButton
                        variant="accent"
                        disabled={submitting || !answers[q.id]}
                        onClick={() => handleSubmitQuestion(q.id)}
                        className="min-h-11 px-4 text-sm"
                    >
                        Periksa Jawaban
                    </TactileButton>
                </div>
            </div>
        );
    };

    const allQuestionsInCurrent = current?.questions || [];
    const allCurrentQuestionsSubmitted = allQuestionsInCurrent.every(
        (q) => Boolean(submitted_responses?.[q.id])
    );

    return (
        <FocusLayout
            closeHref="/learner"
            progressValue={lessonResult ? totalSteps : stepIndex + 1}
            progressMax={Math.max(1, totalSteps)}
            progressTone={mode === 'remedial' ? 'accent' : 'success'}
            progressLabel={
                totalSteps > 0
                    ? `${mode === 'remedial' ? 'Remedial ' : ''}${stepIndex + 1} / ${totalSteps}`
                    : 'Kosong'
            }
        >
            <Head title={lesson.title} />

            {totalSteps === 0 ? (
                <EmptyState
                    title="Materi lesson belum tersedia"
                    description="Lesson ini belum memiliki aktivitas materi maupun latihan."
                    actionLabel="Kembali ke Jalur Belajar"
                    actionHref="/learner"
                />
            ) : lessonResult ? (
                <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-6 sm:p-8 space-y-6 animate-slide-up">
                    <div className="text-center space-y-3">
                        <StatusBadge
                            status={lessonResult.status}
                            labelOverride={lessonResult.status === 'passed' ? 'Lulus Lesson' : 'Belum Lulus (Min. 75)'}
                        />
                        <h1 className="font-display text-4xl font-bold text-ink">
                            {lessonResult.score} / 100
                        </h1>
                        {lessonResult.xp_awarded > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-accent text-ink text-sm font-bold">
                                <Sparkles className="w-4 h-4" aria-hidden="true" />
                                +{lessonResult.xp_awarded} XP
                            </span>
                        )}
                    </div>

                    {lessonResult.new_badges?.length > 0 && (
                        <div className="p-4 rounded-[16px] bg-accent-tint border border-accent-border text-sm text-ink">
                            <p className="font-bold">Lencana Baru Diraih:</p>
                            <ul className="list-disc pl-5 mt-1">
                                {lessonResult.new_badges.map((b) => (
                                    <li key={b.code}>{b.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {lessonResult.review_items?.length > 0 && (
                        <div className="space-y-2.5">
                            <h2 className="font-display text-lg font-bold text-ink">Pembahasan Soal</h2>
                            {lessonResult.review_items.map((item, idx) => (
                                <div key={item.question_id} className="p-3.5 rounded-[12px] bg-surface-soft border border-border-subtle space-y-1">
                                    <p className="font-semibold text-sm text-ink">
                                        {idx + 1}. {item.question_text}
                                    </p>
                                    <p className={`text-xs font-bold ${item.is_correct ? 'text-success' : 'text-brand'}`}>
                                        {item.is_correct ? 'Benar' : 'Perlu diperbaiki'} ({item.earned_points} / {item.max_points} poin)
                                    </p>
                                    {item.explanation && <p className="text-xs text-ink-soft">{item.explanation}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        {lessonResult.status !== 'passed' && (
                            <TactileButton
                                variant="accent"
                                onClick={() => router.visit(window.location.href)}
                            >
                                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                <span>Ulangi Latihan</span>
                            </TactileButton>
                        )}
                        <TactileButton variant="brand" href="/learner">
                            Kembali ke Jalur Belajar
                        </TactileButton>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                            Unit {lesson.unit_order}: {lesson.unit_title} | Lesson {lesson.unit_order}.{lesson.order_number}
                        </p>
                        <h1 className="font-display text-2xl font-bold text-ink mt-1">{current.title}</h1>
                        {current.instruction && (
                            <p className="text-sm text-ink-soft mt-1">{current.instruction}</p>
                        )}
                    </div>

                    {current.activity_type === 'material' ? (
                        <div className="bg-surface border border-border-subtle rounded-[20px] p-6 space-y-5">
                            <div className="flex items-center gap-2 text-brand font-bold text-sm">
                                <BookOpen className="w-4 h-4" aria-hidden="true" />
                                <span>Materi Singkat</span>
                            </div>

                            <p className="text-base text-ink leading-relaxed whitespace-pre-line">
                                {current.material?.content || '(Materi sedang dilengkapi.)'}
                            </p>

                            {current.material?.explanation && (
                                <div className="p-4 rounded-[12px] bg-surface-soft border border-border-subtle text-sm text-ink-soft">
                                    <strong className="text-ink">Catatan:</strong> {current.material.explanation}
                                </div>
                            )}

                            {current.material?.vocabularies?.length > 0 && (
                                <div className="space-y-2">
                                    <h2 className="font-display text-base font-bold text-ink">Kosakata Kunci</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {current.material.vocabularies.map((v) => (
                                            <div key={v.id} className="p-3.5 rounded-[12px] bg-surface-soft border border-border-subtle">
                                                <p className="font-bold text-ink">{v.pasan_word}</p>
                                                <p className="text-sm font-semibold text-ink-soft">{v.indonesian_meaning}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {current.material?.examples?.length > 0 && (
                                <div className="space-y-2">
                                    <h2 className="font-display text-base font-bold text-ink">Contoh Kalimat</h2>
                                    <div className="space-y-2">
                                        {current.material.examples.map((ex) => (
                                            <div key={ex.id} className="p-3.5 rounded-[12px] bg-surface-highlight border border-border-subtle">
                                                <p className="font-bold text-ink">{ex.pasan_text}</p>
                                                <p className="text-sm text-ink-soft">{ex.indonesian_translation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {current.questions.map((q) => renderQuestion(q))}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <TactileButton
                            variant="neutral"
                            disabled={stepIndex === 0 || submitting}
                            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                        >
                            Sebelumnya
                        </TactileButton>

                        {current.activity_type === 'material' ? (
                            stepIndex < totalSteps - 1 ? (
                                <TactileButton variant="success" disabled={submitting} onClick={handleCompleteMaterial}>
                                    Tandai Selesai & Lanjut
                                </TactileButton>
                            ) : (
                                <TactileButton
                                    variant="success"
                                    disabled={submitting}
                                    onClick={() => {
                                        router.post(
                                            `/learner/lessons/${lesson.id}/activities/${current.id}/complete`,
                                            { attempt_id: attempt.id },
                                            { onSuccess: () => handleFinishLesson() }
                                        );
                                    }}
                                >
                                    Tandai Selesai & Akhiri
                                </TactileButton>
                            )
                        ) : stepIndex < totalSteps - 1 ? (
                            <TactileButton
                                variant="brand"
                                disabled={!allCurrentQuestionsSubmitted || submitting}
                                onClick={() => setStepIndex(stepIndex + 1)}
                            >
                                Lanjut ke Aktivitas Berikutnya
                            </TactileButton>
                        ) : (
                            <TactileButton
                                variant="success"
                                disabled={!allCurrentQuestionsSubmitted || submitting}
                                onClick={handleFinishLesson}
                            >
                                Selesaikan Lesson
                            </TactileButton>
                        )}
                    </div>
                </div>
            )}
        </FocusLayout>
    );
}
