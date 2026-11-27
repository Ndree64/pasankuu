import React from 'react';
import { Link } from '@inertiajs/react';

const VARIANT_CLASSES = {
    brand: 'tactile-brand',
    accent: 'tactile-accent',
    success: 'tactile-success',
    neutral: 'tactile-neutral',
};

export default function TactileButton({
    variant = 'brand',
    href = null,
    type = 'button',
    disabled = false,
    className = '',
    children,
    ...props
}) {
    const base =
        'inline-flex items-center justify-center gap-2 min-h-12 px-5 py-2.5 rounded-[12px] font-semibold text-[15px] leading-snug select-none disabled:opacity-60';
    const classes = `${base} ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.brand} ${className}`;

    if (href && !disabled) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} disabled={disabled} className={classes} {...props}>
            {children}
        </button>
    );
}
