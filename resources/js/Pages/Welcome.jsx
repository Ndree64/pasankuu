import React from 'react';
import { Head } from '@inertiajs/react';
import { BookOpen, ShieldCheck, Repeat } from 'lucide-react';
import GuestLayout from '../Layouts/GuestLayout';
import TactileButton from '../Components/UI/TactileButton';
import WovenDivider from '../Components/UI/WovenDivider';

export default function Welcome() {
    return (
        <GuestLayout>
            <Head title="Belajar Bahasa Pasan" />

            <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-5 text-center md:text-left">
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand">
                            Bahasa Pasan, Minahasa Tenggara
                        </p>
                        <h1 className="font-display text-[28px] sm:text-[32px] lg:text-[36px] font-bold leading-[1.2] text-ink">
                            Belajar Bahasa Pasan dari dasar dengan latihan bertahap.
                        </h1>
                        <p className="text-[15px] sm:text-base text-ink-soft leading-relaxed max-w-xl mx-auto md:mx-0">
                            Bahasa kita, warisan kita. Ikuti materi singkat, latihan interaktif, evaluasi per unit, serta rekomendasi remedial yang terarah.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
                            <TactileButton
                                variant="brand"
                                href="/register"
                                className="min-h-[50px] px-7 text-base w-full sm:w-auto"
                            >
                                MULAI BELAJAR
                            </TactileButton>
                            <TactileButton
                                variant="neutral"
                                href="/login"
                                className="min-h-[50px] px-7 text-base w-full sm:w-auto"
                            >
                                SUDAH PUNYA AKUN
                            </TactileButton>
                        </div>
                    </div>

                    <div className="md:col-span-5 flex justify-center">
                        <img
                            src="/images/pasanku_logo_cream.png"
                            alt="Maskot ayam jago merah Pasanku berselendang tenun"
                            width={630}
                            height={593}
                            fetchPriority="high"
                            className="w-64 sm:w-72 md:w-80 h-auto rounded-[20px]"
                        />
                    </div>
                </div>

                <div className="my-10">
                    <WovenDivider />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-2">
                        <div className="w-10 h-10 rounded-[12px] bg-surface-highlight border border-border-subtle flex items-center justify-center text-brand">
                            <BookOpen className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-ink">Microlearning Bertahap</h2>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            Materi disusun ringkas per unit dengan urutan aktivitas yang jelas agar mudah diikuti pemula.
                        </p>
                    </div>

                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-2">
                        <div className="w-10 h-10 rounded-[12px] bg-accent-tint border border-accent-border flex items-center justify-center text-ink">
                            <Repeat className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-ink">Evaluasi & Remedial</h2>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            Jika nilai Quiz Unit belum mencapai 75, sistem merekomendasikan hingga 3 lesson untuk diulang.
                        </p>
                    </div>

                    <div className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-2">
                        <div className="w-10 h-10 rounded-[12px] bg-success-tint border border-success flex items-center justify-center text-success">
                            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-ink">Tervalidasi Penutur</h2>
                        <p className="text-sm text-ink-soft leading-relaxed">
                            Setiap materi, kosakata, dan soal diperiksa oleh Validator sebelum diterbitkan ke Learner.
                        </p>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
