import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import EmptyState from '../../Components/UI/EmptyState';

export default function ReviewHistory({ history }) {
    return (
        <AppLayout>
            <Head title="Riwayat Validasi" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                        Riwayat Keputusan Validasi
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Catatan keputusan persetujuan dan permintaan revisi yang sudah diproses.
                    </p>
                </div>

                {history.length === 0 ? (
                    <EmptyState
                        title="Belum ada riwayat validasi"
                        description="Keputusan pemeriksaan lesson maupun quiz akan tercatat otomatis di halaman ini."
                    />
                ) : (
                    <div className="space-y-3">
                        {history.map((item) => (
                            <div key={item.id} className="bg-surface border border-border-subtle rounded-[16px] p-4 sm:p-5 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-display font-bold text-base text-ink">{item.title}</span>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <span className="text-xs text-ink-soft">{item.reviewed_at}</span>
                                </div>
                                <p className="text-xs text-ink-soft">
                                    {item.unit_title} | {item.type === 'lesson' ? 'Lesson' : 'Quiz Unit'} v{item.content_version} | Oleh {item.reviewer_name || 'Validator'}
                                </p>
                                {item.review_note && (
                                    <p className="text-sm text-ink bg-surface-soft border border-border-subtle p-3 rounded-[10px]">
                                        {item.review_note}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
