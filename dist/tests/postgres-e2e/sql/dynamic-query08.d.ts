import pg from 'pg';
export type DynamicQuery08DynamicParams = {
    select?: DynamicQuery08Select;
    params: DynamicQuery08Params;
    where?: DynamicQuery08Where[];
};
export type DynamicQuery08Params = {
    param1: number;
    param2: number;
};
export type DynamicQuery08Result = {
    timestamp_not_null_column?: Date;
};
export type DynamicQuery08Select = {
    timestamp_not_null_column?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery08Where = {
    column: 'timestamp_not_null_column';
    op: NumericOperator;
    value: Date | null;
} | {
    column: 'timestamp_not_null_column';
    op: SetOperator;
    value: Date[];
} | {
    column: 'timestamp_not_null_column';
    op: BetweenOperator;
    value: [Date | null, Date | null];
};
export declare function dynamicQuery08(client: pg.Client | pg.Pool | pg.PoolClient, params?: DynamicQuery08DynamicParams): Promise<DynamicQuery08Result[]>;
export {};
//# sourceMappingURL=dynamic-query08.d.ts.map