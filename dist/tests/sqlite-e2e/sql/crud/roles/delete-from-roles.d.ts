import type { Database } from 'better-sqlite3';
export type DeleteFromRolesParams = {
    id: number;
};
export type DeleteFromRolesResult = {
    changes: number;
};
export declare function deleteFromRoles(db: Database, params: DeleteFromRolesParams): DeleteFromRolesResult;
//# sourceMappingURL=delete-from-roles.d.ts.map