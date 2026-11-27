import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Eye, AlertCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';

export default function ReviewDetail({ review, package: pkg }) {
    const [tab, setTab] = useState(pkg.type === 'lesson' ? 'materials' : 'questions');
    const { data, setData, post, processing, errors } = useForm({
        review_note: review.review_note || '',
    });

    const isPending = review.status === 'pending';

    return (
        <AppLayout>
            <Head title={`Periksa: ${pkg.title}`} />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                            {pkg.unit_title} | {pkg.type === 'lesson' ? 'Paket Lesson' : 'Paket Quiz Unit'} v{pkg.content_version}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <h1 className="font-display text-2xl font-bold text-ink">{pkg.title}</h1>
                            <StatusBadge status={review.status} />
                        </div>
                    </div>

                    <TactileButton
                        variant="accent"
                        href={pkg.type === 'lesson' ? `/preview/lessons/${pkg.id}` : '/preview'}
                    >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>Uji di Mode Pratinjau</span>
                    </TactileButton>
                </div>

                <div className="bg-surface-soft border border-border-control rounded-[16px] p-4 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-ink shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-ink-soft">
                        Catatan peran: Validator memeriksa keakuratan Bahasa Pasan dan soal, lalu menyetujui atau meminta revisi. Penerbitan akhir ke Learner dilakukan oleh Admin.
                    </p>
                </div>

                {pkg.type === 'lesson' && (
                    <div role="tablist" className="flex gap-2 border-b border-border-subtle pb-2">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'materials'}
                            onClick={() => setTab('materials')}
                            className={`min-h-11 px-4 rounded-[12px] text-sm font-bold ${
                                tab === 'materials' ? 'bg-brand text-white' : 'bg-surface border border-border-control text-ink-soft'
                            }`}
                        >
                            Materi & Kosakata
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === 'questions'}
                            onClick={() => setTab('questions')}
                            className={`min-h-11 px-4 rounded-[12px] text-sm font-bold ${
                                tab === 'questions' ? 'bg-brand text-white' : 'bg-surface border border-border-control text-ink-soft'
                            }`}
                        >
                            Soal & Kunci Jawaban
                        </button>
                    </div>
                )}

                {pkg.type === 'lesson' && tab === 'materials' && (
                    <div className="space-y-4">
                        {pkg.activities
                            .filter((a) => a.activity_type === 'material')
                            .map((act) => (
                                <section key={act.id} className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                                    <h2 className="font-display text-lg font-bold text-ink">{act.title}</h2>
                                    <p className="text-sm text-ink whitespace-pre-line">{act.material?.content || '(Materi masih kosong)'}</p>
                                    {act.material?.explanation && (
                                        <p className="p-3 rounded-[12px] bg-surface-soft text-sm text-ink-soft">
                                            Catatan: {act.material.explanation}
                                        </p>
                                    )}
                                    {act.material?.vocabularies?.length > 0 && (
                                        <div className="space-y-1.5 pt-2">
                                            <p className="text-xs font-bold uppercase text-ink-soft">Kosakata</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {act.material.vocabularies.map((v) => (
                                                    <div key={v.id} className="p-3 rounded-[12px] bg-surface-soft border border-border-subtle">
                                                        <p className="font-bold text-ink">{v.pasan_word}</p>
                                                        <p className="text-sm text-ink-soft">{v.indonesian_meaning}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            ))}
                    </div>
                )}

                {tab === 'questions' && (
                    <div className="space-y-3">
                        {(pkg.type === 'lesson'
                            ? pkg.activities.flatMap((a) => a.questions)
                            : pkg.questions
                        ).map((q, idx) => (
                            <div key={q.id} className="bg-surface border border-border-subtle rounded-[16px] p-4 space-y-2">
                                <p className="text-xs font-bold text-ink-soft">
                                    Soal #{idx + 1} | {q.question_type} | {q.points} poin
                                    {q.primary_lesson_title ? ` | Lesson: ${q.primary_lesson_title}` : ''}
                                </p>
                                <p className="font-semibold text-ink">{q.question_text}</p>
                                <div className="p-3 rounded-[12px] bg-success-tint border border-success text-xs text-ink">
                                    <strong>Kunci Jawaban:</strong> {JSON.stringify(q.answer_key)}
                                </div>
                                {q.explanation && (
                                    <p className="text-xs text-ink-soft">Pembahasan: {q.explanation}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {isPending && (
                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-4">
                        <div>
                            <label htmlFor="review_note" className="block text-sm font-semibold text-ink mb-1.5">
                                Catatan Validasi (wajib diisi jika meminta revisi)
                            </label>
                            <textarea
                                id="review_note"
                                rows={3}
                                value={data.review_note}
                                onChange={(e) => setData('review_note', e.target.value)}
                                placeholder="Tuliskan masukan ketepatan kosakata, ejaan Bahasa Pasan, atau soal..."
                                className="w-full p-3 rounded-[12px] border border-border-control text-sm"
                            />
                            {errors.review_note && (
                                <p className="mt-1 text-xs font-semibold text-brand flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                    <span>{errors.review_note}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3 justify-end">
                            <TactileButton
                                variant="neutral"
                                disabled={processing}
                                onClick={() => post(`/validator/reviews/${review.id}/request-changes`)}
                            >
                                <AlertTriangle className="w-4 h-4 text-brand" aria-hidden="true" />
                                <span>Minta Revisi</span>
                            </TactileButton>

                            <TactileButton
                                variant="success"
                                disabled={processing}
                                onClick={() => post(`/validator/reviews/${review.id}/approve`)}
                            >
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                                <span>Setujui Konten</span>
                            </TactileButton>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
