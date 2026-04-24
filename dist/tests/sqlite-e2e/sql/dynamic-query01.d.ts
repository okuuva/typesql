import type { Database } from 'better-sqlite3';
export type DynamicQuery01DynamicParams = {
    select?: DynamicQuery01Select;
    where?: DynamicQuery01Where[];
};
export type DynamicQuery01Result = {
    id?: number;
    value?: number;
    name?: string;
    description?: string;
};
export type DynamicQuery01Select = {
    id?: boolean;
    value?: boolean;
    name?: boolean;
    description?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery01Where = {
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
    column: 'value';
    op: NumericOperator;
    value: number | null;
} | {
    column: 'value';
    op: SetOperator;
    value: number[];
} | {
    column: 'value';
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
} | {
    column: 'description';
    op: StringOperator;
    value: string | null;
} | {
    column: 'description';
    op: SetOperator;
    value: string[];
} | {
    column: 'description';
    op: BetweenOperator;
    value: [string | null, string | null];
};
export declare function dynamicQuery01(db: Database, params?: DynamicQuery01DynamicParams): DynamicQuery01Result[];
export {};
//# sourceMappingURL=dynamic-query01.d.ts.map