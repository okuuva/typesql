import pg from 'pg';
export type Nested04WithoutJoinTableResult = {
    id: number;
    name: string;
    id_2: number;
    name_2: string;
    email: string | null;
};
export type Nested04WithoutJoinTableNestedSurveys = {
    id: number;
    name: string;
    users: Nested04WithoutJoinTableNestedUsers[];
};
export type Nested04WithoutJoinTableNestedUsers = {
    id: number;
    name: string;
    email: string | null;
};
export declare function nested04WithoutJoinTable(client: pg.Client | pg.Pool | pg.PoolClient): Promise<Nested04WithoutJoinTableResult[]>;
export declare function nested04WithoutJoinTableNested(client: pg.Client | pg.Pool | pg.PoolClient): Promise<Nested04WithoutJoinTableNestedSurveys[]>;
//# sourceMappingURL=nested04-without-join-table.d.ts.map