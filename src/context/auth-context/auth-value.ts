import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export interface AuthContextValue {
    session: Session | null;
    loading: boolean;
    configured: boolean;
}

export const authContext = createContext<AuthContextValue>({
    session: null,
    loading: false,
    configured: false,
});
