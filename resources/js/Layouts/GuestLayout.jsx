import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children, showAuthLinks = true }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-canvas text-ink flex flex-col">
            <header className="border-b border-border-subtle bg-surface/90 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2.5 min-h-11 px-1 rounded-[12px]"
                    >
                        <img
                            src="/images/pasanku_app_icon.png"
                            alt="Logo Pasanku"
                            width={36}
                            height={37}
                            className="w-9 h-9 rounded-[8px] object-contain"
                        />
                        <span className="font-display font-bold text-xl tracking-tight text-ink">
                            PASANKU
                        </span>
                    </Link>

                    {showAuthLinks && (
                        <nav aria-label="Navigasi tamu" className="flex items-center gap-2">
                            {auth?.user ? (
                                <Link
                                    href={`/${auth.user.role}`}
                                    className="tactile-brand inline-flex items-center justify-center min-h-11 px-4 rounded-[12px] text-sm font-semibold"
                                >
                                    Buka Dasbor
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center min-h-11 px-4 rounded-[12px] text-sm font-semibold text-ink hover:bg-surface-soft"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="tactile-brand inline-flex items-center justify-center min-h-11 px-4 rounded-[12px] text-sm font-semibold"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </nav>
                    )}
                </div>
            </header>

            <main className="flex-1 flex flex-col">{children}</main>
        </div>
    );
}
