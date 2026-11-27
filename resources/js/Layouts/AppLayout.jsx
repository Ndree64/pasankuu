import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    BookMarked,
    Trophy,
    User,
    ClipboardCheck,
    History,
    Eye,
    LayoutDashboard,
    Layers,
    FileQuestion,
    Users,
    LogOut,
    CheckCircle2,
    AlertCircle,
    Sparkles,
} from 'lucide-react';

function getNavConfig(role) {
    if (role === 'admin') {
        return {
            sectionLabel: 'PANEL ADMIN',
            mobileTabs: [
                { label: 'Ringkasan', href: '/admin', match: '/admin', exact: true, Icon: LayoutDashboard },
                { label: 'Kurikulum', href: '/admin/units', match: '/admin/units', Icon: Layers },
                { label: 'Quiz Unit', href: '/admin/quizzes', match: '/admin/quizzes', Icon: FileQuestion },
                { label: 'Validator', href: '/admin/validators', match: '/admin/validators', Icon: Users },
            ],
            sidebarItems: [
                { label: 'Ringkasan', href: '/admin', match: '/admin', exact: true, Icon: LayoutDashboard },
                { label: 'Kurikulum', href: '/admin/units', match: '/admin/units', Icon: Layers },
                { label: 'Quiz Unit', href: '/admin/quizzes', match: '/admin/quizzes', Icon: FileQuestion },
                { label: 'Validator', href: '/admin/validators', match: '/admin/validators', Icon: Users },
                { label: 'Mode Pratinjau', href: '/preview', match: '/preview', Icon: Eye },
            ],
        };
    }

    if (role === 'validator') {
        return {
            sectionLabel: 'PANEL VALIDATOR',
            mobileTabs: [
                { label: 'Antrean', href: '/validator', match: '/validator', exact: true, Icon: ClipboardCheck },
                { label: 'Riwayat', href: '/validator/riwayat', match: '/validator/riwayat', Icon: History },
                { label: 'Kamus', href: '/validator/kamus', match: '/validator/kamus', Icon: BookMarked },
                { label: 'Pratinjau', href: '/preview', match: '/preview', Icon: Eye },
            ],
            sidebarItems: [
                { label: 'Antrean Review', href: '/validator', match: '/validator', exact: true, Icon: ClipboardCheck },
                { label: 'Riwayat Validasi', href: '/validator/riwayat', match: '/validator/riwayat', Icon: History },
                { label: 'Kamus Referensi', href: '/validator/kamus', match: '/validator/kamus', Icon: BookMarked },
                { label: 'Mode Pratinjau', href: '/preview', match: '/preview', Icon: Eye },
            ],
        };
    }

    return {
        sectionLabel: 'BELAJAR PASAN',
        mobileTabs: [
            { label: 'Belajar', href: '/learner', match: '/learner', exact: true, Icon: BookOpen },
            { label: 'Kamus', href: '/learner/kamus', match: '/learner/kamus', Icon: BookMarked },
            { label: 'Papan Skor', href: '/learner/papan-skor', match: '/learner/papan-skor', Icon: Trophy },
            { label: 'Profil', href: '/learner/profil', match: '/learner/profil', Icon: User },
        ],
        sidebarItems: [
            { label: 'Belajar', href: '/learner', match: '/learner', exact: true, Icon: BookOpen },
            { label: 'Kamus', href: '/learner/kamus', match: '/learner/kamus', Icon: BookMarked },
            { label: 'Papan Skor', href: '/learner/papan-skor', match: '/learner/papan-skor', Icon: Trophy },
            { label: 'Profil', href: '/learner/profil', match: '/learner/profil', Icon: User },
        ],
    };
}

function isRouteActive(url, item) {
    const cleanUrl = url.split('?')[0];
    if (item.exact) {
        return cleanUrl === item.match;
    }
    return cleanUrl === item.match || cleanUrl.startsWith(item.match + '/');
}

