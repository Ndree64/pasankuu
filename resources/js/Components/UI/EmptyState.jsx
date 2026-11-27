import React from 'react';
import TactileButton from './TactileButton';

export default function EmptyState({
    title = 'Belum ada data',
    description = 'Data yang diminta belum tersedia saat ini.',
    actionLabel = null,
    actionHref = null,
    onAction = null,
}) {
    return (
        <div className="bg-surface border border-border-subtle rounded-[16px] p-8 text-center flex flex-col items-center gap-3">
            <img
                src="/images/pasanku_app_icon.png"
                alt="Ikon Pasanku"
                width={64}
                height={65}
                className="w-16 h-16 rounded-[12px] object-contain"
            />
            <div className="space-y-1 max-w-md">
                <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
                <p className="text-sm text-ink-soft leading-relaxed">{description}</p>
            </div>
            {actionLabel && (actionHref || onAction) && (
                <div className="pt-2">
                    <TactileButton variant="brand" href={actionHref} onClick={onAction}>
                        {actionLabel}
                    </TactileButton>
                </div>
            )}
        </div>
    );
}
