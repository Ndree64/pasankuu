import React from 'react';

export default function ProgressBar({
    value = 0,
    max = 100,
    tone = 'success',
    label = 'Progres belajar',
    className = '',
}) {
    const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
    const barColor = tone === 'accent' ? 'bg-accent' : 'bg-success';

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className={`w-full h-3.5 rounded-full bg-surface-soft border border-border-subtle overflow-hidden ${className}`}
        >
            <div
                className={`h-full rounded-full transition-all duration-200 ${barColor}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
