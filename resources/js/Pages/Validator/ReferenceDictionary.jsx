import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import EmptyState from '../../Components/UI/EmptyState';

export default function ReferenceDictionary({ vocabularies, filters }) {
    const [q, setQ] = useState(filters.q || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/validator/kamus', { q, status: filters.status }, { preserveState: true, replace: true });
    };

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

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Cari kata Bahasa Pasan atau arti..."
                            className="w-full h-12 pl-10 pr-4 rounded-[12px] border border-border-control bg-surface text-sm"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            router.get('/validator/kamus', { q, status: e.target.value }, { preserveState: true, replace: true })
                        }
                        className="h-12 px-4 rounded-[12px] border border-border-control bg-surface text-sm font-semibold"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending_review">Menunggu Review</option>
                        <option value="approved">Disetujui</option>
                        <option value="changes_requested">Perlu Revisi</option>
                        <option value="draft">Draf</option>
                    </select>
                </form>

                {vocabularies.length === 0 ? (
                    <EmptyState
                        title="Belum ada kosakata referensi"
                        description="Kosakata akan muncul di sini setelah Admin menambahkannya pada materi lesson."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {vocabularies.map((v) => (
                            <div key={v.id} className="bg-surface border border-border-subtle rounded-[16px] p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-lg text-ink">{v.pasan_word}</p>
                                        <p className="text-sm font-semibold text-ink-soft">{v.indonesian_meaning}</p>
                                    </div>
                                    <StatusBadge status={v.validation_status} />
                                </div>
                                {v.source_note && <p className="text-xs text-ink-soft">{v.source_note}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
