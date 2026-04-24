import pg from 'pg';
export type SelectJsonBuildObject01Result = {
    value1: SelectJsonBuildObject01Value1Type;
    value2: SelectJsonBuildObject01Value2Type;
    value3: SelectJsonBuildObject01Value3Type;
    value4: SelectJsonBuildObject01Value4Type;
};
export type SelectJsonBuildObject01Value1Type = {
    key1: string;
};
export type SelectJsonBuildObject01Value2Type = {
    key2: number;
};
export type SelectJsonBuildObject01Value3Type = {
    key3: string;
};
export type SelectJsonBuildObject01Value4Type = {
    key4: number;
};
export declare function selectJsonBuildObject01(client: pg.Client | pg.Pool | pg.PoolClient): Promise<SelectJsonBuildObject01Result | null>;
//# sourceMappingURL=select-json-build-object01.d.ts.map