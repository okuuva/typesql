import pg from 'pg';
export type SelectJson10Result = {
    result1: Record<string, number | undefined>;
    result2: Record<string, SelectJson10Result2Type | undefined>;
};
export type SelectJson10Result2Type = {
    id: number;
    value: number | null;
};
export declare function selectJson10(client: pg.Client | pg.Pool | pg.PoolClient): Promise<SelectJson10Result | null>;
//# sourceMappingURL=select-json10.d.ts.map