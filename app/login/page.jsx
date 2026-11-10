'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SignInLayout, { safeNext } from '../components/site/SignInLayout';
import { Alert, Button, Field, Input } from '../components/ui/primitives';

function validate(nid, pin) {
    const errors = {};
    if (!nid) errors.nid = 'Enter your National ID number.';
    else if (!/^\d{10,17}$/.test(nid)) errors.nid = 'A National ID number is 10, 13 or 17 digits, numbers only.';
    if (!pin) errors.pin = 'Enter your 6-digit PIN.';
    else if (!/^\d{6}$/.test(pin)) errors.pin = 'Your PIN is exactly 6 digits.';
    return errors;
}

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [nid, setNid] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [errors, setErrors] = useState({});
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [next, setNext] = useState('/dashboard');
    const [notice, setNotice] = useState('');
    const nidRef = useRef(null);
    const pinRef = useRef(null);

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        setNext(safeNext(sp.get('next'), '/dashboard'));
        if (sp.get('next')) setNotice('Please sign in to continue.');
        if (sp.get('enrolled')) setNotice('Enrollment complete. Sign in with your new PIN.');
        if (sp.get('nid')) setNid(sp.get('nid').replace(/\D/g, ''));
    }, []);

    async function submit(e) {
        e.preventDefault();
        setMsg('');
        const errs = validate(nid, pin);
        setErrors(errs);
        if (errs.nid) return nidRef.current?.focus();
        if (errs.pin) return pinRef.current?.focus();

        setLoading(true);
        try {
            const r = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ nid, pin }),
            });
            const j = await r.json();
            if (!j.ok) {
                setMsg(j.error || 'We couldn’t sign you in. Check your National ID and PIN and try again.');
                return;
            }
            await login();
            router.push(next);
        } catch {
            setMsg('We couldn’t reach the server. Check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <SignInLayout
            role="voter"
            title="Sign in to vote"
            description="Use the National ID number you enrolled with and the 6-digit PIN you chose."
            aside={
                <div className="max-w-sm">
                    <h2 className="text-lg font-semibold text-ink">First time here?</h2>
                    <p className="mt-2 text-ink-2">
                        You need to enroll once before you can vote. It takes about two minutes and you’ll need your National ID and the mobile number registered to it.
                    </p>
                    <Link href="/enroll" className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand underline hover:text-brand-hover">
                        Enroll to vote
                    </Link>
                </div>
            }
        >
            <form noValidate onSubmit={submit} className="space-y-5">
                {notice && !msg && <Alert tone="info">{notice}</Alert>}
                {msg && <Alert tone="danger" title="Sign in failed">{msg}</Alert>}

                <Field id="nid" label="National ID number" error={errors.nid}>
                    <Input
                        ref={nidRef}
                        id="nid"
                        name="nid"
                        inputMode="numeric"
                        autoComplete="username"
                        maxLength={17}
                        value={nid}
                        error={errors.nid}
                        onChange={(e) => setNid(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 1990123456789"
                    />
                </Field>

                <Field id="pin" label="PIN" error={errors.pin}>
                    <div className="relative">
                        <Input
                            ref={pinRef}
                            id="pin"
                            name="pin"
                            type={showPin ? 'text' : 'password'}
                            inputMode="numeric"
                            autoComplete="current-password"
                            maxLength={6}
                            value={pin}
                            error={errors.pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="pr-12 tracking-widest"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPin((v) => !v)}
                            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-ink-3 hover:text-ink"
                            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                            aria-pressed={showPin}
                        >
                            {showPin ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                        </button>
                    </div>
                </Field>

                <Button type="submit" size="lg" block loading={loading} loadingText="Signing in…">
                    Sign in
                </Button>

                <p className="text-center text-sm text-ink-2 lg:hidden">
                    Not enrolled yet?{' '}
                    <Link href="/enroll" className="font-semibold text-brand underline hover:text-brand-hover">
                        Enroll to vote
                    </Link>
                </p>
            </form>
        </SignInLayout>
    );
}
