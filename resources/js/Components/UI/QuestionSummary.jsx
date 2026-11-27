import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const QUESTION_TYPE_LABELS = {
    mc_pasan_to_id: 'Pilihan Ganda (Pasan ke Indonesia)',
    mc_id_to_pasan: 'Pilihan Ganda (Indonesia ke Pasan)',
    matching: 'Mencocokkan Pasangan',
    fill_blank: 'Melengkapi Kalimat Rumpang',
};

export function questionTypeLabel(type) {
    return QUESTION_TYPE_LABELS[type] ?? type;
}

export default function QuestionSummary({ question }) {
    const qType = question.question_type;
    const qData = question.question_data || {};
    const aKey = question.answer_key || {};

    if (qType === 'mc_pasan_to_id' || qType === 'mc_id_to_pasan') {
        const correctId = aKey.correct_option;
        const options = qData.options || [];

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((opt) => {
                    const isCorrect = opt.id === correctId;
                    return (
                        <div
                            key={opt.id}
                            className={`px-3 py-2 rounded-[10px] border text-sm flex items-center justify-between gap-2 ${
                                isCorrect
                                    ? 'bg-success-tint border-success text-ink font-semibold'
                                    : 'bg-surface border-border-subtle text-ink-soft'
                            }`}
                        >
                            <span>
                                <strong className="mr-1.5">{opt.id}.</strong>
                                {opt.label}
                            </span>
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (qType === 'matching') {
        const leftItems = qData.left_items || [];
        const rightMap = Object.fromEntries((qData.right_items || []).map((r) => [r.id, r.text]));
        const pairs = aKey.pairs || {};

        return (
            <div className="space-y-1.5">
                {leftItems.map((left) => {
                    const rightId = pairs[left.id];
                    return (
                        <div
                            key={left.id}
                            className="px-3 py-2 rounded-[10px] bg-success-tint border border-success text-sm flex flex-wrap items-center justify-between gap-2 text-ink"
                        >
                            <span className="font-semibold">{left.text}</span>
                            <span className="text-xs font-bold text-success">
                                Pasangan: {rightMap[rightId] || rightId || '-'}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (qType === 'fill_blank') {
        const correctChoiceId = aKey.correct_choice;
        const choices = qData.choices || [];

        return (
            <div className="space-y-2">
                <p className="px-3 py-2 rounded-[10px] bg-surface border border-border-subtle text-sm text-ink font-medium">
                    Kalimat: {qData.template || '___'}
                </p>
                <div className="flex flex-wrap gap-2">
                    {choices.map((ch) => {
                        const isCorrect = ch.id === correctChoiceId;
                        return (
                            <span
                                key={ch.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border text-xs ${
                                    isCorrect
                                        ? 'bg-success-tint border-success text-ink font-bold'
                                        : 'bg-surface border-border-subtle text-ink-soft'
                                }`}
                            >
                                <span>
                                    {ch.id}. {ch.label}
                                </span>
                                {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-success" aria-hidden="true" />}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    }

    return null;
}
