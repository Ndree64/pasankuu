import React, { useState } from 'react';
import { Link2, RotateCcw } from 'lucide-react';

export default function MatchingPairs({
    question,
    value = null,
    onChange,
    disabled = false,
}) {
    const [selectedLeft, setSelectedLeft] = useState(null);
    const leftItems = question.question_data?.left_items || [];
    const rightItems = question.question_data?.right_items || [];
    const pairs = value?.pairs || {};

    const handleLeftClick = (leftId) => {
        if (disabled) return;
        setSelectedLeft(selectedLeft === leftId ? null : leftId);
    };

    const handleRightClick = (rightId) => {
        if (disabled || !selectedLeft) return;

        const nextPairs = { ...pairs };
        Object.keys(nextPairs).forEach((k) => {
            if (nextPairs[k] === rightId) {
                delete nextPairs[k];
            }
        });
        nextPairs[selectedLeft] = rightId;

        onChange({ pairs: nextPairs });
        setSelectedLeft(null);
    };

    const pairIndexForLeft = (leftId) => {
        const idx = leftItems.findIndex((i) => i.id === leftId);
        return pairs[leftId] ? idx + 1 : null;
    };

    const pairIndexForRight = (rightId) => {
        const matchedLeftId = Object.keys(pairs).find((k) => pairs[k] === rightId);
        if (!matchedLeftId) return null;
        const idx = leftItems.findIndex((i) => i.id === matchedLeftId);
        return idx >= 0 ? idx + 1 : null;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
                <span>Pilih satu kata di kolom kiri, lalu ketuk pasangannya di kolom kanan.</span>
                {Object.keys(pairs).length > 0 && !disabled && (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedLeft(null);
                            onChange({ pairs: {} });
                        }}
                        className="inline-flex items-center gap-1 min-h-11 px-3 rounded-[10px] border border-border-control bg-surface font-semibold text-ink"
                    >
                        <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Reset Pasangan</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Kata / Ungkapan</p>
                    {leftItems.map((item) => {
                        const isActive = selectedLeft === item.id;
                        const pairNum = pairIndexForLeft(item.id);

                        return (
                            <button
                                key={item.id}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleLeftClick(item.id)}
                                className={`w-full min-h-12 px-4 py-2.5 rounded-[12px] border text-left flex items-center justify-between gap-2 ${
                                    isActive
                                        ? 'bg-accent text-ink border-2 border-accent-border font-bold'
                                        : pairNum
                                        ? 'bg-surface-highlight border-brand text-ink font-semibold'
                                        : 'bg-surface border-border-control text-ink hover:bg-surface-soft'
                                }`}
                            >
                                <span>{item.text}</span>
                                {pairNum && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-brand text-white text-xs font-bold">
                                        <Link2 className="w-3 h-3" aria-hidden="true" />
                                        {pairNum}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Pasangan Arti</p>
                    {rightItems.map((item) => {
                        const pairNum = pairIndexForRight(item.id);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                disabled={disabled || !selectedLeft}
                                onClick={() => handleRightClick(item.id)}
                                className={`w-full min-h-12 px-4 py-2.5 rounded-[12px] border text-left flex items-center justify-between gap-2 ${
                                    pairNum
                                        ? 'bg-surface-highlight border-brand text-ink font-semibold'
                                        : selectedLeft
                                        ? 'bg-surface border-accent-border text-ink hover:bg-accent-tint'
                                        : 'bg-surface-soft border-border-subtle text-ink-soft'
                                }`}
                            >
                                <span>{item.text}</span>
                                {pairNum && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-brand text-white text-xs font-bold">
                                        <Link2 className="w-3 h-3" aria-hidden="true" />
                                        {pairNum}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
