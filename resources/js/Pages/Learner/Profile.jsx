import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Award, LogOut, Sparkles, Lock } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import ProgressBar from '../../Components/UI/ProgressBar';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';

export default function Profile({ profile, level_info, badges, quiz_history, xp_history }) {
    return (
        <AppLayout>
            <Head title="Profil Belajar" />

            <div className="space-y-6">
                <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-ink">{profile.full_name}</h1>
                        <p className="text-sm text-ink-soft">{profile.email}</p>
                    </div>
                    <TactileButton variant="neutral" onClick={() => router.post('/logout')}>
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        <span>Keluar</span>
                    </TactileButton>
                </div>

                {/* Level & XP */}
                <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                                Level {level_info.level}
                            </p>
                            <h2 className="font-display text-xl font-bold text-ink">{level_info.title}</h2>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-accent text-ink text-sm font-bold">
                            <Sparkles className="w-4 h-4" aria-hidden="true" />
                            {level_info.total_xp} XP
                        </span>
                    </div>
                    <ProgressBar value={level_info.progress_percent} max={100} tone="accent" label="Progres XP level" />
                    <p className="text-xs text-ink-soft">
                        {level_info.next_level_xp
                            ? `${level_info.total_xp} / ${level_info.next_level_xp} XP menuju level berikutnya`
                            : 'Selamat, kamu berada di level tertinggi!'}
                    </p>
                </div>

                {/* Lencana (Badges) */}
                <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-ink">Lencana Pencapaian</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={`rounded-[16px] border p-4 space-y-1.5 ${
                                    badge.earned
                                        ? 'bg-accent-tint border-accent-border'
                                        : 'bg-surface-soft border-border-subtle opacity-75'
                                }`}
                            >
                                <div className="flex items-center gap-2 font-bold text-ink">
                                    {badge.earned ? (
                                        <Award className="w-5 h-5 text-accent-lip shrink-0" aria-hidden="true" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-ink-soft shrink-0" aria-hidden="true" />
                                    )}
                                    <span>{badge.name}</span>
                                </div>
                                <p className="text-xs text-ink-soft">{badge.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Riwayat Quiz & XP */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <section className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                        <h2 className="font-display text-lg font-bold text-ink">Riwayat Quiz Unit</h2>
                        {quiz_history.length === 0 ? (
                            <p className="text-sm text-ink-soft">Belum ada percobaan Quiz Unit.</p>
                        ) : (
                            <div className="divide-y divide-border-subtle">
                                {quiz_history.map((item) => (
                                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-ink">{item.quiz_title}</p>
                                            <p className="text-xs text-ink-soft">
                                                Percobaan #{item.attempt_number} | Nilai: {item.score}
                                            </p>
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                        <h2 className="font-display text-lg font-bold text-ink">Riwayat XP</h2>
                        {xp_history.length === 0 ? (
                            <p className="text-sm text-ink-soft">Belum ada transaksi XP.</p>
                        ) : (
                            <div className="divide-y divide-border-subtle">
                                {xp_history.map((tx) => (
                                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-ink capitalize">{tx.activity_type}</p>
                                            <p className="text-xs text-ink-soft">{tx.created_at}</p>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-[8px] bg-accent text-ink text-xs font-bold">
                                            +{tx.xp_amount} XP
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
