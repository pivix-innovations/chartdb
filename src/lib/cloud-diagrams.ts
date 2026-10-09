import type { Diagram } from '@/lib/domain/diagram';
import { supabase } from './supabase';

const table = 'user_diagrams';
const saveQueues = new Map<string, Promise<void>>();

const reviveDates = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(reviveDates);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => {
                if (typeof item === 'string' && /(At|Date)$/.test(key)) {
                    const date = new Date(item);
                    if (!Number.isNaN(date.getTime())) return [key, date];
                }
                return [key, reviveDates(item)];
            })
        );
    }
    return value;
};

const writeCloudDiagram = async (diagram: Diagram): Promise<void> => {
    if (!supabase) return;
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('Sign in to save this diagram.');
    const { error } = await supabase.from(table).upsert(
        {
            id: diagram.id,
            owner_id: user.id,
            name: diagram.name,
            updated_at: new Date().toISOString(),
            diagram,
        },
        { onConflict: 'id' }
    );
    if (error) throw error;
};

export const saveCloudDiagram = (diagram: Diagram): Promise<void> => {
    const previous = saveQueues.get(diagram.id) ?? Promise.resolve();
    const next = previous
        .catch(() => undefined)
        .then(() => writeCloudDiagram(diagram));
    saveQueues.set(diagram.id, next);
    void next.then(
        () => {
            if (saveQueues.get(diagram.id) === next)
                saveQueues.delete(diagram.id);
        },
        () => {
            if (saveQueues.get(diagram.id) === next)
                saveQueues.delete(diagram.id);
        }
    );
    return next;
};

export const getCloudDiagram = async (
    id: string
): Promise<Diagram | undefined> => {
    if (!supabase) return undefined;
    const { data, error } = await supabase
        .from(table)
        .select('diagram')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data ? (reviveDates(data.diagram) as Diagram) : undefined;
};

export const listCloudDiagrams = async (): Promise<Diagram[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
        .from(table)
        .select('diagram')
        .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => reviveDates(row.diagram) as Diagram);
};

export const deleteCloudDiagram = async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
};
