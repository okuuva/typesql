import type { Database } from 'better-sqlite3';
export type UpdateRolesData = {
    role?: string;
    fk_user?: number;
};
export type UpdateRolesParams = {
    id: number;
};
export type UpdateRolesResult = {
    changes: number;
};
export declare function updateRoles(db: Database, data: UpdateRolesData, params: UpdateRolesParams): UpdateRolesResult;
//# sourceMappingURL=update-roles.d.ts.map