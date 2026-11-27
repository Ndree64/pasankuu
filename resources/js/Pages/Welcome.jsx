import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { BookOpen, Target, ShieldCheck } from 'lucide-react';
import GuestLayout from '../Layouts/GuestLayout';
import TactileButton from '../Components/UI/TactileButton';
import WovenDivider from '../Components/UI/WovenDivider';

export default function Welcome() {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <GuestLayout>
            <Head title="Belajar Bahasa Pasan" />

            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full flex flex-col items-center text-center">
                <img
                    src="/images/pasanku_logo_cream.png"
                    alt="Logo dan maskot ayam jago merah Pasanku"
                    width={630}
                    height={593}
                    fetchPriority="high"
                    className="w-44 sm:w-52 h-auto mb-3"
                />

                <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">
                    Bahasa kita, warisan kita.
                </p>

                <h1 className="font-display text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-[1.2] text-ink max-w-2xl mt-3">
                    Belajar Bahasa Pasan Langkah demi Langkah
                </h1>

                <p className="text-[15px] sm:text-base text-ink-soft leading-relaxed max-w-xl mt-3">
                    Pelajaran singkat, latihan interaktif, evaluasi unit, dan rekomendasi remedial adaptif untuk pemula Bahasa Pasan di Ratahan.
                </p>

                <div className="my-5">
                    <WovenDivider />
                </div>

                {user ? (
                    <div className="w-full max-w-md">
                        <TactileButton
                            variant="brand"
                            href={`/${user.role}`}
                            className="min-h-[50px] w-full text-base"
                        >
                            Lanjutkan sebagai {user.full_name}
                        </TactileButton>
                    </div>
                ) : (
                    <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 justify-center">
                        <TactileButton
                            variant="brand"
                            href="/register"
                            className="min-h-[50px] flex-1 text-base"
                        >
                            MULAI BELAJAR
                        </TactileButton>
                        <TactileButton
                            variant="neutral"
                            href="/login"
                            className="min-h-[50px] flex-1 text-base"
                        >
                            SUDAH PUNYA AKUN
                        </TactileButton>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left mt-10">
                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-2">
                        <div className="w-10 h-10 rounded-[12px] bg-brand-tint border border-border-subtle flex items-center justify-center text-brand">
                            <BookOpen className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-ink">Microlearning Bertahap</h2>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            5 unit dengan 25 lesson singkat yang langsung dipraktikkan lewat latihan.
                        </p>
                    </div>

                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-2">
                        <div className="w-10 h-10 rounded-[12px] bg-accent-tint border border-border-subtle flex items-center justify-center text-accent-lip">
                            <Target className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-ink">Remedial Adaptif</h2>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            Analisis otomatis kesalahan quiz unit untuk merekomendasikan lesson prioritas.
                        </p>
                    </div>

                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-2">
                        <div className="w-10 h-10 rounded-[12px] bg-success-tint border border-border-subtle flex items-center justify-center text-success">
                            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-ink">Tervalidasi Penutur</h2>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            Kosakata dan kunci jawaban diperiksa Validator sebelum terbit ke Learner.
                        </p>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
