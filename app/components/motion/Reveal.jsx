"use client";
import { useEffect, useRef, useState } from "react";

// Fades content up the first time it scrolls into view. Content is visible
// by default and only hidden once JavaScript is running, so nothing is lost
// if scripts fail or motion is reduced.
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
    const ref = useRef(null);
    const [state, setState] = useState("idle");

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) return; // already on screen: no need to animate
        setState("hidden");
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setState("shown");
                    io.disconnect();
                }
            },
            { rootMargin: "0px 0px -10% 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            className={`${className} ${state === "hidden" ? "opacity-0 translate-y-4" : ""} ${state === "shown" ? "animate-rise" : ""}`}
            style={state === "shown" && delay ? { animationDelay: `${delay}ms` } : undefined}
            {...rest}
        >
            {children}
        </Tag>
    );
}
