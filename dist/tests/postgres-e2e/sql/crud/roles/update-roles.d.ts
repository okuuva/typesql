import pg from 'pg';
export type UpdateRolesData = {
    role?: string;
    fk_user?: number;
};
export type UpdateRolesParams = {
    id: number;
};
export type UpdateRolesResult = {
    id: number;
    role: string;
    fk_user: number;
};
export declare function updateRoles(client: pg.Client | pg.Pool | pg.PoolClient, data: UpdateRolesData, params: UpdateRolesParams): Promise<UpdateRolesResult | null>;
//# sourceMappingURL=update-roles.d.ts.map