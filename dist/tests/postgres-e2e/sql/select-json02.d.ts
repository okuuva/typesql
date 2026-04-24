import pg from 'pg';
export type SelectJson02Result = {
    sum: SelectJson02SumType;
};
export type SelectJson02SumType = {
    total: string | null;
    count: string;
    coalesce: number;
    nested: SelectJson02SumNestedType[];
};
export type SelectJson02SumNestedType = {
    key1: string;
    key2: number;
};
export declare function selectJson02(client: pg.Client | pg.Pool | pg.PoolClient): Promise<SelectJson02Result[]>;
//# sourceMappingURL=select-json02.d.ts.map