import type { Database } from 'better-sqlite3';
export type Nested01Result = {
    user_id: number;
    user_name: string;
    post_id: number;
    post_title: string;
};
export declare function nested01(db: Database): Nested01Result[];
export type Nested01NestedUsers = {
    user_id: number;
    user_name: string;
    posts: Nested01NestedPosts[];
};
export type Nested01NestedPosts = {
    post_id: number;
    post_title: string;
};
export declare function nested01Nested(db: Database): Nested01NestedUsers[];
//# sourceMappingURL=nested01.d.ts.map