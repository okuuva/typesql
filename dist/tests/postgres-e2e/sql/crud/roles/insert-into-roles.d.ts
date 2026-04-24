import pg from 'pg';
export type InsertIntoRolesParams = {
    role?: string;
    fk_user: number;
};
export type InsertIntoRolesResult = {
    id: number;
    role: string;
    fk_user: number;
};
export declare function insertIntoRoles(client: pg.Client | pg.Pool | pg.PoolClient, params: InsertIntoRolesParams): Promise<InsertIntoRolesResult | null>;
//# sourceMappingURL=insert-into-roles.d.ts.map