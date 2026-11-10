'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import SignInLayout, { safeNext } from '../../components/site/SignInLayout';
import { Alert, Button, Field, Input } from '../../components/ui/primitives';

export default function CandidateLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [next, setNext] = useState('/candidate/dashboard');
    const emailRef = useRef(null);
    const pwRef = useRef(null);

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        setNext(safeNext(sp.get('next'), '/candidate/dashboard'));
    }, []);

    async function submit(e) {
        e.preventDefault();
        setMsg('');
        const errs = {};
        if (!email.trim()) errs.email = 'Enter the email address your account was created with.';
        else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = 'Enter an email address like name@example.com.';
        if (!password) errs.password = 'Enter your password.';
        setErrors(errs);
        if (errs.email) return emailRef.current?.focus();
        if (errs.password) return pwRef.current?.focus();

        setLoading(true);
        try {
            const r = await fetch('/api/candidate/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const j = await r.json();
            if (!j.ok) {
                setMsg(
                    j.error === 'Access denied'
                        ? 'This account isn’t active yet or has been suspended. Contact the election office.'
                        : 'The email or password is incorrect.'
                );
                return;
            }
            window.location.href = next;
        } catch {
            setMsg('We couldn’t reach the server. Check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <SignInLayout
            role="candidate"
            title="Candidate sign in"
            description="Manage your manifestos, see results for your seat and respond to petitions."
            aside={
                <div className="max-w-sm">
                    <h2 className="text-lg font-semibold text-ink">Don’t have an account?</h2>
                    <p className="mt-2 text-ink-2">
                        Candidate accounts are created by the election office once your nomination is accepted. Your sign-in email and a temporary password are sent to you then.
                    </p>
                </div>
            }
        >
            <form noValidate onSubmit={submit} className="space-y-5">
                {msg && <Alert tone="danger" title="Sign in failed">{msg}</Alert>}

                <Field id="email" label="Email address" error={errors.email}>
                    <Input
                        ref={emailRef}
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        error={errors.email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>

                <Field id="password" label="Password" error={errors.password}>
                    <div className="relative">
                        <Input
                            ref={pwRef}
                            id="password"
                            type={show ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            error={errors.password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShow((v) => !v)}
                            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-md text-ink-3 hover:text-ink"
                            aria-label={show ? 'Hide password' : 'Show password'}
                            aria-pressed={show}
                        >
                            {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                        </button>
                    </div>
                </Field>

                <Button type="submit" size="lg" block loading={loading} loadingText="Signing in…">
                    Sign in
                </Button>
            </form>
        </SignInLayout>
    );
}
