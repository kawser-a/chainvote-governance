// Date and time helpers so every date in the app is written the same way,
// e.g. "12 Nov 2026, 10:45 pm" and "closes in 2 days".

const DATE = { day: "numeric", month: "short", year: "numeric" };
const TIME = { hour: "numeric", minute: "2-digit" };

function toDate(v) {
    const d = v instanceof Date ? v : new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(v) {
    const d = toDate(v);
    return d ? d.toLocaleDateString("en-GB", DATE) : "—";
}

export function formatDateTime(v) {
    const d = toDate(v);
    return d ? `${d.toLocaleDateString("en-GB", DATE)}, ${d.toLocaleTimeString("en-GB", TIME)}` : "—";
}

export function formatRange(a, b) {
    return `${formatDateTime(a)} – ${formatDateTime(b)}`;
}

function span(ms) {
    const m = Math.round(Math.abs(ms) / 60000);
    if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
    const h = Math.round(m / 60);
    if (h < 48) return `${h} hour${h === 1 ? "" : "s"}`;
    const d = Math.round(h / 24);
    return `${d} day${d === 1 ? "" : "s"}`;
}

// Where an election is in its life, from the voter's point of view.
export function electionPhase(e, now = Date.now()) {
    const s = Date.parse(e.startAt);
    const end = Date.parse(e.endAt);
    if (e.status === "paused") return "paused";
    if (e.status === "completed" || e.status === "archived" || end < now) return "ended";
    if (s > now) return "upcoming";
    if (e.status === "active") return "active";
    return e.status === "scheduled" ? "upcoming" : e.status || "upcoming";
}

export function phaseLabel(e, now = Date.now()) {
    const s = Date.parse(e.startAt);
    const end = Date.parse(e.endAt);
    const phase = electionPhase(e, now);
    if (phase === "upcoming") return `Opens in ${span(s - now)}`;
    if (phase === "active") return `Closes in ${span(end - now)}`;
    if (phase === "paused") return "Voting is paused";
    return `Ended ${formatDate(e.endAt)}`;
}

export function titleCase(s) {
    return String(s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function timeAgo(v, now = Date.now()) {
    const d = toDate(v);
    if (!d) return "—";
    const ms = now - d.getTime();
    if (ms < 60000) return "just now";
    return `${span(ms)} ago`;
}

export function shortHash(h) {
    return h ? `${String(h).slice(0, 6)}…${String(h).slice(-4)}` : "—";
}
