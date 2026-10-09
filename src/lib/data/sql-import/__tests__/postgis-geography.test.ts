import { describe, expect, it } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import { exportPostgreSQL } from '@/lib/data/sql-export/export-per-type/postgresql';
import { findDataTypeDataById } from '@/lib/data/data-types/data-types';
import { sqlImportToDiagram } from '../index';

describe('PostGIS geography fields', () => {
    it('offers geography for PostgreSQL but not CockroachDB', () => {
        expect(
            findDataTypeDataById('geography', DatabaseType.POSTGRESQL)
        ).toEqual({ name: 'geography', id: 'geography', usageLevel: 2 });
        expect(
            findDataTypeDataById('geography', DatabaseType.COCKROACHDB)
        ).toBeUndefined();
    });

    it('preserves geography modifiers on PostgreSQL import and export', async () => {
        const diagram = await sqlImportToDiagram({
            sqlContent: `
                CREATE EXTENSION IF NOT EXISTS postgis;
                CREATE TABLE locations (
                    id serial PRIMARY KEY,
                    point geography(Point, 4326) NOT NULL,
                    region geography(Polygon, 4269),
                    untyped geography
                );
            `,
            sourceDatabaseType: DatabaseType.POSTGRESQL,
            targetDatabaseType: DatabaseType.POSTGRESQL,
        });

        const fields = diagram.tables?.[0].fields ?? [];
        expect(fields.find((field) => field.name === 'point')?.type.id).toBe(
            'geography'
        );
        expect(
            fields.find((field) => field.name === 'point')?.spatialTypeModifier
        ).toBe('Point, 4326');
        expect(
            fields.find((field) => field.name === 'region')?.spatialTypeModifier
        ).toBe('Polygon, 4269');
        expect(
            fields.find((field) => field.name === 'untyped')
                ?.spatialTypeModifier
        ).toBeUndefined();

        const sql = exportPostgreSQL({ diagram });
        expect(sql).toContain('CREATE EXTENSION IF NOT EXISTS postgis;');
        expect(sql).toContain('"point" geography(Point, 4326) NOT NULL');
        expect(sql).toContain('"region" geography(Polygon, 4269)');
        expect(sql).toContain('"untyped" geography');
    });
});
