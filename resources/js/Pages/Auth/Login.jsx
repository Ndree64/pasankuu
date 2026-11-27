import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import GuestLayout from '../../Layouts/GuestLayout';
import TactileButton from '../../Components/UI/TactileButton';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout showAuthLinks={false}>
            <Head title="Masuk" />

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
                            Masuk dengan email (Learner) atau username (Admin dan Validator).
                        </p>
                    </div>

                    <div className="md:col-span-7">
                        <div className="bg-surface border border-border-subtle rounded-[20px] shadow-focal p-6 sm:p-8">
                            <h2 className="font-display text-xl font-bold text-ink mb-1">
                                Masuk ke Akun Pasanku
                            </h2>
                            <p className="text-sm text-ink-soft mb-6">
                                Gunakan email atau username beserta kata sandimu.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="login" className="block text-sm font-semibold text-ink mb-1.5">
                                        Email atau Username
                                    </label>
                                    <input
                                        id="login"
                                        type="text"
                                        autoComplete="username"
                                        placeholder="email@contoh.com atau username"
                                        value={data.login}
                                        onChange={(e) => setData('login', e.target.value)}
                                        className="w-full h-12 px-3.5 rounded-[12px] border border-border-control bg-surface text-ink text-[15px]"
                                        required
                                    />
                                    {errors.login && (
                                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-brand">
                                            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                            <span>{errors.login}</span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-ink mb-1.5">
                                        Kata Sandi
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
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

                                <div className="flex items-center gap-2.5">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 accent-brand rounded"
                                    />
                                    <label htmlFor="remember" className="text-sm text-ink-soft">
                                        Ingat saya di perangkat ini
                                    </label>
                                </div>

                                <TactileButton
                                    type="submit"
                                    variant="brand"
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? 'Memproses...' : 'Masuk'}
                                </TactileButton>
                            </form>

                            <p className="mt-5 text-sm text-center text-ink-soft">
                                Belum punya akun Learner?{' '}
                                <Link href="/register" className="font-bold text-brand underline underline-offset-2">
                                    Daftar di sini
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
