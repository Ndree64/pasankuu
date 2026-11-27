import React from 'react';
import { Head } from '@inertiajs/react';
import { Trophy, Sparkles } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import EmptyState from '../../Components/UI/EmptyState';

export default function Leaderboard({ podium, rankings }) {
    return (
        <AppLayout>
            <Head title="Papan Skor" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                        Papan Skor Learner
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Peringkat disusun berdasarkan akumulasi Total XP dari penyelesaian lesson, remedial, dan quiz.
                    </p>
                </div>

                {rankings.length === 0 ? (
                    <EmptyState
                        title="Belum ada peserta di papan skor"
                        description="Selesaikan lesson pertamamu untuk meraih XP dan tampil di peringkat."
                    />
                ) : (
                    <>
                        {/* Podium Top 3 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {podium.map((entry) => (
                                <div
                                    key={entry.user_id}
                                    className={`rounded-[16px] border p-4 text-center space-y-2 ${
                                        entry.rank === 1
                                            ? 'bg-accent-tint border-2 border-accent-border'
                                            : 'bg-surface border-border-subtle'
                                    }`}
                                >
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-accent text-ink text-xs font-bold">
                                        <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Peringkat #{entry.rank}</span>
                                    </div>
                                    <p className="font-display font-bold text-lg text-ink truncate">
                                        {entry.full_name}
                                    </p>
                                    <p className="text-xs text-ink-soft">
                                        Level {entry.level}: {entry.level_title}
                                    </p>
                                    <p className="font-bold text-base text-ink inline-flex items-center gap-1">
                                        <Sparkles className="w-4 h-4 text-accent-lip" aria-hidden="true" />
                                        {entry.total_xp} XP
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Daftar Lengkap */}
                        <div className="bg-surface border border-border-subtle rounded-[16px] divide-y divide-border-subtle">
                            {rankings.map((entry) => (
                                <div
                                    key={entry.user_id}
                                    className={`px-4 py-3.5 flex items-center justify-between gap-3 ${
                                        entry.is_current_user ? 'bg-surface-highlight font-bold' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-8 h-8 rounded-[8px] bg-surface-soft border border-border-subtle flex items-center justify-center text-sm font-bold text-ink shrink-0">
                                            {entry.rank}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-ink truncate">
                                                {entry.full_name} {entry.is_current_user ? '(Kamu)' : ''}
                                            </p>
                                            <p className="text-xs text-ink-soft">
                                                Level {entry.level}: {entry.level_title}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-accent text-ink text-xs font-bold shrink-0">
                                        {entry.total_xp} XP
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
