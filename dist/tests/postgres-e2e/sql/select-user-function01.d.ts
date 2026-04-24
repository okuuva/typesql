import pg from 'pg';
export type SelectUserFunction01Result = {
    id: number;
    value: number | null;
};
export declare function selectUserFunction01(client: pg.Client | pg.Pool | pg.PoolClient): Promise<SelectUserFunction01Result[]>;
//# sourceMappingURL=select-user-function01.d.ts.map