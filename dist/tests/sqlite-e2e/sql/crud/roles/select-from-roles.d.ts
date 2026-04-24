import type { Database } from 'better-sqlite3';
export type SelectFromRolesParams = {
    id: number;
};
export type SelectFromRolesResult = {
    id: number;
    role: string;
    fk_user: number;
};
export declare function selectFromRoles(db: Database, params: SelectFromRolesParams): SelectFromRolesResult | null;
//# sourceMappingURL=select-from-roles.d.ts.map