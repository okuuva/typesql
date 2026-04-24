import pg from 'pg';
export type SelectFromRolesParams = {
    id: number;
};
export type SelectFromRolesResult = {
    id: number;
    role: string;
    fk_user: number;
};
export declare function selectFromRoles(client: pg.Client | pg.Pool | pg.PoolClient, params: SelectFromRolesParams): Promise<SelectFromRolesResult | null>;
//# sourceMappingURL=select-from-roles.d.ts.map