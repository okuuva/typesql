import pg from 'pg';
export type DynamicQuery05DynamicParams = {
    select?: DynamicQuery05Select;
    where?: DynamicQuery05Where[];
};
export type DynamicQuery05Result = {
    id?: number;
    name?: string;
};
export type DynamicQuery05Select = {
    id?: boolean;
    name?: boolean;
};
declare const NumericOperatorList: readonly ["=", "<>", ">", "<", ">=", "<="];
type NumericOperator = typeof NumericOperatorList[number];
type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';
type SetOperator = 'IN' | 'NOT IN';
type BetweenOperator = 'BETWEEN';
export type DynamicQuery05Where = {
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
export declare function dynamicQuery05(client: pg.Client | pg.Pool | pg.PoolClient, params?: DynamicQuery05DynamicParams): Promise<DynamicQuery05Result[]>;
export {};
//# sourceMappingURL=dynamic-query05.d.ts.map