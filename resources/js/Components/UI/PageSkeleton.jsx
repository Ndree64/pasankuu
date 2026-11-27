import React from 'react';

export default function PageSkeleton({ rows = 3, label = 'Memuat data...' }) {
    return (
        <div className="space-y-4" aria-busy="true" aria-label={label}>
            <div className="h-8 w-52 rounded-[12px] bg-surface-soft animate-pulse" />
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, index) => (
                    <div
                        key={index}
                        className="p-5 rounded-[16px] bg-surface-soft border border-border-subtle space-y-2.5 animate-pulse"
                    >
                        <div className="h-4 w-2/5 rounded bg-border-subtle" />
                        <div className="h-3.5 w-4/5 rounded bg-border-subtle" />
                    </div>
                ))}
            </div>
        </div>
    );
}
