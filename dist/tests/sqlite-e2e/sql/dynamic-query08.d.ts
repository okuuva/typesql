import type { Database } from 'better-sqlite3';
export type DynamicQuery08DynamicParams = {
    select?: DynamicQuery08Select;
    params: DynamicQuery08Params;
    where?: DynamicQuery08Where[];
};
export type DynamicQuery08Params = {
    param1?: Date | null;
    param2?: Date | null;
};
export type DynamicQuery08Result = {
    date1?: string;
    date?: Date;
    date_time?: Date;
};
export type DynamicQuery08Select = {
    date1?: boolean;
    date?: boolean;
    date_time?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery08Where = {
    column: 'date1';
    op: StringOperator;
    value: string | null;
} | {
    column: 'date1';
    op: SetOperator;
    value: string[];
} | {
    column: 'date1';
    op: BetweenOperator;
    value: [string | null, string | null];
} | {
    column: 'date';
    op: NumericOperator;
    value: Date | null;
} | {
    column: 'date';
    op: SetOperator;
    value: Date[];
} | {
    column: 'date';
    op: BetweenOperator;
    value: [Date | null, Date | null];
} | {
    column: 'date_time';
    op: NumericOperator;
    value: Date | null;
} | {
    column: 'date_time';
    op: SetOperator;
    value: Date[];
} | {
    column: 'date_time';
    op: BetweenOperator;
    value: [Date | null, Date | null];
};
export declare function dynamicQuery08(db: Database, params?: DynamicQuery08DynamicParams): DynamicQuery08Result[];
export {};
//# sourceMappingURL=dynamic-query08.d.ts.map