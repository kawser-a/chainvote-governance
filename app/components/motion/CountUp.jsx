"use client";
import { useEffect, useRef, useState } from "react";

const fmt = (n, decimals) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// Counts up to a number the first time it scrolls into view. Screen readers
// and anyone with reduced motion get the final value straight away.
export default function CountUp({ value, decimals = 0, suffix = "", duration = 1200, className }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(value);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || !value) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        setShown(0);
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || started.current) return;
                started.current = true;
                const t0 = performance.now();
                const tick = (t) => {
                    const p = Math.min(1, (t - t0) / duration);
                    const eased = 1 - Math.pow(1 - p, 3);
                    setShown(value * eased);
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [value, duration]);

    return (
        <span ref={ref} className={className}>
            <span aria-hidden="true">{fmt(shown, decimals)}{suffix}</span>
            <span className="sr-only">{fmt(value, decimals)}{suffix}</span>
        </span>
    );
}
