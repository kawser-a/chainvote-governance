'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import SignInLayout, { safeNext } from '../../components/site/SignInLayout';
import { Alert, Button, Field, Input } from '../../components/ui/primitives';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [next, setNext] = useState('/admin/dashboard');
    const userRef = useRef(null);
    const pwRef = useRef(null);

    useEffect(() => {
        const sp = new URLSearchParams(window.location.search);
        setNext(safeNext(sp.get('next'), '/admin/dashboard'));
    }, []);

    async function submit(e) {
        e.preventDefault();
        setMsg('');
        const errs = {};
        if (!username.trim()) errs.username = 'Enter your username.';
        if (!password) errs.password = 'Enter your password.';
        setErrors(errs);
        if (errs.username) return userRef.current?.focus();
        if (errs.password) return pwRef.current?.focus();

        setLoading(true);
        try {
            const r = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });
            const j = await r.json();
            if (!j.ok) {
                setMsg(
                    r.status === 500 && /not configured/i.test(j.error || '')
                        ? 'Admin sign-in isn’t set up on this server yet (ADMIN_USERNAME and ADMIN_PASSWORD are missing).'
                        : 'The username or password is incorrect.'
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
            role="admin"
            title="Election official sign in"
            description="For staff who run elections, review candidates and manifestos, and handle petitions."
        >
            <form noValidate onSubmit={submit} className="space-y-5">
                {msg && <Alert tone="danger" title="Sign in failed">{msg}</Alert>}

                <Field id="username" label="Username" error={errors.username}>
                    <Input
                        ref={userRef}
                        id="username"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={username}
                        error={errors.username}
                        onChange={(e) => setUsername(e.target.value)}
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
