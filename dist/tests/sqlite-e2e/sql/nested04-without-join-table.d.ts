import type { Database } from 'better-sqlite3';
export type Nested04WithoutJoinTableResult = {
    id: number;
    name: string;
    id_2: number;
    name_2: string;
};
export declare function nested04WithoutJoinTable(db: Database): Nested04WithoutJoinTableResult[];
export type Nested04WithoutJoinTableNestedSurveys = {
    id: number;
    name: string;
    users: Nested04WithoutJoinTableNestedUsers[];
};
export type Nested04WithoutJoinTableNestedUsers = {
    id: number;
    name: string;
};
export declare function nested04WithoutJoinTableNested(db: Database): Nested04WithoutJoinTableNestedSurveys[];
//# sourceMappingURL=nested04-without-join-table.d.ts.map