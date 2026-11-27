import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import FocusLayout from '../../Layouts/FocusLayout';
import TactileButton from '../../Components/UI/TactileButton';
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
            progressValue={totalSteps > 0 ? stepIndex + 1 : 1}
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
                <div className="bg-surface border border-border-subtle rounded-[20px] p-6 space-y-5 animate-slide-up">
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold uppercase text-ink-soft">Hasil Simulasi Pratinjau</p>
                        <h1 className="font-display text-3xl font-bold text-ink">{previewResult.score} / 100</h1>
                        <p className="text-sm font-semibold text-ink-soft">
                            {previewResult.passed ? 'Lulus ambang 75' : 'Belum mencapai 75'} (tidak disimpan ke database)
                        </p>
                    </div>
                    <div className="space-y-2.5">
                        {previewResult.items.map((item, idx) => (
                            <div key={item.question_id} className="p-3.5 rounded-[12px] bg-surface-soft border border-border-subtle">
                                <p className="font-semibold text-sm text-ink">
                                    {idx + 1}. {item.question_text}
                                </p>
                                <p className={`text-xs font-bold mt-1 ${item.is_correct ? 'text-success' : 'text-brand'}`}>
                                    {item.is_correct ? 'Benar' : 'Belum tepat'} ({item.earned_points} / {item.max_points} poin)
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-3">
                        <TactileButton variant="neutral" href="/preview">
                            Kembali ke Pratinjau
                        </TactileButton>
                    </div>
                </div>
            ) : (
                <div className="bg-surface border border-border-subtle rounded-[20px] p-6 space-y-5">
                    <div>
                        <p className="text-xs font-bold uppercase text-ink-soft">{lesson.unit_title} | {lesson.title}</p>
                        <h1 className="font-display text-2xl font-bold text-ink mt-1">{current.title}</h1>
                    </div>

                    {current.activity_type === 'material' ? (
                        <div className="space-y-4">
                            <p className="text-base text-ink whitespace-pre-line">{current.material?.content || '(Materi masih kosong)'}</p>
                            {current.material?.explanation && (
                                <div className="p-4 rounded-[12px] bg-surface-soft border border-border-subtle text-sm text-ink-soft">
                                    {current.material.explanation}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {current.questions.map((q, idx) => (
                                <div key={q.id} className="space-y-3 pt-3 border-t border-border-subtle first:border-t-0 first:pt-0">
                                    <p className="font-semibold text-ink">
                                        {idx + 1}. {q.question_text}
                                    </p>
                                    {renderQuestion(q)}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-between gap-3 pt-4 border-t border-border-subtle">
                        <TactileButton
                            variant="neutral"
                            disabled={stepIndex === 0}
                            onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                        >
                            Sebelumnya
                        </TactileButton>

                        {stepIndex < totalSteps - 1 ? (
                            <TactileButton variant="brand" onClick={() => setStepIndex(stepIndex + 1)}>
                                Lanjut
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
