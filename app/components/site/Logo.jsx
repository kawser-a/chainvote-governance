import Link from "next/link";

export function LogoMark({ className = "h-8 w-8" }) {
    // A ballot slip with a tick: simple, legible at small sizes.
    return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
            <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--color-brand)" />
            <path d="M9.5 16.5l4.2 4.2 8.8-9.4" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Logo({ href = "/", label = "ChainVote home", className = "" }) {
    return (
        <Link href={href} aria-label={label} className={`inline-flex min-h-11 items-center gap-2.5 rounded-md ${className}`}>
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-ink">ChainVote</span>
        </Link>
    );
}
