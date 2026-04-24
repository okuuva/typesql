import type { Database } from 'better-sqlite3';
export type DynamicQuery10DynamicParams = {
    select?: DynamicQuery10Select;
    params: DynamicQuery10Params;
    where?: DynamicQuery10Where[];
};
export type DynamicQuery10Params = {
    name?: string | null;
    limit?: number | null;
    offset?: number | null;
};
export type DynamicQuery10Result = {
    id?: number;
    name?: string;
};
export type DynamicQuery10Select = {
    id?: boolean;
    name?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery10Where = {
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
export declare function dynamicQuery10(db: Database, params?: DynamicQuery10DynamicParams): DynamicQuery10Result[];
export {};
//# sourceMappingURL=dynamic-query10.d.ts.map