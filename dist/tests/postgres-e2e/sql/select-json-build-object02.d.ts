import pg from 'pg';
export type SelectJsonBuildObject02Result = {
    result: SelectJsonBuildObject02ResultType[];
};
export type SelectJsonBuildObject02ResultType = {
    key: string;
    key2: number;
};
export declare function selectJsonBuildObject02(client: pg.Client | pg.Pool | pg.PoolClient): Promise<SelectJsonBuildObject02Result | null>;
//# sourceMappingURL=select-json-build-object02.d.ts.map