import type { Database } from 'better-sqlite3';
export type InsertIntoRolesParams = {
    id?: number;
    role?: string;
    fk_user: number;
};
export type InsertIntoRolesResult = {
    changes: number;
    lastInsertRowid: number;
};
export declare function insertIntoRoles(db: Database, params: InsertIntoRolesParams): InsertIntoRolesResult;
//# sourceMappingURL=insert-into-roles.d.ts.map