import React from 'react';
import { Check } from 'lucide-react';

export default function MultipleChoice({
    question,
    value = null,
    onChange,
    disabled = false,
}) {
    const selectedOption = value?.selected_option || '';
    const options = question.question_data?.options || [];

    return (
        <div className="space-y-3" role="radiogroup" aria-label={question.question_text}>
            {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={disabled}
                        onClick={() => onChange({ selected_option: opt.id })}
                        className={`w-full min-h-12 px-4 py-3 rounded-[12px] border text-left flex items-center justify-between gap-3 transition-colors ${
                            isSelected
                                ? 'bg-surface-highlight border-2 border-brand text-ink font-semibold'
                                : 'bg-surface border-border-control text-ink hover:bg-surface-soft'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-sm font-bold shrink-0 ${
                                    isSelected
                                        ? 'bg-brand text-white'
                                        : 'bg-surface-soft text-ink border border-border-subtle'
                                }`}
                            >
                                {opt.id}
                            </span>
                            <span className="text-[15px]">{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />}
                    </button>
                );
            })}
        </div>
    );
}
