// Shared, stateless UI building blocks. Safe to use from server and client components.
import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, ArrowLeft, Loader2 } from "lucide-react";

export function cx(...parts) {
    return parts.filter(Boolean).join(" ");
}

/* ───────────── Buttons ───────────── */

const BUTTON_BASE =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold select-none " +
    "transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out " +
    "active:scale-[0.97] " +
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 " +
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

const BUTTON_VARIANTS = {
    primary:
        "bg-brand text-on-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-brand-hover " +
        "hover:shadow-[0_0_0_4px_rgb(63_207_142/0.15)] active:bg-brand-active",
    accent: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent",
    secondary: "bg-raised text-ink border border-line-strong hover:bg-subtle hover:border-ink-3 active:bg-line",
    ghost: "text-ink-2 hover:bg-subtle hover:text-ink active:bg-line",
    danger: "bg-danger text-on-danger hover:bg-danger-hover active:bg-danger",
    "danger-outline": "bg-transparent text-danger border border-danger/50 hover:bg-danger-soft hover:border-danger active:bg-danger-soft",
    link: "text-brand underline decoration-brand/40 hover:text-brand-hover hover:decoration-current px-0 min-h-0 active:scale-100",
};

const BUTTON_SIZES = {
    sm: "min-h-9 pointer-coarse:min-h-11 px-3 text-sm",
    md: "min-h-11 px-4 text-[15px]",
    lg: "min-h-12 px-6 text-base",
};

export function buttonClass({ variant = "primary", size = "md", block = false, className = "" } = {}) {
    return cx(BUTTON_BASE, BUTTON_VARIANTS[variant], variant === "link" ? "" : BUTTON_SIZES[size], block && "w-full", className);
}

export function Button({ variant, size, block, loading = false, loadingText, className, children, type = "button", disabled, ...rest }) {
    return (
        <button
            type={type}
            className={buttonClass({ variant, size, block, className })}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {loading && loadingText ? loadingText : children}
        </button>
    );
}

export function ButtonLink({ href, variant, size, block, className, children, ...rest }) {
    return (
        <Link href={href} className={buttonClass({ variant, size, block, className })} {...rest}>
            {children}
        </Link>
    );
}

/* ───────────── Layout pieces ───────────── */

