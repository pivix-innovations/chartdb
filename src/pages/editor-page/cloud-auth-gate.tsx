import React, { useState } from 'react';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { Spinner } from '@/components/spinner/spinner';
import { useAuth } from '@/context/auth-context/use-auth';
import { supabase } from '@/lib/supabase';
import { DesignDBWordmark } from '@/components/designdb-wordmark';

export const CloudAuthGate: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { session, loading, configured } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signUp, setSignUp] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="large" />
            </div>
        );
    if (!configured || !supabase) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6">
                <div className="max-w-lg space-y-3 rounded-lg border p-6">
                    <h1 className="text-xl font-semibold">
                        Cloud storage is not configured
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your
                        Netlify environment variables, then redeploy.
                    </p>
                </div>
            </div>
        );
    }
    if (session) return <>{children}</>;
    const client = supabase;

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setBusy(true);
        setMessage('');
        const result = signUp
            ? await client.auth.signUp({ email, password })
            : await client.auth.signInWithPassword({ email, password });
        setBusy(false);
        setMessage(
            result.error?.message ??
                (signUp ? 'Check your email to confirm your account.' : '')
        );
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
            <form
                onSubmit={submit}
                className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6"
            >
                <div>
                    <h1 className="text-2xl font-semibold">
                        <DesignDBWordmark />
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to save diagrams to your account.
                    </p>
                </div>
                <Input
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    autoComplete={signUp ? 'new-password' : 'current-password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                />
                {message && (
                    <p className="text-sm text-muted-foreground">{message}</p>
                )}
                <Button className="w-full" disabled={busy}>
                    {busy
                        ? 'Please wait…'
                        : signUp
                          ? 'Create account'
                          : 'Sign in'}
                </Button>
                <button
                    type="button"
                    className="w-full text-sm underline"
                    onClick={() => {
                        setSignUp(!signUp);
                        setMessage('');
                    }}
                >
                    {signUp
                        ? 'Already have an account? Sign in'
                        : 'New here? Create an account'}
                </button>
            </form>
        </main>
    );
};
