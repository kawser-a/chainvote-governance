"use client";
import { useEffect, useState } from "react";

function parts(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

// A live "closes in" clock. Updates every second, but only announces to
// screen readers once a minute so it isn't noisy.
export default function Countdown({ to, prefix = "Closes in", endedText = "Voting has closed", className }) {
    const target = new Date(to).getTime();
    const [now, setNow] = useState(null);

    useEffect(() => {
        setNow(Date.now());
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    if (now === null) return <span className={className}>&nbsp;</span>;
    const left = target - now;
    if (left <= 0) return <span className={className}>{endedText}</span>;
    const { d, h, m, s } = parts(left);
    const cells = d > 0 ? [[d, "d"], [h, "h"], [m, "m"]] : [[h, "h"], [m, "m"], [s, "s"]];

    return (
        <span className={className}>
            <span className="sr-only" aria-live="off">
                {prefix} {d > 0 ? `${d} days ` : ""}{h} hours {m} minutes
            </span>
            <span aria-hidden="true" className="inline-flex items-baseline gap-1.5">
                <span className="text-ink-3">{prefix}</span>
                {cells.map(([v, u]) => (
                    <span key={u} className="tabular-nums">
                        <span className="font-semibold text-ink">{String(v).padStart(2, "0")}</span>
                        <span className="text-ink-3">{u}</span>
                    </span>
                ))}
            </span>
        </span>
    );
}
