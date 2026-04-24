import pg from 'pg';
export type Nested03Params = {
    param1: number;
};
export type Nested03Result = {
    id: number;
    id_2: number;
    address: string;
    id_3: number | null;
    address_2: string | null;
};
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
export declare function nested03(client: pg.Client | pg.Pool | pg.PoolClient, params: Nested03Params): Promise<Nested03Result[]>;
export declare function nested03Nested(client: pg.Client | pg.Pool | pg.PoolClient, params: Nested03Params): Promise<Nested03NestedC[]>;
//# sourceMappingURL=nested03.d.ts.map