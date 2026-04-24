import pg from 'pg';
export type Nested01Result = {
    user_id: number;
    user_name: string;
    post_id: number;
    post_title: string;
};
export type Nested01NestedUsers = {
    user_id: number;
    user_name: string;
    posts: Nested01NestedPosts[];
};
export type Nested01NestedPosts = {
    post_id: number;
    post_title: string;
};
export declare function nested01(client: pg.Client | pg.Pool | pg.PoolClient): Promise<Nested01Result[]>;
export declare function nested01Nested(client: pg.Client | pg.Pool | pg.PoolClient): Promise<Nested01NestedUsers[]>;
//# sourceMappingURL=nested01.d.ts.map