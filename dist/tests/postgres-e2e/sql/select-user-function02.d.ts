import pg from 'pg';
export type SelectUserFunction02Params = {
    id: number;
};
export type SelectUserFunction02Result = {
    id: number;
    value: number | null;
};
export declare function selectUserFunction02(client: pg.Client | pg.Pool | pg.PoolClient, params: SelectUserFunction02Params): Promise<SelectUserFunction02Result | null>;
//# sourceMappingURL=select-user-function02.d.ts.map