export default function AppLayout({
    children,
    rightRail = null,
    isPreview = false,
    previewControls = null,
}) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const flash = props.flash || {};
    const role = user?.role || 'learner';
    const nav = getNavConfig(role);
    const exitPreviewHref = role === 'admin' ? '/admin' : '/validator';

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row">
            {/* Tablet & Desktop Left Sidebar */}
            <aside
                aria-label="Navigasi utama"
                className="hidden md:flex md:flex-col md:w-56 lg:w-[248px] shrink-0 bg-surface border-r border-border-subtle sticky top-0 h-screen"
            >
                <div className="h-16 px-5 flex items-center gap-2.5 border-b border-border-subtle">
                    <Link href={role === 'learner' ? '/learner' : `/${role}`} className="flex items-center gap-2.5 min-h-11">
                        <img
                            src="/images/pasanku_app_icon.png"
                            alt="Ikon Pasanku"
                            width={34}
                            height={35}
                            className="w-8 h-8 rounded-[8px] object-contain"
                        />
                        <span className="font-display font-bold text-xl text-ink">PASANKU</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
                        {nav.sectionLabel}
                    </p>
                    {nav.sidebarItems.map((item) => {
                        const active = isRouteActive(url, item);
                        const Icon = item.Icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex items-center gap-3 min-h-12 px-3 rounded-[12px] text-[15px] transition-colors ${
                                    active
                                        ? 'bg-surface-highlight text-brand font-bold border border-border-subtle'
                                        : 'text-ink-soft font-medium hover:bg-surface-soft hover:text-ink'
                                }`}
                            >
                                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-3 border-t border-border-subtle space-y-2">
                    <div className="px-3 py-2 rounded-[12px] bg-surface-soft border border-border-subtle">
                        <p className="text-sm font-semibold text-ink truncate">{user?.full_name}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-xs uppercase font-semibold text-ink-soft">{role}</span>
                            {role === 'learner' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] bg-accent text-ink text-xs font-bold">
                                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                                    {user?.total_xp ?? 0} XP
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 min-h-11 px-3 rounded-[12px] text-sm font-semibold text-ink-soft hover:bg-brand-tint hover:text-brand"
                    >
                        <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Right Area (Mobile Top Bar + Preview Banner + Main Content + Bottom Nav) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Bar (< 768px) */}
                <header className="md:hidden sticky top-0 z-20 h-14 px-4 bg-surface border-b border-border-subtle shadow-focal flex items-center justify-between gap-2">
                    <Link href={role === 'learner' ? '/learner' : `/${role}`} className="flex items-center gap-2 min-h-11">
                        <img
                            src="/images/pasanku_app_icon.png"
                            alt="Ikon Pasanku"
                            width={30}
                            height={31}
                            className="w-7 h-7 rounded-[8px] object-contain"
                        />
                        <span className="font-display font-bold text-lg text-ink">PASANKU</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {role === 'learner' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-accent text-ink text-xs font-bold">
                                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                                {user?.total_xp ?? 0} XP
                            </span>
                        )}
                        {role === 'admin' && (
                            <Link
                                href="/preview"
                                className="inline-flex items-center gap-1 min-h-11 px-2.5 rounded-[12px] text-xs font-semibold text-ink hover:bg-surface-soft"
                            >
                                <Eye className="w-4 h-4" aria-hidden="true" />
                                <span>Pratinjau</span>
                            </Link>
                        )}
                        {(role === 'admin' || role === 'validator') && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1 min-h-11 px-2.5 rounded-[12px] text-xs font-semibold text-brand hover:bg-brand-tint"
                            >
                                <LogOut className="w-4 h-4" aria-hidden="true" />
                                <span>Keluar</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Preview Sticky Banner */}
                {isPreview && (
                    <div
                        role="region"
                        aria-label="Mode Pratinjau"
                        className="sticky top-14 md:top-0 z-20 bg-accent-tint border-b-2 border-accent-border px-4 sm:px-6 py-2.5"
                    >
                        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-ink">
                                <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>Mode Pratinjau: progres tidak disimpan</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {previewControls}
                                <Link
                                    href={exitPreviewHref}
                                    className="inline-flex items-center justify-center min-h-11 px-3.5 rounded-[12px] bg-surface border border-accent-border text-xs font-bold text-ink hover:bg-surface-soft"
                                >
                                    Keluar Pratinjau
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Container */}
                <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-7 py-5 md:py-7 pb-24 md:pb-8">
                    {(flash.success || flash.error) && (
                        <div className="mb-5 space-y-2 max-w-[896px]">
                            {flash.success && (
                                <div
                                    role="status"
                                    className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-success-tint border border-success text-success text-sm font-semibold"
                                >
                                    <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                                    <span>{flash.success}</span>
                                </div>
                            )}
                            {flash.error && (
                                <div
                                    role="alert"
                                    className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-brand-tint border border-brand text-brand text-sm font-semibold"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                                    <span>{flash.error}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col xl:flex-row gap-6 items-start">
                        <div className="w-full max-w-[896px] min-w-0 flex-1">{children}</div>
                        {rightRail && (
                            <aside className="w-full xl:w-[360px] shrink-0 space-y-4">
                                {rightRail}
                            </aside>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation (4 tabs, height 68px) */}
            <nav
                aria-label="Navigasi bawah"
                className="md:hidden fixed bottom-0 inset-x-0 z-30 h-[68px] bg-surface border-t border-border-subtle shadow-focal grid grid-cols-4"
            >
                {nav.mobileTabs.map((item) => {
                    const active = isRouteActive(url, item);
                    const Icon = item.Icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={`flex flex-col items-center justify-center gap-1 min-h-11 px-1 text-[11px] leading-tight ${
                                active ? 'text-brand font-bold bg-surface-highlight' : 'text-ink-soft font-medium'
                            }`}
                        >
                            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-full">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
