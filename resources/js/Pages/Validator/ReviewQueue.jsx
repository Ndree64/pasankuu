import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';
import EmptyState from '../../Components/UI/EmptyState';

const TABS = [
    { key: 'pending', label: 'Menunggu Review' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'changes_requested', label: 'Perlu Revisi' },
    { key: 'all', label: 'Semua' },
];

export default function ReviewQueue({ counts, reviews, active_filter }) {
    return (
        <AppLayout>
            <Head title="Antrean Review Validator" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                            Antrean Validasi Konten
                        </h1>
                        <p className="text-sm text-ink-soft mt-1">
                            Periksa ketepatan Bahasa Pasan, soal, dan kunci jawaban sebelum disetujui.
                        </p>
                    </div>
                    <TactileButton variant="accent" href="/preview">
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>Buka Mode Pratinjau</span>
                    </TactileButton>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-accent-tint border border-accent-border rounded-[16px] p-4">
                        <p className="text-xs font-bold uppercase text-ink-soft">Menunggu Review</p>
                        <p className="font-display text-3xl font-bold text-ink mt-1">{counts.pending}</p>
                    </div>
                    <div className="bg-success-tint border border-success rounded-[16px] p-4">
                        <p className="text-xs font-bold uppercase text-ink-soft">Disetujui</p>
                        <p className="font-display text-3xl font-bold text-ink mt-1">{counts.approved}</p>
                    </div>
                    <div className="bg-brand-tint border border-brand rounded-[16px] p-4">
                        <p className="text-xs font-bold uppercase text-ink-soft">Perlu Revisi</p>
                        <p className="font-display text-3xl font-bold text-ink mt-1">{counts.changes_requested}</p>
                    </div>
                    <div className="bg-surface border border-border-subtle rounded-[16px] p-4">
                        <p className="text-xs font-bold uppercase text-ink-soft">Total Pengajuan</p>
                        <p className="font-display text-3xl font-bold text-ink mt-1">{counts.total}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => router.get('/validator', { status: tab.key })}
                            className={`min-h-11 px-4 rounded-[12px] text-sm font-bold border ${
                                active_filter === tab.key
                                    ? 'bg-brand text-white border-brand-lip'
                                    : 'bg-surface text-ink-soft border-border-control hover:bg-surface-soft'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {reviews.length === 0 ? (
                    <EmptyState
                        title="Tidak ada konten pada filter ini"
                        description="Belum ada pengajuan konten dari Admin untuk status yang dipilih."
                    />
                ) : (
                    <div className="bg-surface border border-border-subtle rounded-[16px] divide-y divide-border-subtle">
                        {reviews.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-bold uppercase text-ink-soft">
                                            {item.unit_title} | {item.type === 'lesson' ? 'Lesson' : 'Quiz Unit'} v{item.content_version}
                                        </span>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <p className="font-semibold text-ink">{item.title}</p>
                                    <p className="text-xs text-ink-soft">
                                        Diajukan oleh {item.submitted_by || 'Admin'} pada {item.submitted_at}
                                    </p>
                                </div>

                                <TactileButton
                                    variant="brand"
                                    href={`/validator/reviews/${item.type}/${item.target_id}`}
                                    className="min-h-11 px-4 text-xs shrink-0"
                                >
                                    Periksa Paket
                                </TactileButton>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
