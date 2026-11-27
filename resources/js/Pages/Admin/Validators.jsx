import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { UserPlus, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import TactileButton from '../../Components/UI/TactileButton';
import EmptyState from '../../Components/UI/EmptyState';

export default function Validators({ validators }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/validators', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Akun Validator" />

            <div className="space-y-6">
                <div>
                    <h1 className="font-display text-2xl sm:text-[28px] font-bold text-ink">
                        Manajemen Akun Validator
                    </h1>
                    <p className="text-sm text-ink-soft mt-1">
                        Buat akun baru untuk penutur atau ahli Bahasa Pasan, dan atur status aktifnya.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-surface border border-border-subtle rounded-[16px] p-5 space-y-4"
                >
                    <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-brand" aria-hidden="true" />
                        <span>Tambah Akun Validator</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="val_name" className="block text-sm font-semibold text-ink mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                id="val_name"
                                type="text"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                placeholder="Nama penutur / ahli"
                                className="w-full h-11 px-3 rounded-[12px] border border-border-control text-sm"
                                required
                            />
                            {errors.full_name && (
                                <p className="mt-1 text-xs text-brand flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                    <span>{errors.full_name}</span>
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="val_email" className="block text-sm font-semibold text-ink mb-1">
                                Email
                            </label>
                            <input
                                id="val_email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="validator@pasanku.test"
                                className="w-full h-11 px-3 rounded-[12px] border border-border-control text-sm"
                                required
                            />
                            {errors.email && (
                                <p className="mt-1 text-xs text-brand flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                    <span>{errors.email}</span>
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="val_pass" className="block text-sm font-semibold text-ink mb-1">
                                Kata Sandi Awal
                            </label>
                            <input
                                id="val_pass"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="w-full h-11 px-3 rounded-[12px] border border-border-control text-sm"
                                required
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-brand flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                    <span>{errors.password}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <TactileButton type="submit" variant="brand" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Buat Akun Validator'}
                        </TactileButton>
                    </div>
                </form>

                {validators.length === 0 ? (
                    <EmptyState
                        title="Belum ada akun Validator"
                        description="Tambahkan minimal satu Validator untuk memeriksa materi Bahasa Pasan."
                    />
                ) : (
                    <div className="bg-surface border border-border-subtle rounded-[16px] divide-y divide-border-subtle">
                        {validators.map((validator) => (
                            <div
                                key={validator.id}
                                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                            >
                                <div>
                                    <p className="font-semibold text-ink">{validator.full_name}</p>
                                    <p className="text-sm text-ink-soft">{validator.email}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-xs font-semibold ${
                                            validator.is_active
                                                ? 'bg-success-tint text-success border-success'
                                                : 'bg-brand-tint text-brand border-brand'
                                        }`}
                                    >
                                        {validator.is_active ? (
                                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        ) : (
                                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                        )}
                                        <span>{validator.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </span>

                                    <TactileButton
                                        variant="neutral"
                                        onClick={() => router.patch(`/admin/validators/${validator.id}/toggle-status`)}
                                        className="min-h-11 px-3.5 text-xs"
                                    >
                                        {validator.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    </TactileButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