export function PageHeader({ title, description, actions, back, eyebrow }) {
    return (
        <div className="mb-6 animate-rise sm:mb-8">
            {back && (
                <Link
                    href={back.href}
                    className="mb-3 inline-flex min-h-9 pointer-coarse:min-h-11 items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
                >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    {back.label}
                </Link>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>}
                    <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[32px] break-words">{title}</h1>
                    {description && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-2">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
        </div>
    );
}

export function Card({ as: Tag = "section", className, interactive = false, children, ...rest }) {
    return (
        <Tag
            className={cx(
                "rounded-[var(--radius-card)] border border-line bg-surface shadow-[0_1px_0_rgb(255_255_255/0.03)_inset,0_8px_24px_-12px_rgb(0_0_0/0.5)]",
                interactive &&
                    "transition-[border-color,transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:bg-raised",
                className
            )}
            {...rest}
        >
            {children}
        </Tag>
    );
}

export function CardHeader({ title, description, action, className, level = 2 }) {
    const H = `h${level}`;
    return (
        <div className={cx("flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6", className)}>
            <div className="min-w-0">
                <H className="text-base font-semibold text-ink">{title}</H>
                {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

export function CardBody({ className, children }) {
    return <div className={cx("px-4 py-4 sm:px-6 sm:py-5", className)}>{children}</div>;
}

/* ───────────── Status ───────────── */

const BADGE_TONES = {
    neutral: "bg-subtle text-ink-2 border-line",
    success: "bg-brand-soft text-brand-ink border-brand/25",
    warning: "bg-warn-soft text-accent-ink border-warn/25",
    accent: "bg-accent-soft text-accent-ink border-accent/25",
    danger: "bg-danger-soft text-danger border-danger/20",
    info: "bg-info-soft text-info border-info/20",
};

export function Badge({ tone = "neutral", className, children }) {
    return (
        <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", BADGE_TONES[tone], className)}>
            {children}
        </span>
    );
}

// One vocabulary for every status in the system, so the same word always looks the same.
const STATUS = {
    active: ["success", "Voting open"],
    live: ["success", "Voting open"],
    scheduled: ["info", "Upcoming"],
    upcoming: ["info", "Upcoming"],
    paused: ["warning", "Paused"],
    completed: ["neutral", "Ended"],
    ended: ["neutral", "Ended"],
    draft: ["neutral", "Draft"],
    archived: ["neutral", "Archived"],
    pending: ["warning", "Awaiting review"],
    approved: ["success", "Approved"],
    rejected: ["danger", "Rejected"],
    open: ["info", "Open"],
    under_review: ["warning", "Under review"],
    accepted: ["success", "Accepted"],
    dismissed: ["neutral", "Dismissed"],
    removed: ["danger", "Removed"],
    enrolled: ["success", "Enrolled"],
    not_enrolled: ["neutral", "Not enrolled"],
    banned: ["danger", "Banned"],
    voting_disabled: ["warning", "Voting disabled"],
};

export function StatusBadge({ status, label }) {
    const [tone, text] = STATUS[status] || ["neutral", status ? String(status).replace(/_/g, " ") : "Unknown"];
    const live = status === "active" || status === "live";
    return (
        <Badge tone={tone}>
            {live && <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-ring" aria-hidden="true" />}
            {label || text}
        </Badge>
    );
}

/* A labelled progress bar. value and max are numbers; tone is brand, accent, danger or muted. */
export function Meter({ value = 0, max = 100, tone, label, className, delay = 0 }) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return (
        <div
            className={cx("meter", className)}
            data-tone={tone}
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={value}
        >
            <span style={{ width: `${pct}%`, animationDelay: `${delay}ms` }} />
        </div>
    );
}

const ALERT_TONES = {
    info: ["bg-info-soft border-info/25 text-info", Info],
    success: ["bg-brand-soft border-brand/25 text-brand-ink", CheckCircle2],
    warning: ["bg-warn-soft border-warn/25 text-accent", TriangleAlert],
    danger: ["bg-danger-soft border-danger/25 text-danger", AlertCircle],
};

export function Alert({ tone = "info", title, children, className, action }) {
    const [cls, Icon] = ALERT_TONES[tone];
    const urgent = tone === "danger" || tone === "warning";
    return (
        <div role={urgent ? "alert" : "status"} className={cx("flex gap-3 rounded-md border px-4 py-3 text-sm", cls, className)}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-ink">
                {title && <p className="font-semibold">{title}</p>}
                {children && <div className={cx("break-words", title && "mt-0.5 text-ink-2")}>{children}</div>}
                {action && <div className="mt-2">{action}</div>}
            </div>
        </div>
    );
}

export function EmptyState({ icon: Icon, title, children, action, className }) {
    return (
        <div className={cx("flex flex-col items-center px-4 py-10 text-center", className)}>
            {Icon && (
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-raised text-ink-3">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
            )}
            <p className="font-semibold text-ink">{title}</p>
            {children && <div className="mt-1 max-w-sm text-sm text-ink-2">{children}</div>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function Loading({ label = "Loading…", rows = 3, className }) {
    return (
        <div role="status" aria-live="polite" className={cx("space-y-3", className)}>
            <span className="sr-only">{label}</span>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-lg" style={{ opacity: 1 - i * 0.2 }} />
            ))}
        </div>
    );
}

export function Stat({ label, value, hint, icon: Icon, tone = "brand", children }) {
    return (
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-ink-2">{label}</p>
                {Icon && (
                    <span
                        className={cx(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                            tone === "accent" ? "bg-accent-soft text-accent" : "bg-brand-soft text-brand"
                        )}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                )}
            </div>
            <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-ink tabular-nums break-all">{value}</p>
            {hint && <p className="mt-2 text-sm text-ink-3">{hint}</p>}
            {children}
        </div>
    );
}

/* Key–value list used for details and mobile table rows. */
export function DetailList({ items, className }) {
    return (
        <dl className={cx("grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2", className)}>
            {items.filter(Boolean).map(([k, v]) => (
                <div key={k} className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-3">{k}</dt>
                    <dd className="mt-0.5 text-sm text-ink break-words">{v ?? "—"}</dd>
                </div>
            ))}
        </dl>
    );
}

/* ───────────── Form fields ───────────── */

const CONTROL =
    "block w-full rounded-lg border border-line-strong bg-canvas px-3 text-base text-ink placeholder:text-ink-3 " +
    "transition-[border-color,box-shadow] duration-150 hover:border-ink-3 " +
    "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/20 " +
    "disabled:cursor-not-allowed disabled:border-line disabled:bg-subtle disabled:text-ink-3 " +
    "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/20";

export function Field({ id, label, hint, error, required, optional, children, className }) {
    return (
        <div className={cx("min-w-0", className)}>
            {label && (
                <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
                    {label}
                    {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
                    {optional && <span className="ml-1 font-normal text-ink-3">(optional)</span>}
                </label>
            )}
            {hint && <p id={`${id}-hint`} className="-mt-0.5 mb-1.5 text-sm text-ink-3">{hint}</p>}
            {children}
            {error && (
                <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                </p>
            )}
        </div>
    );
}

function describedBy(id, hint, error) {
    return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

export function Input({ id, hint, error, className, ...rest }) {
    return (
        <input
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            className={cx(CONTROL, "min-h-11 py-2", className)}
            {...rest}
        />
    );
}

export function Select({ id, hint, error, className, children, ...rest }) {
    return (
        <select
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            className={cx(CONTROL, "min-h-11 py-2 pr-8", className)}
            {...rest}
        >
            {children}
        </select>
    );
}

export function Textarea({ id, hint, error, className, rows = 4, ...rest }) {
    return (
        <textarea
            id={id}
            rows={rows}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(id, hint, error)}
            className={cx(CONTROL, "py-2.5 leading-relaxed", className)}
            {...rest}
        />
    );
}

export function Checkbox({ id, label, description, className, ...rest }) {
    return (
        <label htmlFor={id} className={cx("flex min-h-11 cursor-pointer items-start gap-3 py-2", className)}>
            <input id={id} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong" {...rest} />
            <span className="min-w-0">
                <span className="block text-[15px] font-medium text-ink">{label}</span>
                {description && <span className="block text-sm text-ink-3">{description}</span>}
            </span>
        </label>
    );
}
