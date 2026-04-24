import pg from 'pg';
export type Copy02Params = {
    id: string;
    name: string | null;
    year: number | null;
};
export declare function copy02(client: pg.Client | pg.PoolClient, values: Copy02Params[]): Promise<void>;
//# sourceMappingURL=copy02.d.ts.map