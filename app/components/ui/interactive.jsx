"use client";
// Stateful UI pieces: dialogs, toasts, filter tabs, pagination and responsive tables.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, cx } from "./primitives";

/* ───────────── Dialog ───────────── */

// Built on the native <dialog> element: focus is trapped, Escape closes it,
// and focus returns to the button that opened it.
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }) {
    const ref = useRef(null);

    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) d.showModal();
        if (!open && d.open) d.close();
    }, [open]);

    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        const onCancel = (e) => {
            e.preventDefault();
            onClose?.();
        };
        d.addEventListener("cancel", onCancel);
        return () => d.removeEventListener("cancel", onCancel);
    }, [onClose]);

    const width = size === "lg" ? "sm:max-w-2xl" : size === "sm" ? "sm:max-w-md" : "sm:max-w-lg";

    return (
        <dialog
            ref={ref}
            aria-labelledby="dialog-title"
            onClick={(e) => e.target === ref.current && onClose?.()}
            className={cx(
                "m-0 mt-auto w-full max-w-none rounded-t-2xl border border-line-strong/60 bg-surface p-0 text-ink shadow-[0_24px_64px_-12px_rgb(0_0_0/0.7)]",
                "sm:m-auto sm:rounded-2xl",
                width
            )}
        >
            {open && (
                <div className="flex max-h-[90dvh] flex-col">
                    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                        <div className="min-w-0">
                            <h2 id="dialog-title" className="font-display text-xl font-semibold text-ink">{title}</h2>
                            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="-mr-2 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-subtle hover:text-ink active:bg-line"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                    {children && <div className="overflow-y-auto px-5 py-4">{children}</div>}
                    {footer && (
                        <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
                            {footer}
                        </div>
                    )}
                </div>
            )}
        </dialog>
    );
}

export function ConfirmDialog({
    open,
    onCancel,
    onConfirm,
    title,
    description,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "primary",
    loading = false,
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onCancel}
            title={title}
            description={description}
            footer={
                <>
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {children}
        </Dialog>
    );
}

/* ───────────── Toasts ───────────── */

const ToastContext = createContext({ notify: () => {} });

