import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { BookOpen, RotateCcw } from 'lucide-react';
import FocusLayout from '../../Layouts/FocusLayout';
import TactileButton from '../../Components/UI/TactileButton';
import StatusBadge from '../../Components/UI/StatusBadge';
import MultipleChoice from '../../Components/Questions/MultipleChoice';
import MatchingPairs from '../../Components/Questions/MatchingPairs';
import FillBlank from '../../Components/Questions/FillBlank';
import EmptyState from '../../Components/UI/EmptyState';

export default function PreviewLesson({ lesson, activities }) {
    const { flash } = usePage().props;
    const previewResult = flash?.preview_result;
    const [stepIndex, setStepIndex] = useState(0);
    const [responses, setResponses] = useState({});

    const totalSteps = activities.length;
    const current = activities[stepIndex];

    const handleEvaluate = () => {
        router.post(`/preview/lessons/${lesson.id}/evaluate`, { responses }, { preserveScroll: true });
    };

    const renderQuestion = (q) => {
        const props = {
            question: q,
            value: responses[q.id],
            onChange: (val) => setResponses({ ...responses, [q.id]: val }),
        };

        if (q.question_type === 'matching') return <MatchingPairs key={q.id} {...props} />;
        if (q.question_type === 'fill_blank') return <FillBlank key={q.id} {...props} />;
        return <MultipleChoice key={q.id} {...props} />;
    };

    return (
        <FocusLayout
            isPreview
            closeHref="/preview"
            progressValue={previewResult ? totalSteps : totalSteps > 0 ? stepIndex + 1 : 1}
            progressMax={Math.max(1, totalSteps)}
            progressTone="accent"
            progressLabel={totalSteps > 0 ? `Aktivitas ${stepIndex + 1} / ${totalSteps}` : 'Kosong'}
        >
            <Head title={`Pratinjau: ${lesson.title}`} />

            {totalSteps === 0 ? (
                <EmptyState
                    title="Belum ada aktivitas di lesson ini"
                    description="Tambahkan materi atau latihan di Builder Lesson Admin terlebih dahulu."
                    actionLabel="Kembali ke Pratinjau"
                    actionHref="/preview"
                />
            ) : previewResult ? (
                <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-6 sm:p-8 space-y-6 animate-slide-up">
                    <div className="text-center space-y-3">
                        <StatusBadge
                            status={previewResult.passed ? 'passed' : 'failed'}
                            labelOverride={
                                previewResult.passed
                                    ? 'Simulasi Lulus (Tidak Disimpan)'
                                    : 'Simulasi Belum Lulus (Min. 75)'
                            }
                        />
                        <h1 className="font-display text-4xl font-bold text-ink">{previewResult.score} / 100</h1>
                    </div>

                    <div className="space-y-2.5">
                        <h2 className="font-display text-lg font-bold text-ink">Pembahasan Simulasi Soal</h2>
                        {previewResult.items.map((item, idx) => (
                            <div
                                key={item.question_id}
                                className="p-3.5 rounded-[12px] bg-surface-soft border border-border-subtle space-y-1"
                            >
                                <p className="font-semibold text-sm text-ink">
                                    {idx + 1}. {item.question_text}
                                </p>
                                <p className={`text-xs font-bold ${item.is_correct ? 'text-success' : 'text-brand'}`}>
                                    {item.is_correct ? 'Benar' : 'Belum tepat'} ({item.earned_points} / {item.max_points} poin)
                                </p>
                                {item.explanation && <p className="text-xs text-ink-soft">{item.explanation}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <TactileButton
                            variant="accent"
                            onClick={() => router.visit(`/preview/lessons/${lesson.id}`)}
                        >
                            <RotateCcw className="w-4 h-4" aria-hidden="true" />
                            <span>Ulangi Simulasi</span>
                        </TactileButton>
                        <TactileButton variant="neutral" href="/preview">
                            Kembali ke Pratinjau
                        </TactileButton>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                            {lesson.unit_title} | {lesson.title}
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
                            {current.questions.map((q, idx) => (
                                <div key={q.id} className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-4">
                                    <span className="text-xs font-bold text-ink-soft">
                                        Soal {idx + 1} ({q.points} poin)
                                    </span>
                                    <p className="font-semibold text-base text-ink">{q.question_text}</p>
                                    {renderQuestion(q)}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-between gap-3 pt-2">
                        <TactileButton
                            variant="neutral"
                            disabled={stepIndex === 0}
                            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                        >
                            Sebelumnya
                        </TactileButton>

                        {stepIndex < totalSteps - 1 ? (
                            <TactileButton variant="success" onClick={() => setStepIndex(stepIndex + 1)}>
                                Lanjut ke Aktivitas Berikutnya
                            </TactileButton>
                        ) : (
                            <TactileButton variant="accent" onClick={handleEvaluate}>
                                Hitung Simulasi Nilai
                            </TactileButton>
                        )}
                    </div>
                </div>
            )}
        </FocusLayout>
    );
}
