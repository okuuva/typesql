import pg from 'pg';
export type DynamicQuery04DynamicParams = {
    select?: DynamicQuery04Select;
    where?: DynamicQuery04Where[];
};
export type DynamicQuery04Result = {
    id?: number;
    value?: number;
    id_2?: number;
    name?: string;
    descr?: string;
};
export type DynamicQuery04Select = {
    id?: boolean;
    value?: boolean;
    id_2?: boolean;
    name?: boolean;
    descr?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery04Where = {
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
    column: 'id_2';
    op: NumericOperator;
    value: number | null;
} | {
    column: 'id_2';
    op: SetOperator;
    value: number[];
} | {
    column: 'id_2';
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
    column: 'descr';
    op: StringOperator;
    value: string | null;
} | {
    column: 'descr';
    op: SetOperator;
    value: string[];
} | {
    column: 'descr';
    op: BetweenOperator;
    value: [string | null, string | null];
};
export declare function dynamicQuery04(client: pg.Client | pg.Pool | pg.PoolClient, params?: DynamicQuery04DynamicParams): Promise<DynamicQuery04Result[]>;
export {};
//# sourceMappingURL=dynamic-query04.d.ts.map