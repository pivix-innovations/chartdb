import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { authContext } from './auth-value';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data } = supabase.auth.onAuthStateChange((_event, next) => {
            setSession(next);
        });
        return () => data.subscription.unsubscribe();
    }, []);

    return (
        <authContext.Provider
            value={{ session, loading, configured: supabaseConfigured }}
        >
            {children}
        </authContext.Provider>
    );
};
