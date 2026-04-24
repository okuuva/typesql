import pg from 'pg';
export type SelectJsonBuildArray01Result = {
    value1: string[];
    value2: (any | null | string | number)[];
};
export declare function selectJsonBuildArray01(client: pg.Client | pg.Pool | pg.PoolClient): Promise<SelectJsonBuildArray01Result | null>;
//# sourceMappingURL=select-json-build-array01.d.ts.map