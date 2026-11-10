'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Smartphone } from 'lucide-react';
import { Alert, Button, ButtonLink, Field, Input, cx } from '../components/ui/primitives';
import { useToast } from '../components/ui/interactive';

const STEPS = ['Your National ID', 'Confirm your phone', 'Choose a PIN'];

// Show enough of the number to recognise it without displaying it in full.
function maskSim(n) {
    const s = String(n || '');
    return s.length > 7 ? `${s.slice(0, 4)} ••• ${s.slice(-4)}` : s;
}

function friendly(error, fallback) {
    const map = {
        'Voter not found': 'We couldn’t find that National ID on the voter roll. Check the number and try again.',
        'SIM not linked to this NID': 'That number isn’t registered to this National ID.',
        'SIM not linked': 'That number isn’t registered to this National ID.',
        'OTP invalid': 'That code isn’t right. Check the text message and try again.',
        'OTP expired': 'That code has expired. Request a new one below.',
        'Missing fields': 'Some details are missing. Please fill in every field.',
    };
    return map[error] || error || fallback;
}

function Progress({ step }) {
    return (
        <div className="mb-6">
            <p className="text-sm font-semibold text-ink-2">
                Step {Math.min(step, 3)} of 3 <span className="font-normal text-ink-3">· {STEPS[Math.min(step, 3) - 1]}</span>
            </p>
            <ol className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
                {STEPS.map((s, i) => (
                    <li key={s} className={cx('h-1.5 rounded-full', i + 1 <= step ? 'bg-brand' : 'bg-line')} />
                ))}
            </ol>
        </div>
    );
}

