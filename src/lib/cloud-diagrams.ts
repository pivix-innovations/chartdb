import type { Diagram } from '@/lib/domain/diagram';
import type { DiagramListItem } from '@/lib/domain/diagram-list-item';
import { DatabaseType } from '@/lib/domain/database-type';
import type { DatabaseEdition } from '@/lib/domain/database-edition';
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
    const payload = {
        name: diagram.name,
        updated_at: new Date().toISOString(),
        diagram,
    };
    const { data: existing, error: readError } = await supabase
        .from(table)
        .select('id')
        .eq('id', diagram.id)
        .maybeSingle();
    if (readError) throw readError;
    const { error } = existing
        ? await supabase.from(table).update(payload).eq('id', diagram.id)
        : await supabase.from(table).insert({
              ...payload,
              id: diagram.id,
              owner_id: user.id,
          });
    if (error) throw error;
};

export const setCloudDiagramShared = async (
    id: string,
    shared: boolean
): Promise<void> => {
    if (!supabase) throw new Error('Cloud storage is not configured.');
    const { error } = await supabase
        .from(table)
        .update({ is_shared: shared })
        .eq('id', id);
    if (error) throw error;
};

export const getCloudDiagramSharing = async (
    id: string
): Promise<{ isShared: boolean; isOwner: boolean }> => {
    if (!supabase) return { isShared: false, isOwner: false };
    const [{ data: row, error }, { data: userData }] = await Promise.all([
        supabase
            .from(table)
            .select('is_shared, owner_id')
            .eq('id', id)
            .maybeSingle(),
        supabase.auth.getUser(),
    ]);
    if (error) throw error;
    return {
        isShared: Boolean(row?.is_shared),
        isOwner: Boolean(row && userData.user?.id === row.owner_id),
    };
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

export const listCloudDiagrams = async (): Promise<DiagramListItem[]> => {
    if (!supabase) return [];
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return [];
    const { data, error } = await supabase
        .from(table)
        .select(
            'id, name, updated_at, owner_id, is_shared, database_type:diagram->>databaseType, database_edition:diagram->>databaseEdition, created_at:diagram->>createdAt'
        )
        .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        databaseType: (row.database_type ??
            DatabaseType.GENERIC) as DatabaseType,
        databaseEdition: row.database_edition as DatabaseEdition | undefined,
        createdAt: new Date(row.created_at ?? row.updated_at),
        updatedAt: new Date(row.updated_at),
        isShared: Boolean(row.is_shared),
        isOwner: row.owner_id === user.id,
    }));
};

export const deleteCloudDiagram = async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
};
