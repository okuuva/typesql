import type { Database } from 'better-sqlite3';
export type DynamicQuery03DynamicParams = {
    select?: DynamicQuery03Select;
    where?: DynamicQuery03Where[];
};
export type DynamicQuery03Result = {
    id?: number;
    value?: number;
};
export type DynamicQuery03Select = {
    id?: boolean;
    value?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery03Where = {
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
};
export declare function dynamicQuery03(db: Database, params?: DynamicQuery03DynamicParams): DynamicQuery03Result[];
export {};
//# sourceMappingURL=dynamic-query03.d.ts.map