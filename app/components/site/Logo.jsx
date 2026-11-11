import Link from "next/link";

/*
 * The mark: a ballot slip going into a box, with two linked rings on the
 * front of the box for the chain the votes are recorded on. It is drawn on a
 * 40-unit grid and stays readable down to 16px.
 */
export function LogoMark({ className = "h-9 w-9", animated = false }) {
    return (
        <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
            <rect x="0.5" y="0.5" width="39" height="39" rx="10" fill="var(--color-raised)" stroke="var(--color-line-strong)" />
            <g className={animated ? "origin-center animate-[slip_0.7s_var(--ease-out-soft)_both]" : undefined}>
                <rect x="13" y="4" width="14" height="15.5" rx="2.5" fill="var(--color-accent)" />
                <path
                    d="M16.4 11.6l2.6 2.6 4.7-5"
                    fill="none"
                    stroke="var(--color-on-accent)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <rect x="6" y="17" width="28" height="18" rx="4" fill="var(--color-brand)" />
            <rect x="11" y="16.5" width="18" height="3.5" rx="1.75" fill="var(--color-on-brand)" />
            <g fill="none" stroke="var(--color-on-brand)" strokeWidth="1.8" opacity="0.7">
                <rect x="12.5" y="24.5" width="9" height="5.5" rx="2.75" />
                <rect x="18.5" y="24.5" width="9" height="5.5" rx="2.75" />
            </g>
        </svg>
    );
}

export function Wordmark({ className = "" }) {
    return (
        <span className={`font-display text-[19px] font-semibold tracking-tight text-ink ${className}`}>
            Chain<span className="text-brand">Vote</span>
        </span>
    );
}

export default function Logo({ href = "/", label = "ChainVote home", className = "" }) {
    return (
        <Link
            href={href}
            aria-label={label}
            className={`group inline-flex min-h-11 items-center gap-2.5 rounded-lg ${className}`}
        >
            <LogoMark className="h-9 w-9 transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-105" />
            <Wordmark />
        </Link>
    );
}
