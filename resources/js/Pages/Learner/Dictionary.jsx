import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, CheckCircle2 } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import EmptyState from '../../Components/UI/EmptyState';

const UNIT_CHIPS = [
    { key: 'all', label: 'Semua' },
    { key: '1', label: 'Unit 1' },
    { key: '2', label: 'Unit 2' },
    { key: '3', label: 'Unit 3' },
    { key: '4-5', label: 'Unit 4-5' },
];

export default function Dictionary({ vocabularies, filters }) {
    const [q, setQ] = useState(filters.q || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (q !== (filters.q || '')) {
                router.get(
                    '/learner/kamus',
                    { q, unit: filters.unit },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [q]);

    return (
        <AppLayout>
            <Head title="Kamus Bahasa Pasan" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                        Kamus Bahasa Pasan
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Cari kosakata Bahasa Pasan yang sudah divalidasi oleh penutur.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="w-5 h-5 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <label htmlFor="dict_search" className="sr-only">
                            Cari kosakata Bahasa Pasan atau arti Indonesia
                        </label>
                        <input
                            id="dict_search"
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari kata Bahasa Pasan atau arti Indonesia..."
                            className="w-full h-12 pl-11 pr-4 rounded-[12px] border border-border-control bg-surface text-[15px]"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {UNIT_CHIPS.map((chip) => (
                            <button
                                key={chip.key}
                                type="button"
                                onClick={() =>
                                    router.get(
                                        '/learner/kamus',
                                        { q, unit: chip.key },
                                        { preserveState: true, replace: true }
                                    )
                                }
                                className={`min-h-11 px-4 rounded-[10px] text-sm font-bold border ${
                                    filters.unit === chip.key
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
                        title="Belum ada kosakata ditemukan"
                        description="Kosakata akan muncul di sini setelah materi Bahasa Pasan selesai disusun dan disetujui Validator."
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
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-success-tint border border-success text-success text-xs font-semibold shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Tervalidasi</span>
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-ink-soft">
                                    {v.unit_order && <span>Unit {v.unit_order}</span>}
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
