import type { DatabaseEdition } from './database-edition';
import type { DatabaseType } from './database-type';

/** Lightweight metadata shown in the open diagram picker. */
export interface DiagramListItem {
    id: string;
    name: string;
    databaseType: DatabaseType;
    databaseEdition?: DatabaseEdition;
    createdAt: Date;
    updatedAt: Date;
    isShared: boolean;
    isOwner: boolean;
}
