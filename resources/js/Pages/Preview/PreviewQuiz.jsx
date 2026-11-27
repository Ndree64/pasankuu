import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import FocusLayout from '../../Layouts/FocusLayout';
import TactileButton from '../../Components/UI/TactileButton';
import StatusBadge from '../../Components/UI/StatusBadge';
import MultipleChoice from '../../Components/Questions/MultipleChoice';
import MatchingPairs from '../../Components/Questions/MatchingPairs';
import FillBlank from '../../Components/Questions/FillBlank';
import EmptyState from '../../Components/UI/EmptyState';

export default function PreviewQuiz({ unit, quiz, questions }) {
    const { flash } = usePage().props;
    const previewResult = flash?.preview_result;
    const [responses, setResponses] = useState({});

    const answeredCount = questions.filter((q) => Boolean(responses[q.id])).length;

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
            progressValue={previewResult ? questions.length : answeredCount}
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
                <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-6 sm:p-8 space-y-6 animate-slide-up">
                    <div className="text-center space-y-3">
                        <StatusBadge
                            status={previewResult.passed ? 'passed' : 'failed'}
                            labelOverride={
                                previewResult.passed
                                    ? 'Simulasi Lulus Quiz Unit (Tidak Disimpan)'
                                    : 'Simulasi Belum Lulus Quiz Unit'
                            }
                        />
                        <h1 className="font-display text-4xl font-bold text-ink">{previewResult.score} / 100</h1>
                    </div>

                    {previewResult.simulated_remedials?.length > 0 && (
                        <div className="bg-accent-tint border-2 border-accent-border rounded-[16px] p-5 space-y-3">
                            <div className="flex items-center gap-2 font-display font-bold text-lg text-ink">
                                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                                <span>Simulasi Rekomendasi Remedial (Maks. 3 Lesson)</span>
                            </div>
                            <div className="space-y-2">
                                {previewResult.simulated_remedials.map((r, idx) => (
                                    <div
                                        key={r.lesson_id}
                                        className="bg-surface border border-accent-border rounded-[12px] p-3.5 flex items-center justify-between gap-2"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-ink-soft">
                                                Prioritas #{idx + 1} | {r.error_count} kesalahan
                                            </p>
                                            <p className="font-bold text-ink">{r.lesson_title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2.5">
                        <h2 className="font-display text-lg font-bold text-ink">Pembahasan Simulasi Jawaban</h2>
                        {previewResult.items?.map((item, idx) => (
                            <div key={item.question_id} className="p-3.5 rounded-[12px] bg-surface-soft border border-border-subtle space-y-1">
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

                    <div className="flex flex-wrap justify-center gap-3">
                        <TactileButton variant="accent" onClick={() => router.visit(`/preview/quizzes/${unit.id}`)}>
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
                    <div className="bg-surface border border-border-subtle rounded-[20px] p-5 space-y-3">
                        <p className="text-xs font-bold uppercase text-ink-soft">
                            Evaluasi Unit {unit.order_number}: {unit.title}
                        </p>
                        <h1 className="font-display text-2xl font-bold text-ink">{quiz.title}</h1>
                        <p className="text-sm text-ink-soft">
                            Simulasi {questions.length} soal dengan nilai kelulusan minimal {quiz.passing_score}.
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {questions.map((q, idx) => (
                                <a
                                    key={q.id}
                                    href={`#preview-quiz-q-${idx + 1}`}
                                    className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-xs font-bold border ${
                                        responses[q.id]
                                            ? 'bg-success text-white border-success-lip'
                                            : 'bg-surface-soft text-ink-soft border-border-control'
                                    }`}
                                >
                                    {idx + 1}
                                </a>
                            ))}
                        </div>
                    </div>

                    {questions.map((q, idx) => (
                        <section
                            id={`preview-quiz-q-${idx + 1}`}
                            key={q.id}
                            className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-4"
                        >
                            <span className="text-xs font-bold text-ink-soft">
                                Soal {idx + 1} / {questions.length} | Sumber: {q.primary_lesson_title} ({q.points} poin)
                            </span>
                            <p className="font-semibold text-ink">{q.question_text}</p>
                            {renderQuestion(q)}
                        </section>
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
