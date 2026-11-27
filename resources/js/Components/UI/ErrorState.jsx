import React from 'react';
import { AlertCircle } from 'lucide-react';
import TactileButton from './TactileButton';

export default function ErrorState({
    title = 'Terjadi kendala',
    message = 'Permintaan tidak dapat diproses saat ini. Silakan coba kembali.',
    backHref = '/',
    backLabel = 'Kembali',
}) {
    return (
        <div
            role="alert"
            className="bg-brand-tint border border-brand rounded-[16px] p-6 flex flex-col sm:flex-row sm:items-center gap-4"
        >
            <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-6 h-6 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                    <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
                    <p className="text-sm text-ink-soft">{message}</p>
                </div>
            </div>
            {backHref && (
                <TactileButton variant="neutral" href={backHref} className="shrink-0">
                    {backLabel}
                </TactileButton>
            )}
        </div>
    );
}
