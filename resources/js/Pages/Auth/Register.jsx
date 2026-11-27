import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import GuestLayout from '../../Layouts/GuestLayout';
import TactileButton from '../../Components/UI/TactileButton';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout showAuthLinks={false}>
            <Head title="Daftar Akun Learner" />

            <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 flex flex-col items-center text-center space-y-3">
                        <img
                            src="/images/pasanku_logo_cream.png"
                            alt="Maskot Pasanku"
                            width={630}
                            height={593}
                            fetchPriority="high"
                            className="w-44 sm:w-56 md:w-64 h-auto"
                        />
                        <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                            Mari Belajar Pasan!
                        </h1>
                        <p className="text-sm text-ink-soft max-w-xs">
                            Buat akun Learner gratis untuk langsung membuka Unit 1 dan menyimpan progres XP belajarmu.
                        </p>
                    </div>

                    <div className="md:col-span-7">
                        <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-6 sm:p-8">
                            <h2 className="font-display text-xl font-bold text-ink mb-1">
                                Daftar Akun Baru
                            </h2>
                            <p className="text-sm text-ink-soft mb-6">
                                Pendaftaran publik membuat akun Learner secara otomatis.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-semibold text-ink mb-1.5">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="full_name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Masukkan nama lengkap"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        className="w-full h-12 px-3.5 rounded-[12px] border border-border-control bg-surface text-ink text-[15px]"
                                        required
                                    />
                                    {errors.full_name && (
                                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand">
                                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                            <span>{errors.full_name}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-ink mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="nama@email.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full h-12 px-3.5 rounded-[12px] border border-border-control bg-surface text-ink text-[15px]"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand">
                                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                            <span>{errors.email}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
                                        Kata Sandi (minimal 8 karakter)
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Minimal 8 karakter"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full h-12 px-3.5 rounded-[12px] border border-border-control bg-surface text-ink text-[15px]"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand">
                                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                            <span>{errors.password}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password_confirmation"
                                        className="block text-sm font-semibold text-ink mb-1.5"
                                    >
                                        Konfirmasi Kata Sandi
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="Ulangi kata sandi"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full h-12 px-3.5 rounded-[12px] border border-border-control bg-surface text-ink text-[15px]"
                                        required
                                    />
                                </div>

                                <TactileButton
                                    type="submit"
                                    variant="brand"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? 'Mendaftarkan...' : 'Buat Akun Learner'}
                                </TactileButton>
                            </form>

                            <p className="mt-5 text-sm text-center text-ink-soft">
                                Sudah punya akun?{' '}
                                <Link href="/login" className="font-bold text-brand underline underline-offset-2">
                                    Masuk sekarang
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
