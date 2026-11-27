import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import EmptyState from '../../Components/UI/EmptyState';

const STATUS_CHIPS = [
    { key: 'all', label: 'Semua Status' },
    { key: 'pending_review', label: 'Menunggu Review' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'changes_requested', label: 'Perlu Revisi' },
    { key: 'draft', label: 'Draf' },
];

export default function ReferenceDictionary({ vocabularies, filters }) {
    const [q, setQ] = useState(filters.q || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (q !== (filters.q || '')) {
                router.get('/validator/kamus', { q, status: filters.status }, { preserveState: true, replace: true });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [q]);

    return (
        <AppLayout>
            <Head title="Kamus Referensi Validator" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                        Kamus Referensi Validator
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Menampilkan seluruh entri kosakata termasuk yang masih berstatus Draf dan Menunggu Review.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="w-5 h-5 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <label htmlFor="val_dict_search" className="sr-only">
                            Cari kata Bahasa Pasan atau arti Indonesia
                        </label>
                        <input
                            id="val_dict_search"
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari kata Bahasa Pasan atau arti..."
                            className="w-full h-12 pl-11 pr-4 rounded-[12px] border border-border-control bg-surface text-[15px]"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {STATUS_CHIPS.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() =>
                                    router.get(
                                        '/validator/kamus',
                                        { q, status: chip.key },
                                        { preserveState: true, replace: true }
                                    )
                                }
                                className={`min-h-11 px-4 rounded-[10px] text-sm font-bold border ${
                                    filters.status === chip.key
                                        ? 'bg-brand text-white border-brand-lip'
                                        : 'bg-surface text-ink-soft border-border-control hover:bg-surface-soft'
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>

                {vocabularies.length === 0 ? (
                    <EmptyState
                        title="Belum ada kosakata referensi"
                        description="Kosakata akan muncul di sini setelah Admin menambahkannya pada materi lesson."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {vocabularies.map((v) => (
                            <article key={v.id} className="bg-surface border border-border-subtle rounded-[16px] p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h2 className="font-bold text-lg text-ink">{v.pasan_word}</h2>
                                        <p className="text-sm font-semibold text-ink-soft">{v.indonesian_meaning}</p>
                                    </div>
                                    <StatusBadge status={v.validation_status} />
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-ink-soft">
                                    {v.unit_title && <span>{v.unit_title}</span>}
                                    {v.category && <span>Kategori: {v.category}</span>}
                                </div>
                                {v.source_note && <p className="text-xs text-ink-soft">{v.source_note}</p>}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
