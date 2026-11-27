import React from 'react';
import { Link } from '@inertiajs/react';
import { X, Eye } from 'lucide-react';
import ProgressBar from '../Components/UI/ProgressBar';

export default function FocusLayout({
    children,
    closeHref = '/learner',
    progressValue = 0,
    progressMax = 100,
    progressTone = 'success',
    progressLabel = '',
    isPreview = false,
}) {
    return (
        <div className="min-h-screen bg-canvas text-ink flex flex-col">
            {isPreview && (
                <div
                    role="region"
                    aria-label="Mode Pratinjau"
                    className="sticky top-0 z-30 bg-accent-tint border-b-2 border-accent-border px-4 py-2"
                >
                    <div className="max-w-[960px] mx-auto flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-ink">
                            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
                            Mode Pratinjau: progres tidak disimpan
                        </span>
                        <Link
                            href="/preview"
                            className="inline-flex items-center min-h-11 px-3 rounded-[12px] bg-surface border border-accent-border text-xs font-bold text-ink"
                        >
                            Kembali ke Pratinjau
                        </Link>
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-20 bg-surface border-b border-border-subtle shadow-focal">
                <div className="max-w-[960px] mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
                    <Link
                        href={closeHref}
                        aria-label="Tutup sesi belajar"
                        className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-border-control bg-surface text-ink hover:bg-surface-soft shrink-0"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </Link>

                    <div className="flex-1 min-w-0">
                        <ProgressBar
                            value={progressValue}
                            max={progressMax}
                            tone={progressTone}
                            label={progressLabel || 'Progres sesi'}
                        />
                    </div>

                    {progressLabel && (
                        <span className="text-xs sm:text-sm font-bold text-ink-soft whitespace-nowrap shrink-0">
                            {progressLabel}
                        </span>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full max-w-[960px] mx-auto px-4 py-6 sm:py-8">
                {children}
            </main>
        </div>
    );
}