export default function EnrollPage() {
    const { notify } = useToast();
    const [step, setStep] = useState(1);
    const [nid, setNid] = useState('');
    const [name, setName] = useState('');
    const [sims, setSims] = useState([]);
    const [msisdn, setMsisdn] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [pin2, setPin2] = useState('');
    const [errors, setErrors] = useState({});
    const [msg, setMsg] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const headingRef = useRef(null);

    // Move focus to each new step's heading so screen reader and keyboard users know the step changed.
    useEffect(() => {
        headingRef.current?.focus();
    }, [step]);

    function goTo(s) {
        setMsg('');
        setErrors({});
        setStep(s);
    }

    async function findVoter(e) {
        e.preventDefault();
        setMsg('');
        if (!/^\d{10,17}$/.test(nid)) {
            setErrors({ nid: nid ? 'A National ID number is 10, 13 or 17 digits, numbers only.' : 'Enter your National ID number.' });
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const res = await fetch(`/api/voter-sims?nid=${encodeURIComponent(nid)}`);
            const j = await res.json();
            if (!res.ok || j.ok === false) {
                setMsg(friendly(j.error, 'We couldn’t look up that National ID. Try again.'));
                return;
            }
            setName(j.name || '');
            setSims(j.sims || []);
            setMsisdn((j.sims || []).length === 1 ? j.sims[0] : '');
            goTo(2);
        } catch {
            setMsg('We couldn’t reach the server. Check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    async function requestCode() {
        const r = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nid, msisdn }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(friendly(j.error, 'We couldn’t send a code. Try again.'));
        setDevOtp(j.devOtp || '');
    }

    async function sendOtp(e) {
        e.preventDefault();
        setMsg('');
        if (!msisdn) {
            setErrors({ sim: 'Choose the number we should text the code to.' });
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            await requestCode();
            setOtp('');
            goTo(3);
        } catch (err) {
            setMsg(err.message || 'We couldn’t reach the server. Check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    async function resend() {
        setMsg('');
        setResending(true);
        try {
            await requestCode();
            setOtp('');
            notify(`A new code was sent to ${maskSim(msisdn)}.`);
        } catch (err) {
            setMsg(err.message);
        } finally {
            setResending(false);
        }
    }

    async function complete(e) {
        e.preventDefault();
        setMsg('');
        const errs = {};
        if (!/^\d{6}$/.test(otp)) errs.otp = 'Enter the 6-digit code from the text message.';
        if (!/^\d{6}$/.test(pin)) errs.pin = 'Your PIN must be exactly 6 digits.';
        else if (/^(\d)\1{5}$/.test(pin) || pin === '123456' || pin === '654321') errs.pin = 'Choose a PIN that’s harder to guess than repeated or sequential digits.';
        if (!errs.pin && pin !== pin2) errs.pin2 = 'The two PINs don’t match.';
        setErrors(errs);
        if (Object.keys(errs).length) return;

        setLoading(true);
        try {
            const r = await fetch('/api/enroll/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nid, msisdn, otp, pin }),
            });
            const j = await r.json();
            if (!j.ok) {
                const m = friendly(j.error, 'Enrollment failed. Try again.');
                if (j.error === 'OTP invalid' || j.error === 'OTP expired') setErrors({ otp: m });
                else setMsg(m);
                return;
            }
            goTo(4);
        } catch {
            setMsg('We couldn’t reach the server. Check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-1 justify-center px-4 py-8 sm:px-6 sm:py-14">
            <div className="w-full max-w-lg">
                {step < 4 && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Enroll to vote</h1>
                        <p className="mt-1.5 text-ink-2">You only need to do this once.</p>
                    </div>
                )}

                <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-sm sm:p-8">
                    {step < 4 && <Progress step={step} />}

                    {msg && <Alert tone="danger" className="mb-5">{msg}</Alert>}

                    {step === 1 && (
                        <form noValidate onSubmit={findVoter} className="space-y-5">
                            <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-ink focus:outline-none">
                                What’s your National ID number?
                            </h2>
                            <Field id="nid" label="National ID number" hint="It’s on the front of your NID card." error={errors.nid}>
                                <Input
                                    id="nid"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    maxLength={17}
                                    value={nid}
                                    hint
                                    error={errors.nid}
                                    onChange={(e) => setNid(e.target.value.replace(/\D/g, ''))}
                                    placeholder="e.g. 1985000000001"
                                />
                            </Field>
                            <Button type="submit" size="lg" block loading={loading} loadingText="Checking…">
                                Continue
                            </Button>
                            <p className="text-center text-sm text-ink-2">
                                Already enrolled?{' '}
                                <Link href="/login" className="font-semibold text-brand underline hover:text-brand-hover">Sign in</Link>
                            </p>
                        </form>
                    )}

                    {step === 2 && (
                        <form noValidate onSubmit={sendOtp} className="space-y-5">
                            <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-ink focus:outline-none">
                                Confirm it’s you
                            </h2>

                            <div className="rounded-md border border-line bg-canvas px-4 py-3">
                                <p className="text-sm text-ink-3">National ID {nid} belongs to</p>
                                <p className="mt-0.5 text-lg font-semibold text-ink break-words">{name || '—'}</p>
                                <button type="button" onClick={() => goTo(1)} className="mt-1 min-h-9 pointer-coarse:min-h-11 text-sm font-semibold text-brand underline hover:text-brand-hover">
                                    Not you? Use a different ID
                                </button>
                            </div>

                            <fieldset aria-describedby={errors.sim ? 'sim-error' : undefined}>
                                <legend className="text-sm font-semibold text-ink">Where should we text your code?</legend>
                                <p className="mt-0.5 text-sm text-ink-3">These are the numbers registered to your National ID.</p>
                                {sims.length === 0 ? (
                                    <Alert tone="warning" className="mt-3">
                                        No mobile numbers are registered to this National ID, so we can’t verify it. Contact your election office.
                                    </Alert>
                                ) : (
                                    <div className="mt-3 space-y-2">
                                        {sims.map((s) => (
                                            <label
                                                key={s}
                                                className={cx(
                                                    'flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors',
                                                    msisdn === s ? 'border-brand bg-brand-soft' : 'border-line-strong hover:bg-subtle'
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="sim"
                                                    value={s}
                                                    checked={msisdn === s}
                                                    onChange={() => setMsisdn(s)}
                                                    className="h-5 w-5"
                                                />
                                                <Smartphone className="h-5 w-5 text-ink-3" aria-hidden="true" />
                                                <span className="font-medium tabular-nums text-ink">{maskSim(s)}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {errors.sim && <p id="sim-error" className="mt-2 text-sm font-medium text-danger">{errors.sim}</p>}
                            </fieldset>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <Button variant="secondary" size="lg" onClick={() => goTo(1)} className="sm:w-auto">
                                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                                </Button>
                                <Button type="submit" size="lg" block loading={loading} loadingText="Sending code…" disabled={sims.length === 0}>
                                    Text me a code
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form noValidate onSubmit={complete} className="space-y-5">
                            <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-ink focus:outline-none">
                                Enter your code and choose a PIN
                            </h2>
                            <p className="-mt-2 text-[15px] text-ink-2">
                                We sent a 6-digit code to <span className="font-semibold text-ink tabular-nums">{maskSim(msisdn)}</span>. It expires in 5 minutes.
                            </p>

                            {devOtp && (
                                <Alert tone="info" title="Demo mode">
                                    Text messages aren’t connected on this server, so your code is shown here instead:{' '}
                                    <span className="font-mono font-semibold tracking-widest text-ink">{devOtp}</span>
                                </Alert>
                            )}

                            <Field id="otp" label="Code from the text message" error={errors.otp}>
                                <Input
                                    id="otp"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={otp}
                                    error={errors.otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="max-w-[12rem] tracking-[0.3em]"
                                />
                            </Field>
                            <div className="-mt-2 flex flex-wrap gap-x-4 text-sm">
                                <button type="button" onClick={resend} disabled={resending} className="min-h-9 pointer-coarse:min-h-11 font-semibold text-brand underline hover:text-brand-hover disabled:opacity-60">
                                    {resending ? 'Sending…' : 'Send a new code'}
                                </button>
                                <button type="button" onClick={() => goTo(2)} className="min-h-9 pointer-coarse:min-h-11 font-semibold text-brand underline hover:text-brand-hover">
                                    Use a different number
                                </button>
                            </div>

                            <div className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
                                <Field id="pin" label="Choose a 6-digit PIN" error={errors.pin}>
                                    <Input
                                        id="pin"
                                        type="password"
                                        inputMode="numeric"
                                        autoComplete="new-password"
                                        maxLength={6}
                                        value={pin}
                                        error={errors.pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        className="tracking-widest"
                                    />
                                </Field>
                                <Field id="pin2" label="Type the PIN again" error={errors.pin2}>
                                    <Input
                                        id="pin2"
                                        type="password"
                                        inputMode="numeric"
                                        autoComplete="new-password"
                                        maxLength={6}
                                        value={pin2}
                                        error={errors.pin2}
                                        onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))}
                                        className="tracking-widest"
                                    />
                                </Field>
                            </div>
                            <p className="-mt-2 text-sm text-ink-3">You’ll use this PIN every time you sign in. Don’t share it with anyone.</p>

                            <Button type="submit" size="lg" block loading={loading} loadingText="Finishing enrollment…">
                                Finish enrollment
                            </Button>
                        </form>
                    )}

                    {step === 4 && (
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto h-12 w-12 text-brand" aria-hidden="true" />
                            <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-2xl font-bold text-ink focus:outline-none">
                                You’re enrolled
                            </h1>
                            <p className="mt-2 text-ink-2">
                                {name ? `${name}, you` : 'You'} can now sign in with your National ID and the PIN you just chose.
                            </p>
                            <ButtonLink href="/login?enrolled=1" size="lg" block className="mt-6">
                                Sign in to vote
                            </ButtonLink>
                            <ButtonLink href="/" variant="ghost" block className="mt-2">
                                Back to home
                            </ButtonLink>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
