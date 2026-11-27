import React from 'react';

export default function WovenDivider({ className = '' }) {
    return (
        <div
            className={`flex items-center justify-center gap-3 py-2 ${className}`}
            aria-hidden="true"
        >
            <span className="h-2.5 w-2.5 rotate-45 bg-brand rounded-[2px]" />
            <span className="h-3 w-3 rotate-45 bg-accent rounded-[2px]" />
            <span className="h-2.5 w-2.5 rotate-45 bg-brand rounded-[2px]" />
        </div>
    );
}
