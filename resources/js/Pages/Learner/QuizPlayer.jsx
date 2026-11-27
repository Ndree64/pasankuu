import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Sparkles, AlertTriangle, AlertCircle } from 'lucide-react';
import FocusLayout from '../../Layouts/FocusLayout';
import TactileButton from '../../Components/UI/TactileButton';
import StatusBadge from '../../Components/UI/StatusBadge';
import MultipleChoice from '../../Components/Questions/MultipleChoice';
import MatchingPairs from '../../Components/Questions/MatchingPairs';
import FillBlank from '../../Components/Questions/FillBlank';

export default function QuizPlayer({ unit, quiz, attempt, questions }) {
    const { flash, errors } = usePage().props;
    const quizResult = flash?.quiz_result;

    const [answers, setAnswers] = useState({});
    const [confirmError, setConfirmError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;

    const handleSubmit = () => {
        if (answeredCount < questions.length) {
            setConfirmError(`Masih ada ${questions.length - answeredCount} soal yang belum dijawab.`);
            return;
        }
        setConfirmError('');
        setSubmitting(true);

        const payload = questions.map((q) => ({
            question_id: q.id,
            response_data: answers[q.id],
        }));

        router.post(
            `/learner/quizzes/${unit.id}/submit`,
            {
                attempt_id: attempt.id,
                responses: payload,
            },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <FocusLayout
            closeHref="/learner"
            progressValue={quizResult ? questions.length : answeredCount}
            progressMax={Math.max(1, questions.length)}
            progressTone="accent"
            progressLabel={`${answeredCount} / ${questions.length} terjawab`}
        >
            <Head title={quiz.title} />

            {quizResult ? (
                <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-6 sm:p-8 space-y-6 animate-slide-up">
                    <div className="text-center space-y-3">
                        <StatusBadge
                            status={quizResult.status}
                            labelOverride={quizResult.status === 'passed' ? 'Lulus Quiz Unit' : 'Belum Lulus Quiz Unit'}
                        />
                        <h1 className="font-display text-4xl font-bold text-ink">{quizResult.score} / 100</h1>

                        {quizResult.xp_awarded > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-accent text-ink text-sm font-bold">
                                <Sparkles className="w-4 h-4" aria-hidden="true" />
                                +{quizResult.xp_awarded} XP
                            </span>
                        )}

                        {quizResult.unlocked_next_unit && (
                            <p className="text-sm font-semibold text-success">
                                Unit {quizResult.unlocked_next_unit.order_number} ({quizResult.unlocked_next_unit.title}) kini terbuka!
                            </p>
                        )}
                    </div>

                    {quizResult.remedials?.length > 0 && (
                        <div className="bg-accent-tint border-2 border-accent-border rounded-[16px] p-5 space-y-3">
                            <div className="flex items-center gap-2 font-display font-bold text-lg text-ink">
                                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                                <span>Rekomendasi Remedial Wajib (Maks. 3 Lesson)</span>
                            </div>
                            <p className="text-sm text-ink-soft">
                                Selesaikan lesson berikut terlebih dahulu sebelum mengulang Quiz Unit:
                            </p>
                            <div className="space-y-2">
                                {quizResult.remedials.map((r) => (
                                    <div key={r.id} className="bg-surface border border-accent-border rounded-[12px] p-3.5 flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-bold text-ink-soft">
                                                Prioritas #{r.priority_order} | {r.error_count} kesalahan
                                            </p>
                                            <p className="font-bold text-ink">
                                                Lesson {unit.order_number}.{r.lesson_order}: {r.lesson_title}
                                            </p>
                                        </div>
                                        <TactileButton
                                            variant="accent"
                                            href={`/learner/lessons/${r.lesson_id}?mode=remedial&assignment=${r.id}`}
                                            className="min-h-11 px-4 text-xs"
                                        >
                                            Mulai Remedial
                                        </TactileButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2.5">
                        <h2 className="font-display text-lg font-bold text-ink">Pembahasan Jawaban</h2>
                        {quizResult.review_items?.map((item, idx) => (
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

                    <div className="flex justify-center">
                        <TactileButton variant="brand" href="/learner">
                            Kembali ke Jalur Belajar
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
                            Jawab seluruh {questions.length} soal dengan nilai kelulusan minimal {quiz.passing_score}.
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {questions.map((q, idx) => (
                                <a
                                    key={q.id}
                                    href={`#quiz-q-${idx + 1}`}
                                    className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-xs font-bold border ${
                                        answers[q.id]
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
                            id={`quiz-q-${idx + 1}`}
                            key={q.id}
                            className={`bg-surface border rounded-[16px] p-5 space-y-4 ${
                                confirmError && !answers[q.id] ? 'border-2 border-brand' : 'border-border-subtle'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-ink-soft">
                                    Soal {idx + 1} / {questions.length} ({q.points} poin)
                                </span>
                                {!answers[q.id] && confirmError && (
                                    <span className="text-xs font-bold text-brand">Belum dijawab</span>
                                )}
                            </div>
                            <p className="font-semibold text-ink">{q.question_text}</p>

                            {q.question_type === 'matching' ? (
                                <MatchingPairs
                                    question={q}
                                    value={answers[q.id]}
                                    disabled={submitting}
                                    onChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                                />
                            ) : q.question_type === 'fill_blank' ? (
                                <FillBlank
                                    question={q}
                                    value={answers[q.id]}
                                    disabled={submitting}
                                    onChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                                />
                            ) : (
                                <MultipleChoice
                                    question={q}
                                    value={answers[q.id]}
                                    disabled={submitting}
                                    onChange={(val) => setAnswers({ ...answers, [q.id]: val })}
                                />
                            )}
                        </section>
                    ))}

                    {(confirmError || errors?.responses) && (
                        <div role="alert" className="p-4 rounded-[12px] bg-brand-tint border border-brand text-brand text-sm font-semibold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                            <span>{confirmError || errors.responses}</span>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <TactileButton variant="brand" disabled={submitting} onClick={handleSubmit}>
                            {submitting ? 'Menilai Jawaban...' : 'Kirim Jawaban Quiz Unit'}
                        </TactileButton>
                    </div>
                </div>
            )}
        </FocusLayout>
    );
}
