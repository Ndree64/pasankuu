import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Layers,
    FileQuestion,
    Users,
    Eye,
    ArrowRight,
    Pencil,
    Clock,
    AlertTriangle,
    Globe,
    CheckCircle2,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/UI/StatusBadge';
import TactileButton from '../../Components/UI/TactileButton';
import EmptyState from '../../Components/UI/EmptyState';

export default function Dashboard({ pipeline_counts, priority_actions, learner_summary }) {
    const pipelineItems = [
        { key: 'draft', label: 'Draf', count: pipeline_counts.draft, tone: 'bg-surface border-border-subtle', Icon: Pencil },
        { key: 'pending_review', label: 'Menunggu Review', count: pipeline_counts.pending_review, tone: 'bg-accent-tint border-accent-border', Icon: Clock },
        { key: 'changes_requested', label: 'Perlu Revisi', count: pipeline_counts.changes_requested, tone: 'bg-brand-tint border-brand', Icon: AlertTriangle },
        { key: 'published', label: 'Terbit', count: pipeline_counts.published, tone: 'bg-success-tint border-success', Icon: Globe },
    ];

    return (
        <AppLayout>
            <Head title="Dasbor Admin" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                            Ringkasan Kurikulum Pasanku
                        </h1>
                        <p className="text-sm text-ink-soft mt-1">
                            Pantau status validasi konten, kelola unit, dan aktifkan akun Validator.
                        </p>
                    </div>
                    <TactileButton variant="accent" href="/preview">
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span>Buka Mode Pratinjau</span>
                    </TactileButton>
                </div>

                {/* Pipeline 4 kolom */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {pipelineItems.map((item) => {
                        const Icon = item.Icon;
                        return (
                            <div key={item.key} className={`rounded-[16px] border p-4 space-y-1 ${item.tone}`}>
                                <div className="flex items-center justify-between text-ink-soft">
                                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                </div>
                                <p className="font-display text-3xl font-bold text-ink">{item.count}</p>
                            </div>
                        );
                    })}
                </div>

                {pipeline_counts.approved > 0 && (
                    <div className="bg-success-tint border-2 border-success rounded-[16px] p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                            <CheckCircle2 className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
                            <span>
                                Ada {pipeline_counts.approved} paket konten berstatus Disetujui Validator yang siap diterbitkan.
                            </span>
                        </div>
                        <TactileButton variant="success" href="/admin/units">
                            Kelola Penerbitan
                        </TactileButton>
                    </div>
                )}

                {/* Aksi Cepat + Ringkasan Learner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                        <h2 className="font-display text-lg font-bold text-ink">Aksi Cepat</h2>
                        <div className="space-y-2">
                            <Link
                                href="/admin/units"
                                className="flex items-center justify-between min-h-12 px-4 rounded-[12px] bg-surface-soft hover:bg-surface-highlight border border-border-subtle text-sm font-semibold text-ink"
                            >
                                <span className="inline-flex items-center gap-2.5">
                                    <Layers className="w-4 h-4 text-brand" aria-hidden="true" />
                                    Kelola 5 Unit & 25 Lesson
                                </span>
                                <ArrowRight className="w-4 h-4 text-ink-soft" aria-hidden="true" />
                            </Link>
                            <Link
                                href="/admin/quizzes"
                                className="flex items-center justify-between min-h-12 px-4 rounded-[12px] bg-surface-soft hover:bg-surface-highlight border border-border-subtle text-sm font-semibold text-ink"
                            >
                                <span className="inline-flex items-center gap-2.5">
                                    <FileQuestion className="w-4 h-4 text-brand" aria-hidden="true" />
                                    Kelola Quiz Unit (15 sampai 20 Soal)
                                </span>
                                <ArrowRight className="w-4 h-4 text-ink-soft" aria-hidden="true" />
                            </Link>
                            <Link
                                href="/admin/validators"
                                className="flex items-center justify-between min-h-12 px-4 rounded-[12px] bg-surface-soft hover:bg-surface-highlight border border-border-subtle text-sm font-semibold text-ink"
                            >
                                <span className="inline-flex items-center gap-2.5">
                                    <Users className="w-4 h-4 text-brand" aria-hidden="true" />
                                    Kelola Akun Validator
                                </span>
                                <ArrowRight className="w-4 h-4 text-ink-soft" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-3">
                        <h2 className="font-display text-lg font-bold text-ink">Ringkasan Aktivitas</h2>
                        <dl className="grid grid-cols-3 gap-3 pt-1">
                            <div className="p-3 rounded-[12px] bg-surface-soft border border-border-subtle">
                                <dt className="text-xs text-ink-soft">Learner</dt>
                                <dd className="font-display text-2xl font-bold text-ink mt-1">
                                    {learner_summary.total_learners}
                                </dd>
                            </div>
                            <div className="p-3 rounded-[12px] bg-surface-soft border border-border-subtle">
                                <dt className="text-xs text-ink-soft">Lesson Lulus</dt>
                                <dd className="font-display text-2xl font-bold text-ink mt-1">
                                    {learner_summary.completed_lessons}
                                </dd>
                            </div>
                            <div className="p-3 rounded-[12px] bg-surface-soft border border-border-subtle">
                                <dt className="text-xs text-ink-soft">Validator Aktif</dt>
                                <dd className="font-display text-2xl font-bold text-ink mt-1">
                                    {learner_summary.active_validators}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Daftar Tindakan Prioritas */}
                <div className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-ink">Tindakan Prioritas</h2>
                    {priority_actions.length === 0 ? (
                        <EmptyState
                            title="Belum ada tindakan mendesak"
                            description="Mulai isi materi pada lesson berstatus Draf, lalu ajukan ke Validator untuk pemeriksaan."
                            actionLabel="Buka Daftar Unit"
                            actionHref="/admin/units"
                        />
                    ) : (
                        <div className="bg-surface border border-border-subtle rounded-[16px] divide-y divide-border-subtle">
                            {priority_actions.map((action) => (
                                <div key={action.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-ink-soft">
                                            {action.unit_title} ({action.type === 'lesson' ? 'Lesson' : 'Quiz Unit'})
                                        </p>
                                        <p className="font-semibold text-ink">{action.title}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={action.status} />
                                        <TactileButton variant="neutral" href={action.href} className="min-h-11 px-4 text-xs">
                                            Buka
                                        </TactileButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
