import React from 'react';
import { Check } from 'lucide-react';

export default function FillBlank({
    question,
    value = null,
    onChange,
    disabled = false,
}) {
    const selectedChoiceId = value?.selected_choice || '';
    const template = question.question_data?.template || '___';
    const choices = question.question_data?.choices || [];
    const selectedLabel = choices.find((c) => c.id === selectedChoiceId)?.label;
    const parts = template.split('___');

    return (
        <div className="space-y-4">
            <div className="p-4 rounded-[16px] bg-surface-soft border border-border-subtle text-base sm:text-lg font-semibold text-ink leading-relaxed">
                {parts.map((part, idx) => (
                    <React.Fragment key={idx}>
                        <span>{part}</span>
                        {idx < parts.length - 1 && (
                            <span className="inline-flex items-center px-3 py-0.5 mx-1 rounded-[8px] border-2 border-dashed border-brand bg-surface text-brand font-bold min-w-[80px] justify-center">
                                {selectedLabel || '......'}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={question.question_text}>
                {choices.map((ch) => {
                    const isSelected = selectedChoiceId === ch.id;
                    return (
                        <button
                            key={ch.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={disabled}
                            onClick={() => onChange({ selected_choice: ch.id })}
                            className={`min-h-12 px-4 py-2.5 rounded-[12px] border text-left flex items-center justify-between gap-2 ${
                                isSelected
                                    ? 'bg-surface-highlight border-2 border-brand text-ink font-semibold'
                                    : 'bg-surface border-border-control text-ink hover:bg-surface-soft'
                            }`}
                        >
                            <span>
                                <strong className="mr-2">{ch.id}.</strong>
                                {ch.label}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
