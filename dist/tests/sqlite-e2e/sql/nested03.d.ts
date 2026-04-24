import type { Database } from 'better-sqlite3';
export type Nested03Params = {
    param1: number;
};
export type Nested03Result = {
    id: number;
    id_2: number;
    address: string;
    id_3?: number;
    address_2?: string;
};
export declare function nested03(db: Database, params: Nested03Params): Nested03Result[];
export type Nested03NestedC = {
    id: number;
    a1: Nested03NestedA1;
    a2: Nested03NestedA2 | null;
};
export type Nested03NestedA1 = {
    id: number;
    address: string;
};
export type Nested03NestedA2 = {
    id: number;
    address: string;
};
export declare function nested03Nested(db: Database, params: Nested03Params): Nested03NestedC[];
//# sourceMappingURL=nested03.d.ts.map