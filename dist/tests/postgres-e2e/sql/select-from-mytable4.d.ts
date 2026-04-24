import pg from 'pg';
export type SelectFromMytable4Result = {
    id: string;
    name: string | null;
    year: number | null;
};
export declare function selectFromMytable4(client: pg.Client | pg.Pool | pg.PoolClient): Promise<SelectFromMytable4Result[]>;
//# sourceMappingURL=select-from-mytable4.d.ts.map