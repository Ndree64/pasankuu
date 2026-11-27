import React from 'react';
import { CheckCircle2, Clock, Pencil, Lock, AlertTriangle, Globe } from 'lucide-react';

const STATUS_MAP = {
    draft: {
        label: 'Draf',
        classes: 'bg-surface-soft text-ink-soft border-border-control',
        Icon: Pencil,
    },
    pending_review: {
        label: 'Menunggu Review',
        classes: 'bg-accent-tint text-ink border-accent-border',
        Icon: Clock,
    },
    pending: {
        label: 'Menunggu Review',
        classes: 'bg-accent-tint text-ink border-accent-border',
        Icon: Clock,
    },
    changes_requested: {
        label: 'Perlu Revisi',
        classes: 'bg-brand-tint text-brand border-brand',
        Icon: AlertTriangle,
    },
    approved: {
        label: 'Disetujui',
        classes: 'bg-success-tint text-success border-success',
        Icon: CheckCircle2,
    },
    published: {
        label: 'Terbit',
        classes: 'bg-success text-white border-success-lip',
        Icon: Globe,
    },
    passed: {
        label: 'Lulus',
        classes: 'bg-success-tint text-success border-success',
        Icon: CheckCircle2,
    },
    failed: {
        label: 'Belum Lulus',
        classes: 'bg-brand-tint text-brand border-brand',
        Icon: AlertTriangle,
    },
    locked: {
        label: 'Terkunci',
        classes: 'bg-locked text-ink-soft border-border-control',
        Icon: Lock,
    },
};

export default function StatusBadge({ status, labelOverride = null, className = '' }) {
    const config = STATUS_MAP[status] ?? {
        label: status,
        classes: 'bg-surface-soft text-ink-soft border-border-control',
        Icon: Clock,
    };
    const Icon = config.Icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-xs font-semibold leading-none whitespace-nowrap ${config.classes} ${className}`}
        >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{labelOverride ?? config.label}</span>
        </span>
    );
}