export function ToastProvider({ children }) {
    const [items, setItems] = useState([]);

    const dismiss = useCallback((id) => setItems((xs) => xs.filter((t) => t.id !== id)), []);

    const notify = useCallback(
        (message, { tone = "success", duration = 5000, action } = {}) => {
            const id = Math.random().toString(36).slice(2);
            setItems((xs) => [...xs.slice(-2), { id, message, tone, action }]);
            if (duration) setTimeout(() => dismiss(id), duration);
        },
        [dismiss]
    );

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}
            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:items-end lg:pb-4"
            >
                {items.map((t) => (
                    <div
                        key={t.id}
                        role={t.tone === "danger" ? "alert" : "status"}
                        className={cx(
                            "pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border bg-raised px-4 py-3 text-sm shadow-[0_16px_40px_-12px_rgb(0_0_0/0.7)]",
                            t.tone === "danger" ? "border-danger/40" : "border-brand/30"
                        )}
                    >
                        {t.tone === "danger" ? (
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                        ) : (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                        )}
                        <p className="min-w-0 flex-1 text-ink">{t.message}</p>
                        {t.action && (
                            <button
                                type="button"
                                onClick={() => { t.action.onClick(); dismiss(t.id); }}
                                className="-my-1 min-h-8 shrink-0 rounded-md px-2 font-semibold text-brand underline transition-colors hover:bg-subtle active:bg-line"
                            >
                                {t.action.label}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="-m-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
                            aria-label="Dismiss notification"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}

/* ───────────── Filter tabs ───────────── */

export function Segmented({ value, onChange, options, label, className }) {
    return (
        <div role="group" aria-label={label} className={cx("-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
            <div className="inline-flex min-w-max gap-1 rounded-xl border border-line bg-surface p-1">
                {options.map((o) => {
                    const v = typeof o === "string" ? o : o.value;
                    const l = typeof o === "string" ? o : o.label;
                    const active = v === value;
                    return (
                        <button
                            key={v}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onChange(v)}
                            className={cx(
                                "min-h-9 pointer-coarse:min-h-11 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-[background-color,color] duration-150 active:scale-[0.97]",
                                active ? "bg-brand-soft text-brand-ink ring-1 ring-brand/30" : "text-ink-2 hover:bg-subtle hover:text-ink"
                            )}
                        >
                            {l}
                            {typeof o === "object" && o.count != null && (
                                <span className={cx("ml-1.5 rounded-full px-1.5 text-xs tabular-nums", active ? "bg-brand/20 text-brand-ink" : "bg-subtle text-ink-3")}>{o.count}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ───────────── Pagination ───────────── */

export function Pagination({ page, pages, onChange, total, noun = "items" }) {
    if (!pages || pages < 1) return null;
    // "1 voter", not "1 voters".
    const label = total === 1 && noun.endsWith("s") ? noun.slice(0, -1) : noun;
    const count = total != null ? `${total.toLocaleString()} ${label}` : null;
    if (pages === 1) return count ? <p className="text-center text-sm text-ink-3 sm:text-left">{count}</p> : null;
    return (
        <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-ink-3">
                {count && <>{count} · </>}Page {page} of {pages}
            </p>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onChange(page + 1)} disabled={page >= pages}>
                    Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>
        </nav>
    );
}

/* ───────────── Responsive table ───────────── */

/*
 * A real table on wide screens; on phones each row becomes a card with the
 * primary column as its title and the rest as labelled values.
 *   columns: [{ key, header, cell(row), primary?, align?, mobile?: false }]
 */
export function DataTable({ columns, rows, rowKey = (r) => r._id, actions, empty, caption, breakpoint = "lg" }) {
    const primary = columns.find((c) => c.primary) || columns[0];
    const rest = columns.filter((c) => c !== primary && c.mobile !== false);
    // Spelled out in full so Tailwind picks the classes up.
    const showTable = { md: "hidden md:block", lg: "hidden lg:block", xl: "hidden xl:block" }[breakpoint];
    const showCards = { md: "md:hidden", lg: "lg:hidden", xl: "xl:hidden" }[breakpoint];

    if (!rows?.length) return empty || null;

    return (
        <>
            <div className={cx(showTable, "overflow-x-auto")}>
                <table className="w-full text-left text-sm">
                    {caption && <caption className="sr-only">{caption}</caption>}
                    <thead className="border-b border-line bg-raised text-xs font-semibold uppercase tracking-wide text-ink-3">
                        <tr>
                            {columns.map((c) => (
                                <th key={c.key} scope="col" className={cx("px-4 py-3 font-semibold", c.align === "right" && "text-right", c.nowrap && "whitespace-nowrap")}>
                                    {c.header}
                                </th>
                            ))}
                            {actions && (
                                <th scope="col" className="px-4 py-3 text-right font-semibold">
                                    <span className="sr-only">Actions</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {rows.map((r) => (
                            <tr key={rowKey(r)} className="align-middle transition-colors hover:bg-raised">
                                {columns.map((c) => (
                                    <td key={c.key} className={cx("px-4 py-3 text-ink", c.align === "right" && "text-right tabular-nums", c.nowrap && "whitespace-nowrap")}>
                                        {c.cell(r)}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap justify-end gap-2">{actions(r)}</div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ul className={cx(showCards, "divide-y divide-line")}>
                {rows.map((r) => (
                    <li key={rowKey(r)} className="px-4 py-4">
                        <div className="font-semibold text-ink break-words">{primary.cell(r)}</div>
                        {rest.length > 0 && (
                            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {rest.map((c) => (
                                    <div key={c.key} className={cx("min-w-0", c.wide && "col-span-2")}>
                                        <dt className="text-xs font-medium text-ink-3">{c.header}</dt>
                                        <dd className="mt-0.5 text-ink break-words">{c.cell(r)}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions(r)}</div>}
                    </li>
                ))}
            </ul>
        </>
    );
}
