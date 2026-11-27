import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import FocusLayout from '../../Layouts/FocusLayout';
import TactileButton from '../../Components/UI/TactileButton';
import MultipleChoice from '../../Components/Questions/MultipleChoice';
import MatchingPairs from '../../Components/Questions/MatchingPairs';
import FillBlank from '../../Components/Questions/FillBlank';
import EmptyState from '../../Components/UI/EmptyState';

export default function PreviewQuiz({ unit, quiz, questions }) {
    const { flash } = usePage().props;
    const previewResult = flash?.preview_result;
    const [responses, setResponses] = useState({});

    const answeredCount = Object.keys(responses).length;

    const renderQuestion = (q) => {
        const props = {
            question: q,
            value: responses[q.id],
            onChange: (val) => setResponses({ ...responses, [q.id]: val }),
        };

        if (q.question_type === 'matching') return <MatchingPairs {...props} />;
        if (q.question_type === 'fill_blank') return <FillBlank {...props} />;
        return <MultipleChoice {...props} />;
    };

    return (
        <FocusLayout
            isPreview
            closeHref="/preview"
            progressValue={answeredCount}
            progressMax={Math.max(1, questions.length)}
            progressTone="accent"
            progressLabel={`${answeredCount} / ${questions.length} terjawab`}
        >
            <Head title={`Pratinjau: ${quiz.title}`} />

            {questions.length === 0 ? (
                <EmptyState
                    title="Belum ada soal pada Quiz Unit ini"
                    description="Tambahkan 15 sampai 20 soal pada Manajemen Quiz Unit Admin."
                    actionLabel="Kembali ke Pratinjau"
                    actionHref="/preview"
                />
            ) : previewResult ? (
                <div className="bg-surface border border-border-subtle rounded-[20px] p-6 space-y-5 animate-slide-up">
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold uppercase text-ink-soft">Hasil Simulasi Quiz Unit</p>
                        <h1 className="font-display text-3xl font-bold text-ink">{previewResult.score} / 100</h1>
                        <p className="text-sm font-semibold text-ink-soft">
                            {previewResult.passed ? 'Simulasi Lulus' : 'Simulasi Belum Lulus'} (tidak disimpan ke database)
                        </p>
                    </div>

                    {previewResult.simulated_remedials?.length > 0 && (
                        <div className="p-4 rounded-[16px] bg-accent-tint border-2 border-accent-border space-y-2">
                            <p className="font-bold text-sm text-ink">Simulasi Rekomendasi Remedial (Maksimal 3):</p>
                            <ul className="list-disc pl-5 text-sm text-ink space-y-1">
                                {previewResult.simulated_remedials.map((r) => (
                                    <li key={r.lesson_id}>
                                        {r.lesson_title} ({r.error_count} kesalahan)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <TactileButton variant="neutral" href="/preview">
                            Kembali ke Pratinjau
                        </TactileButton>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="bg-surface border border-border-subtle rounded-[20px] p-5">
                        <p className="text-xs font-bold uppercase text-ink-soft">Unit {unit.order_number}: {unit.title}</p>
                        <h1 className="font-display text-2xl font-bold text-ink mt-1">{quiz.title}</h1>
                    </div>

                    {questions.map((q, idx) => (
                        <div key={q.id} className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                            <p className="text-xs font-bold text-ink-soft">
                                Soal {idx + 1} / {questions.length} | Sumber: {q.primary_lesson_title}
                            </p>
                            <p className="font-semibold text-ink">{q.question_text}</p>
                            {renderQuestion(q)}
                        </div>
                    ))}

                    <div className="flex justify-end">
                        <TactileButton
                            variant="accent"
                            onClick={() =>
                                router.post(`/preview/quizzes/${unit.id}/evaluate`, { responses }, { preserveScroll: true })
                            }
                        >
                            Hitung Simulasi Quiz
                        </TactileButton>
                    </div>
                </div>
            )}
        </FocusLayout>
    );
}
