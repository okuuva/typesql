import pg from 'pg';
export type DeleteFromRolesParams = {
    id: number;
};
export type DeleteFromRolesResult = {
    id: number;
    role: string;
    fk_user: number;
};
export declare function deleteFromRoles(client: pg.Client | pg.Pool | pg.PoolClient, params: DeleteFromRolesParams): Promise<DeleteFromRolesResult | null>;
//# sourceMappingURL=delete-from-roles.d.ts.map