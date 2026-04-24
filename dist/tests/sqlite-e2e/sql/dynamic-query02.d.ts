import type { Database } from 'better-sqlite3';
export type DynamicQuery02DynamicParams = {
    select?: DynamicQuery02Select;
    params: DynamicQuery02Params;
    where?: DynamicQuery02Where[];
};
export type DynamicQuery02Params = {
    subqueryName?: string | null;
};
export type DynamicQuery02Result = {
    id?: number;
    name?: string;
};
export type DynamicQuery02Select = {
    id?: boolean;
    name?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery02Where = {
    column: 'id';
    op: NumericOperator;
    value: number | null;
} | {
    column: 'id';
    op: SetOperator;
    value: number[];
} | {
    column: 'id';
    op: BetweenOperator;
    value: [number | null, number | null];
} | {
    column: 'name';
    op: StringOperator;
    value: string | null;
} | {
    column: 'name';
    op: SetOperator;
    value: string[];
} | {
    column: 'name';
    op: BetweenOperator;
    value: [string | null, string | null];
};
export declare function dynamicQuery02(db: Database, params?: DynamicQuery02DynamicParams): DynamicQuery02Result[];
export {};
//# sourceMappingURL=dynamic-query02.d.ts.map